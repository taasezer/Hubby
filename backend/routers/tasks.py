from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from db import get_supabase
from dependencies import get_current_user
import ai_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])

class TaskCreate(BaseModel):
    project_id: str
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    status: Optional[str] = "todo"
    assignee_id: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assignee_id: Optional[str] = None

class CommentCreate(BaseModel):
    content: str

class TaskEvaluateRequest(BaseModel):
    task_id: str

class GenerateRoadmapReq(BaseModel):
    project_id: str
    prompt: str

@router.post("/generate_roadmap")
def generate_roadmap(req: GenerateRoadmapReq, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    
    # Güvenlik kontrolü
    member_check = sb.table("project_members").select("*").eq("project_id", req.project_id).eq("user_id", current_user["id"]).execute()
    if not member_check.data:
        raise HTTPException(status_code=403, detail="Bu projede görev oluşturma yetkiniz yok.")
        
    # Takım üyelerini ve yeteneklerini çek
    members_res = sb.table("project_members").select("user_id, profiles(full_name, role, skills)").eq("project_id", req.project_id).execute()
    team_members = []
    for m in members_res.data:
        prof = m.get("profiles") or {}
        team_members.append({
            "user_id": m.get("user_id"),
            "full_name": prof.get("full_name"),
            "role": prof.get("role"),
            "skills": prof.get("skills")
        })
        
    # AI ile görevleri oluştur
    generated_tasks = ai_service.generate_task_roadmap(req.prompt, team_members)
    
    if not generated_tasks:
        raise HTTPException(status_code=500, detail="Yapay zeka görevleri oluşturamadı.")
        
    # Görevleri veritabanına ekle
    inserted_tasks = []
    for t in generated_tasks:
        task_data = {
            "project_id": req.project_id,
            "title": t.get("title", "İsimsiz Görev"),
            "description": t.get("description", ""),
            "priority": t.get("priority", "medium"),
            "status": "todo",
            "assignee_id": t.get("assignee_id") if t.get("assignee_id") else None
        }
        res = sb.table("tasks").insert(task_data).execute()
        if res.data:
            inserted_task = res.data[0]
            inserted_tasks.append(inserted_task)
            
            # Bildirim Gönderme (Eğer görev başkasına atandıysa)
            if inserted_task.get("assignee_id") and inserted_task.get("assignee_id") != current_user["id"]:
                sb.table("notifications").insert({
                    "user_id": inserted_task["assignee_id"],
                    "content": f"🤖 AI Size yeni bir görev atadı: '{inserted_task['title']}'",
                    "type": "task_assigned"
                }).execute()
            
    # Audit log
    sb.table("activity_logs").insert({
        "project_id": req.project_id,
        "user_id": current_user["id"],
        "action": "generated_roadmap",
        "details": f"AI tarafından {len(inserted_tasks)} görev oluşturuldu."
    }).execute()
    
    return {"message": f"{len(inserted_tasks)} görev başarıyla oluşturuldu.", "data": inserted_tasks}

@router.get("/")
def get_tasks(project_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    
    # Kullanıcının dahil olduğu projeleri bul
    member_res = sb.table("project_members").select("project_id").eq("user_id", current_user["id"]).execute()
    project_ids = [m["project_id"] for m in member_res.data]
    
    if not project_ids:
        return {"data": []}
        
    # En güvenli yöntem sadece * çekmektir. Supabase foreign key hatalarını önler.
    query = sb.table("tasks").select("*")
    
    try:
        if project_id:
            if project_id not in project_ids:
                return {"data": []}
            query = query.eq("project_id", project_id)
        else:
            query = query.in_("project_id", project_ids)
            
        res = query.execute()
        return {"data": res.data}
    except Exception as e:
        print(f"Tasks Table Error: {e}")
        return {"data": []}

@router.post("/")
def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("tasks").insert(task.model_dump()).execute()
    new_task = res.data[0]
    
    # Audit Log
    sb.table("activity_logs").insert({
        "project_id": task.project_id,
        "user_id": current_user["id"],
        "action": "created_task",
        "details": f"Görev oluşturuldu: {task.title}"
    }).execute()
    
    # Bildirim Gönderme (Eğer görev başkasına atandıysa)
    if task.assignee_id and task.assignee_id != current_user["id"]:
        sb.table("notifications").insert({
            "user_id": task.assignee_id,
            "content": f"🎯 Size yeni bir görev atandı: '{task.title}'",
            "type": "task_assigned"
        }).execute()
    
    return {"message": "Görev oluşturuldu", "data": new_task}

@router.put("/{task_id}")
def update_task(task_id: str, task: TaskUpdate, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    
    old_task_res = sb.table("tasks").select("*").eq("id", task_id).execute()
    if not old_task_res.data:
        raise HTTPException(status_code=404, detail="Görev bulunamadı")
    old_task = old_task_res.data[0]

    update_data = {k: v for k, v in task.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Güncellenecek veri yok")
        
    res = sb.table("tasks").update(update_data).eq("id", task_id).execute()
    
    # Sürükle bırak (Durum değişimi) loglaması
    if "status" in update_data and update_data["status"] != old_task.get("status"):
        sb.table("activity_logs").insert({
            "project_id": old_task["project_id"],
            "user_id": current_user["id"],
            "action": "moved_task",
            "details": f"'{old_task['title']}' görevi '{update_data['status']}' aşamasına taşındı."
        }).execute()

    return {"message": "Görev güncellendi", "data": res.data}

@router.delete("/{task_id}")
def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    old_task_res = sb.table("tasks").select("*").eq("id", task_id).execute()
    if old_task_res.data:
        sb.table("activity_logs").insert({
            "project_id": old_task_res.data[0]["project_id"],
            "user_id": current_user["id"],
            "action": "deleted_task",
            "details": f"'{old_task_res.data[0]['title']}' görevi silindi."
        }).execute()

    sb.table("tasks").delete().eq("id", task_id).execute()
    return {"message": "Görev silindi"}

# --- COMMENTS (YORUMLAR) ---
@router.get("/{task_id}/comments")
def get_comments(task_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("task_comments").select("*, profiles(full_name, avatar_url)").eq("task_id", task_id).order("created_at", asc=True).execute()
    return {"data": res.data}

@router.post("/{task_id}/comments")
def add_comment(task_id: str, comment: CommentCreate, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    
    res = sb.table("task_comments").insert({
        "task_id": task_id,
        "user_id": current_user["id"],
        "content": comment.content
    }).execute()
    
    task_res = sb.table("tasks").select("project_id, title").eq("id", task_id).execute()
    if task_res.data:
        sb.table("activity_logs").insert({
            "project_id": task_res.data[0]["project_id"],
            "user_id": current_user["id"],
            "action": "commented",
            "details": f"'{task_res.data[0]['title']}' görevine yorum yaptı."
        }).execute()
        
    return {"message": "Yorum eklendi", "data": res.data[0]}

# --- AI DEĞERLENDİRME ---
@router.post("/evaluate")
def evaluate_task(req: TaskEvaluateRequest, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()

    task_response = sb.table("tasks").select("*, profiles(full_name)").eq("id", req.task_id).execute()
    if not task_response.data:
        raise HTTPException(status_code=404, detail="Görev bulunamadı.")
        
    task = task_response.data[0]
    title = task.get("title", "İsimsiz Görev")
    status = task.get("status", "Bilinmiyor")
    
    profiles_data = task.get("profiles")
    assignee = "Atanmamış"
    if profiles_data:
        if isinstance(profiles_data, list) and len(profiles_data) > 0:
            assignee = profiles_data[0].get("full_name", "Atanmamış")
        elif isinstance(profiles_data, dict):
            assignee = profiles_data.get("full_name", "Atanmamış")

    ai_result = ai_service.evaluate_task_progress(title, status, assignee)
    
    sb.table("tasks").update({
        "ai_score": ai_result.score,
        "ai_feedback": ai_result.feedback
    }).eq("id", req.task_id).execute()
    
    target_user_id = task.get("assignee_id") or current_user["id"]
    notification_content = f"🤖 AI Yöneticisi: '{title}' görevi incelendi. Skor: {ai_result.score}/100. Sonraki Adım: {ai_result.action_item}"
    
    sb.table("notifications").insert({
        "user_id": target_user_id,
        "content": notification_content,
        "type": "ai_insight"
    }).execute()
        
    return {
        "message": "Görev AI tarafından başarıyla değerlendirildi.",
        "evaluation": {
            "score": ai_result.score,
            "feedback": ai_result.feedback,
            "action_item": ai_result.action_item
        }
    }
