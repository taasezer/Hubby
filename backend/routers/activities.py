from fastapi import APIRouter, Depends
from typing import Optional
from db import get_supabase
from dependencies import get_current_user

router = APIRouter(prefix="/activities", tags=["Activities"])

@router.get("/")
def get_activities(project_id: Optional[str] = None, limit: int = 50, current_user: dict = Depends(get_current_user)):
    """Bir projeye ait veya kullanıcının dahil olduğu tüm projelere ait aktivite geçmişini getirir."""
    sb = get_supabase()
    
    if project_id:
        res = sb.table("activity_logs").select("*, profiles(full_name, avatar_url)").eq("project_id", project_id).order("created_at", desc=True).limit(limit).execute()
        return {"data": res.data}
    else:
        # Kullanıcının dahil olduğu projeleri bul
        member_res = sb.table("project_members").select("project_id").eq("user_id", current_user["id"]).execute()
        project_ids = [m["project_id"] for m in member_res.data]
        
        if not project_ids:
            return {"data": []}
            
        res = sb.table("activity_logs").select("*, profiles(full_name, avatar_url)").in_("project_id", project_ids).order("created_at", desc=True).limit(limit).execute()
        return {"data": res.data}
