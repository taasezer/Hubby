from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Optional
from pydantic import BaseModel
import httpx
from db import get_supabase
from dependencies import get_current_user
import logging

router = APIRouter(prefix="/github", tags=["GitHub"])

logger = logging.getLogger(__name__)

class WebhookSetup(BaseModel):
    project_id: str
    repo_full_name: str

@router.get("/repos")
async def get_github_repos(current_user: dict = Depends(get_current_user)):
    """Fetch GitHub repositories for the authenticated user"""
    sb = get_supabase()
    
    # Get user's github token
    res = sb.table("profiles").select("github_token").eq("id", current_user["id"]).execute()
    if not res.data or not res.data[0].get("github_token"):
        raise HTTPException(status_code=400, detail="GitHub token bulunamadı. Lütfen GitHub ile tekrar giriş yapın.")
        
    token = res.data[0]["github_token"]
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user/repos?sort=updated&per_page=100",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github.v3+json"
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="GitHub depoları alınamadı.")
            
        repos = response.json()
        
        # Filter relevant data
        formatted_repos = [
            {
                "id": str(repo["id"]),
                "name": repo["name"],
                "full_name": repo["full_name"],
                "description": repo["description"],
                "url": repo["html_url"],
                "language": repo["language"],
                "updated_at": repo["updated_at"],
                "private": repo["private"]
            } for repo in repos
        ]
        
        return {"data": formatted_repos}


@router.get("/repos/{owner}/{repo}/readme")
async def get_github_readme(owner: str, repo: str, current_user: dict = Depends(get_current_user)):
    """Fetch GitHub README for a repository"""
    sb = get_supabase()
    res = sb.table("profiles").select("github_token").eq("id", current_user["id"]).execute()
    if not res.data or not res.data[0].get("github_token"):
        raise HTTPException(status_code=400, detail="GitHub token bulunamadı.")
        
    token = res.data[0]["github_token"]
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/readme",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github.v3.raw"
                }
            )
            
            if response.status_code == 404:
                return {"data": "Bu proje için bir README dosyası bulunamadı."}
                
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="README alınamadı.")
                
            return {"data": response.text}
    except httpx.RequestError as e:
        print(f"GitHub API Error: {e}")
        raise HTTPException(status_code=500, detail="GitHub API'ye ulaşılamadı.")
    except Exception as e:
        print(f"Unexpected Error: {e}")
        raise HTTPException(status_code=500, detail="Beklenmeyen bir hata oluştu.")

@router.post("/setup-webhook")
async def setup_webhook(payload: WebhookSetup, request: Request, current_user: dict = Depends(get_current_user)):
    """Automatically set up a GitHub webhook for a repository"""
    sb = get_supabase()
    res = sb.table("profiles").select("github_token").eq("id", current_user["id"]).execute()
    if not res.data or not res.data[0].get("github_token"):
        raise HTTPException(status_code=400, detail="GitHub token bulunamadı.")
        
    token = res.data[0]["github_token"]
    
    # We construct the webhook URL assuming ngrok or the production domain
    # For local testing, we'll try to infer it or use a fallback
    base_url = str(request.base_url)
    webhook_url = f"{base_url}github/webhook"
    
    # Note: In a real environment, you need a public URL (like ngrok) for GitHub to reach.
    # For now, we will create it using the provided base URL
    if "localhost" in webhook_url or "127.0.0.1" in webhook_url:
        logger.warning("Localhost URL cannot be reached by GitHub. Webhook creation might fail or not be triggered.")
        # If it's localhost, we might just simulate success to avoid breaking the UI for the user testing it.
        # But we'll still try to send the request (which GitHub might reject).
    
    async with httpx.AsyncClient() as client:
        # Check existing webhooks first
        hooks_response = await client.get(
            f"https://api.github.com/repos/{payload.repo_full_name}/hooks",
            headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.v3+json"}
        )
        
        if hooks_response.status_code == 200:
            hooks = hooks_response.json()
            for hook in hooks:
                if hook.get("config", {}).get("url") == webhook_url:
                    return {"message": "Webhook zaten ayarlı."}
                    
        # Create new webhook
        response = await client.post(
            f"https://api.github.com/repos/{payload.repo_full_name}/hooks",
            headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github.v3+json"},
            json={
                "name": "web",
                "active": True,
                "events": ["push", "pull_request"],
                "config": {
                    "url": webhook_url,
                    "content_type": "json",
                    "insecure_ssl": "0"
                }
            }
        )
        
        if response.status_code not in (200, 201):
            if "localhost" in webhook_url:
                # Mock success for localhost
                return {"message": "Localhost ortamında webhook simüle edildi.", "simulated": True}
            raise HTTPException(status_code=response.status_code, detail=f"Webhook oluşturulamadı: {response.text}")
            
        return {"message": "Webhook başarıyla oluşturuldu."}


@router.post("/webhook")
async def github_webhook(request: Request):
    """Receive webhook events from GitHub"""
    event = request.headers.get("x-github-event")
    
    if event == "ping":
        return {"message": "pong"}
        
    if event == "push":
        payload = await request.json()
        commits = payload.get("commits", [])
        repository = payload.get("repository", {})
        repo_url = repository.get("html_url")
        
        if not commits or not repo_url:
            return {"message": "No commits or repository URL found"}
            
        sb = get_supabase()
        
        # Find the project associated with this repo URL
        proj_res = sb.table("projects").select("id").eq("url", repo_url).execute()
        if not proj_res.data:
            return {"message": "Project not found for this repository"}
            
        project_id = proj_res.data[0]["id"]
        
        # Check commits for task IDs
        # Format we expect: "Fixes #uuid" or "Completes task uuid"
        # Since UUIDs are long, maybe we can just look for UUID regex
        import re
        uuid_pattern = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', re.I)
        
        tasks_completed = 0
        for commit in commits:
            message = commit.get("message", "")
            matches = uuid_pattern.findall(message)
            for task_id in matches:
                # Mark task as completed
                update_res = sb.table("tasks").update({"status": "completed"}).eq("id", task_id).eq("project_id", project_id).execute()
                
                if update_res.data:
                    tasks_completed += 1
                    # Log activity
                    sb.table("activity_logs").insert({
                        "project_id": project_id,
                        "action": "completed_via_commit",
                        "details": f"Görev GitHub commit'i ile tamamlandı: {commit.get('id')[:7]}"
                    }).execute()
                    
        return {"message": f"Processed push. Completed {tasks_completed} tasks."}
        
    return {"message": "Event ignored"}
