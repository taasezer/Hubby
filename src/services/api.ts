import { createClient } from "@/utils/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error("Yetkilendirme hatası: Kullanıcı oturumu bulunamadı.");
  }

  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    "Authorization": `Bearer ${session.access_token}`
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Bir API hatası oluştu.");
  }

  return response.json();
}

export const api = {
  // Profiles
  searchProfiles: (search: string) => fetchWithAuth(`/profiles/?search=${search}`),
  getMyProfile: () => fetchWithAuth("/profiles/me"),
  updateMyProfile: (data: any) => fetchWithAuth("/profiles/me", { method: "PUT", body: JSON.stringify(data) }),

  // Projects
  getProjects: () => fetchWithAuth("/projects/"),
  getProject: (id: string) => fetchWithAuth(`/projects/${id}`),
  createProject: (data: { name: string; description?: string; language?: string; url?: string }) => 
    fetchWithAuth("/projects/", { method: "POST", body: JSON.stringify(data) }),
  updateProject: (id: string, data: any) => fetchWithAuth(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProject: (id: string) => fetchWithAuth(`/projects/${id}`, { method: "DELETE" }),
  addMember: (projectId: string, userId: string, role: string = "member") => 
    fetchWithAuth(`/projects/${projectId}/members`, { method: "POST", body: JSON.stringify({ user_id: userId, role }) }),
  removeMember: (projectId: string, userId: string) => fetchWithAuth(`/projects/${projectId}/members/${userId}`, { method: "DELETE" }),
  getProjectMembers: (projectId: string) => fetchWithAuth(`/projects/${projectId}/members`),
  
  // Tasks
  getTasks: (projectId?: string) => fetchWithAuth(`/tasks/${projectId ? `?project_id=${projectId}` : ''}`),
  createTask: (data: { project_id: string; title: string; description?: string; priority?: string; status?: string; assignee_id?: string }) => 
    fetchWithAuth("/tasks/", { method: "POST", body: JSON.stringify(data) }),
  updateTask: (taskId: string, data: any) => fetchWithAuth(`/tasks/${taskId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTask: (taskId: string) => fetchWithAuth(`/tasks/${taskId}`, { method: "DELETE" }),
  generateRoadmap: (projectId: string, prompt: string) => 
    fetchWithAuth("/tasks/generate_roadmap", { method: "POST", body: JSON.stringify({ project_id: projectId, prompt }) }),
  
  // AI Evaluation
  evaluateTask: (taskId: string) => fetchWithAuth("/tasks/evaluate", { method: "POST", body: JSON.stringify({ task_id: taskId }) }),
  
  // Comments
  getComments: (taskId: string) => fetchWithAuth(`/tasks/${taskId}/comments`),
  addComment: (taskId: string, content: string) => fetchWithAuth(`/tasks/${taskId}/comments`, { method: "POST", body: JSON.stringify({ content }) }),
  
  // Activities
  getActivities: (projectId?: string) => fetchWithAuth(`/activities/${projectId ? `?project_id=${projectId}` : ''}`),
  
  // Notifications
  getNotifications: () => fetchWithAuth("/notifications/"),
  markNotificationRead: (id: string) => fetchWithAuth(`/notifications/${id}/read`, { method: "PUT" }),
  
  // GitHub
  getGithubRepos: () => fetchWithAuth("/github/repos"),
  getGithubReadme: (ownerRepo: string) => fetchWithAuth(`/github/repos/${ownerRepo}/readme`),
  setupGithubWebhook: (projectId: string, repoFullName: string) => 
    fetchWithAuth("/github/setup-webhook", { method: "POST", body: JSON.stringify({ project_id: projectId, repo_full_name: repoFullName }) }),

  // Search
  search: (q: string) => fetchWithAuth(`/search?q=${encodeURIComponent(q)}`),

  // Messages
  getMessages: (userId?: string) => fetchWithAuth(`/messages/${userId ? `?user_id=${userId}` : ''}`),
  sendMessage: (receiverId: string, content: string) => fetchWithAuth("/messages/", { method: "POST", body: JSON.stringify({ receiver_id: receiverId, content }) }),
  markMessageRead: (msgId: string) => fetchWithAuth(`/messages/${msgId}/read`, { method: "PUT" }),
};
