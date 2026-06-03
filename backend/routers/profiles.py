from fastapi import APIRouter, Depends
from typing import Optional
from db import get_supabase
from dependencies import get_current_user

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.get("/")
def search_profiles(search: str, current_user: dict = Depends(get_current_user)):
    """Takım arkadaşı eklemek için isim veya GitHub kullanıcı adına göre arama yapar."""
    sb = get_supabase()
    
    if len(search) < 2:
        return {"data": []}

    # Supabase 'or' syntax: f"full_name.ilike.%{search}%,github_username.ilike.%{search}%"
    res = sb.table("profiles").select("id, full_name, avatar_url, github_username").or_(
        f"full_name.ilike.%{search}%,github_username.ilike.%{search}%"
    ).limit(10).execute()
    
    return {"data": res.data}
from pydantic import BaseModel

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None
    skills: Optional[list[str]] = None

@router.get("/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("profiles").select("*").eq("id", current_user["id"]).execute()
    if not res.data:
        return {"data": {}}
    return {"data": res.data[0]}

@router.put("/me")
def update_my_profile(profile: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    update_data = {k: v for k, v in profile.model_dump().items() if v is not None}
    if not update_data:
        return {"message": "Güncellenecek veri yok."}
    
    res = sb.table("profiles").update(update_data).eq("id", current_user["id"]).execute()
    return {"message": "Profil başarıyla güncellendi.", "data": res.data[0] if res.data else None}
