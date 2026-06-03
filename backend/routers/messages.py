from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from db import get_supabase
from dependencies import get_current_user

router = APIRouter(prefix="/messages", tags=["Messages"])

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

@router.get("/")
def get_messages(user_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    my_id = current_user["id"]
    
    try:
        if user_id:
            res = sb.table("messages").select("*, sender:sender_id(full_name, avatar_url), receiver:receiver_id(full_name, avatar_url)").or_(
                f"and(sender_id.eq.{my_id},receiver_id.eq.{user_id}),and(sender_id.eq.{user_id},receiver_id.eq.{my_id})"
            ).order("created_at").execute()
            return {"data": res.data}
        else:
            res = sb.table("messages").select("*, sender:sender_id(full_name, avatar_url), receiver:receiver_id(full_name, avatar_url)").or_(
                f"sender_id.eq.{my_id},receiver_id.eq.{my_id}"
            ).order("created_at", asc=False).execute()
            return {"data": res.data}
    except Exception as e:
        print(f"Messages Table Error: {e}")
        return {"data": []}

@router.post("/")
def send_message(msg: MessageCreate, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    
    res = sb.table("messages").insert({
        "sender_id": current_user["id"],
        "receiver_id": msg.receiver_id,
        "content": msg.content
    }).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Mesaj gönderilemedi.")
        
    sender_res = sb.table("profiles").select("full_name").eq("id", current_user["id"]).execute()
    sender_name = sender_res.data[0].get("full_name", "Biri") if sender_res.data else "Biri"
    
    sb.table("notifications").insert({
        "user_id": msg.receiver_id,
        "content": f"{sender_name} size yeni bir mesaj gönderdi.",
        "type": "message"
    }).execute()
    
    return {"message": "Mesaj gönderildi", "data": res.data[0]}

@router.put("/{msg_id}/read")
def mark_read(msg_id: str, current_user: dict = Depends(get_current_user)):
    sb = get_supabase()
    res = sb.table("messages").update({"is_read": True}).eq("id", msg_id).eq("receiver_id", current_user["id"]).execute()
    return {"message": "Okundu işaretlendi"}
