from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from db import get_supabase
from dependencies import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    language: Optional[str] = None
    url: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    url: Optional[str] = None

class MemberAdd(BaseModel):
    user_id: str
    role: Optional[str] = "member"

@router.get("/")
def get_projects(current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    # Yalnızca kullanıcının üyesi olduğu (veya sahibi olduğu) projeleri getir
    # project_members tablosu ile inner join yaparak filtreleriz.
    res = sb.table("projects").select("*, project_members!inner(user_id, role)").eq("project_members.user_id", current_user["id"]).execute()
    return {"data": res.data}

@router.get("/{project_id}")
def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    # Güvenlik: Kullanıcı bu projeye üye mi?
    member_check = sb.table("project_members").select("*").eq("project_id", project_id).eq("user_id", current_user["id"]).execute()
    if not member_check.data:
        raise HTTPException(status_code=403, detail="Bu projeyi görüntüleme yetkiniz yok.")
        
    res = sb.table("projects").select("*").eq("id", project_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Proje bulunamadı")
    return {"data": res.data[0]}

@router.post("/")
def create_project(project: ProjectCreate, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    
    # 1. Projeyi oluştur
    proj_data = project.model_dump()
    proj_data["user_id"] = current_user["id"]
    res = sb.table("projects").insert(proj_data).execute()
    new_project = res.data[0]
    
    # 2. Projeyi oluşturan kişiyi 'owner' (sahip) olarak project_members tablosuna ekle
    sb.table("project_members").insert({
        "project_id": new_project["id"],
        "user_id": current_user["id"],
        "role": "owner"
    }).execute()
    
    # Audit Log
    sb.table("activity_logs").insert({
        "project_id": new_project["id"],
        "user_id": current_user["id"],
        "action": "created_project",
        "details": f"Proje oluşturuldu: {new_project['name']}"
    }).execute()
    
    return {"message": "Proje başarıyla oluşturuldu.", "data": new_project}

@router.put("/{project_id}")
def update_project(project_id: str, project: ProjectUpdate, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    update_data = {k: v for k, v in project.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Güncellenecek veri sağlanmadı.")
        
    res = sb.table("projects").update(update_data).eq("id", project_id).execute()
    return {"message": "Proje güncellendi.", "data": res.data}

@router.delete("/{project_id}")
def delete_project(project_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    # Güvenlik (Basit seviye): Sadece projeyi oluşturan kişi silebilir
    proj = sb.table("projects").select("user_id").eq("id", project_id).execute()
    if proj.data and proj.data[0]["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Bu projeyi sadece sahibi silebilir.")
        
    sb.table("projects").delete().eq("id", project_id).execute()
    return {"message": "Proje silindi."}

# --- TAKIM YÖNETİMİ UÇ NOKTALARI ---

@router.get("/{project_id}/members")
def get_members(project_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    
    # Güvenlik kontrolü
    member_check = sb.table("project_members").select("*").eq("project_id", project_id).eq("user_id", current_user["id"]).execute()
    if not member_check.data:
        raise HTTPException(status_code=403, detail="Bu projenin üyelerini göremezsiniz.")
        
    res = sb.table("project_members").select("*, profiles(full_name, avatar_url)").eq("project_id", project_id).execute()
    return {"data": res.data}

@router.post("/{project_id}/members")
def add_member(project_id: str, member: MemberAdd, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    
    # Güvenlik: Sadece mevcut üyeler yeni birini davet edebilir
    member_check = sb.table("project_members").select("*").eq("project_id", project_id).eq("user_id", current_user["id"]).execute()
    if not member_check.data:
        raise HTTPException(status_code=403, detail="Üye ekleme yetkiniz yok.")
        
    try:
        res = sb.table("project_members").insert({
            "project_id": project_id,
            "user_id": member.user_id,
            "role": member.role
        }).execute()
        
        # Audit Log
        user_res = sb.table("profiles").select("full_name").eq("id", member.user_id).execute()
        member_name = user_res.data[0]["full_name"] if user_res.data else "Biri"
        sb.table("activity_logs").insert({
            "project_id": project_id,
            "user_id": current_user["id"],
            "action": "added_member",
            "details": f"{member_name} takıma eklendi."
        }).execute()
        
        return {"message": "Takım arkadaşı başarıyla eklendi.", "data": res.data[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Bu kullanıcı zaten projeye ekli olabilir.")

@router.delete("/{project_id}/members/{user_id}")
def remove_member(project_id: str, user_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    
    # Kendi kendini projeden çıkarma veya yetkili birinin çıkarması
    if current_user["id"] != user_id:
        # Başkasını çıkarmaya çalışıyorsa owner mi diye bak (basit güvenlik)
        owner_check = sb.table("project_members").select("role").eq("project_id", project_id).eq("user_id", current_user["id"]).execute()
        if not owner_check.data or owner_check.data[0]["role"] != "owner":
            raise HTTPException(status_code=403, detail="Başkalarını çıkarmak için proje sahibi olmalısınız.")
            
    sb.table("project_members").delete().eq("project_id", project_id).eq("user_id", user_id).execute()
    return {"message": "Kullanıcı projeden çıkarıldı."}
