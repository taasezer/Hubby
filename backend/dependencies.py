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
        
        # Kullanıcı bilgilerini döndür (API uç noktalarında kullanılacak)
        return {
            "id": res.user.id,
            "email": res.user.email
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Oturum geçersiz: {str(e)}")
