from fastapi import Header, HTTPException
from db import get_supabase

def get_current_user(authorization: str = Header(None)):
    """
    FastAPI Dependency (Guard) to verify the Supabase JWT token from the frontend.
    Extracts the user from the Bearer token.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Yetkilendirme başlığı eksik. Lütfen giriş yapın.")
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Geçersiz yetkilendirme başlığı formatı. 'Bearer <token>' şeklinde olmalıdır.")
    
    token = parts[1]
    sb = get_supabase()
    
    try:
        # Supabase API üzerinden token'ı doğrula ve kullanıcıyı al
        res = sb.auth.get_user(token)
        if not res or not res.user:
            raise Exception("Geçersiz veya süresi dolmuş token.")
        
        # Self-healing: Check if profile exists, if not, create it
        profile_res = sb.table("profiles").select("id").eq("id", res.user.id).execute()
        if not profile_res.data:
            print(f"Profile missing for {res.user.id}, auto-creating...")
            full_name = res.user.user_metadata.get("full_name") or res.user.email.split("@")[0]
            avatar_url = res.user.user_metadata.get("avatar_url") or ""
            github_username = res.user.user_metadata.get("user_name") or ""
            
            try:
                sb.table("profiles").insert({
                    "id": res.user.id,
                    "full_name": full_name,
                    "avatar_url": avatar_url,
                    "github_username": github_username,
                    "role": "developer"
                }).execute()
            except Exception as e:
                print(f"Auto-create profile failed: {e}")

        # Kullanıcı bilgilerini döndür (API uç noktalarında kullanılacak)
        return {
            "id": res.user.id,
            "email": res.user.email
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Oturum geçersiz: {str(e)}")
