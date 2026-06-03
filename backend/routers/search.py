from fastapi import APIRouter, Depends
from db import get_supabase
from dependencies import get_current_user

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/")
def search(q: str, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    user_id = current_user["id"]
    
    # Sadece kullanıcının üye olduğu projeler
    member_res = sb.table("project_members").select("project_id").eq("user_id", user_id).execute()
    project_ids = [m["project_id"] for m in member_res.data]
    
    if not project_ids:
        return {"data": {"projects": [], "tasks": []}}
        
    projects_res = sb.table("projects").select("id, name").in_("id", project_ids).ilike("name", f"%{q}%").limit(5).execute()
    
    # Görevleri ara
    tasks_res = sb.table("tasks").select("id, title, project_id, status").in_("project_id", project_ids).ilike("title", f"%{q}%").limit(5).execute()
    
    return {
        "data": {
            "projects": projects_res.data,
            "tasks": tasks_res.data
        }
    }
