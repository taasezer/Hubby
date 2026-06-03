import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load env variables BEFORE importing routers that depend on them
load_dotenv(dotenv_path="../.env")

# Import our new organized routers
from routers import projects, tasks, notifications, profiles, activities, github, search, messages

app = FastAPI(title="Hubby AI Backend API", description="Tam teşekküllü Python REST API")

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:3000"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(notifications.router)
app.include_router(profiles.router)
app.include_router(activities.router)
app.include_router(github.router)
app.include_router(search.router)
app.include_router(messages.router)

@app.get("/")
def read_root():
    return {"message": "Hubby FastAPI Backend is running with full CRUD!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
