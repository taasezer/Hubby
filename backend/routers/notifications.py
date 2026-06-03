from fastapi import APIRouter, Depends
from db import get_supabase
from dependencies import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/")
def get_notifications(current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    # Artık user_id'yi dışarıdan almıyoruz, token üzerinden güvenle kendimiz alıyoruz.
    res = sb.table("notifications").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
    return {"data": res.data}

@router.put("/{notification_id}/read")
def mark_notification_as_read(notification_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    # Kullanıcı sadece kendi bildirimini okundu işaretleyebilir
    res = sb.table("notifications").update({"is_read": True}).eq("id", notification_id).eq("user_id", current_user["id"]).execute()
    return {"message": "Bildirim okundu olarak işaretlendi", "data": res.data}
