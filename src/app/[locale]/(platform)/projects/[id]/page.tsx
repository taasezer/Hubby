"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { Map, Users, Activity, ExternalLink, ArrowLeft, GitBranch, CheckCircle, Clock, Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { AddTaskModal } from "@/components/shared/AddTaskModal";
import { AddMemberModal } from "@/components/shared/AddMemberModal";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("readme");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, tasksRes, membersRes] = await Promise.all([
        api.getProjects(), // We filter it client-side since there's no single project endpoint yet
        api.getTasks(projectId),
        api.getProjectMembers(projectId)
      ]);
      
      const foundProj = projRes.data.find((p: any) => p.id === projectId);
      setProject(foundProj);
      setTasks(tasksRes.data || []);
      setTeam(membersRes.data || []);

      if (foundProj && foundProj.url) {
        try {
          // Extract owner and repo from github url
          const urlParts = foundProj.url.replace("https://github.com/", "").split("/");
          if (urlParts.length >= 2) {
            const ownerRepo = `${urlParts[0]}/${urlParts[1]}`;
            const readmeRes = await api.getGithubReadme(ownerRepo);
            setReadmeContent(readmeRes.data);
          }
        } catch (e) {
          console.error("Readme error", e);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm("Bu projeyi silmek istediğinize emin misiniz? Tüm görevler ve veriler kalıcı olarak silinecektir.")) {
      try {
        await api.deleteProject(projectId);
        router.push("/projects");
      } catch (e: any) {
        alert(e.message || "Proje silinirken hata oluştu.");
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm("Bu görevi silmek istediğinize emin misiniz?")) {
      try {
        await api.deleteTask(taskId);
        fetchProjectData();
      } catch (e: any) {
        alert(e.message || "Görev silinirken hata oluştu.");
      }
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center items-center h-full">Yükleniyor...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center">Proje bulunamadı.</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <button 
        onClick={() => router.push("/projects")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Projelere Dön
      </button>

      <div className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <GitBranch size={24} />
              </div>
              <h1 className="text-3xl font-black">{project.name}</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">{project.description || "Bu proje için bir açıklama bulunmuyor."}</p>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-foreground/10 rounded-lg text-sm font-bold flex items-center">
              {project.language || "Bilinmeyen Dil"}
            </span>
            {project.url && (
              <a href={project.url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-500/30 transition-colors">
                <ExternalLink size={16} /> GitHub
              </a>
            )}
            <button 
              onClick={handleDeleteProject}
              className="px-3 py-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} /> Sil
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-border/50 pb-px">
        <button 
          onClick={() => setActiveTab("readme")}
          className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "readme" ? "border-emerald-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          README
        </button>
        <button 
          onClick={() => setActiveTab("roadmap")}
          className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "roadmap" ? "border-emerald-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Yol Haritası (Roadmap)
        </button>
        <button 
          onClick={() => setActiveTab("team")}
          className={`pb-3 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === "team" ? "border-emerald-500 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Takım Üyeleri
        </button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === "readme" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 md:p-8">
            {readmeContent ? (
              <div className="prose prose-invert max-w-none">
                {/* Geçici çözüm: raw markdown gösteriyoruz çünkü react-markdown kurulamadı */}
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-x-auto text-muted-foreground custom-scrollbar bg-foreground/5 p-4 rounded-xl border border-white/5">
                  {readmeContent}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground font-medium">Bu proje için README bulunamadı veya yükleniyor.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "roadmap" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Proje Aşamaları</h3>
              <button 
                onClick={() => setIsTaskModalOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/25 transition-all"
              >
                AI ile Görev / Roadmap Üret
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12 glass-card rounded-2xl border-dashed">
                <Map size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
                <p className="text-muted-foreground font-medium">Bu proje için henüz bir yol haritası veya görev oluşturulmadı.</p>
                <p className="text-sm text-muted-foreground mt-2">Sağ üstteki butondan yapay zeka ile hemen oluşturabilirsiniz.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-border/50 ml-4 pl-6 space-y-8 py-4">
                {tasks.map((task, idx) => (
                  <div key={task.id} className="relative">
                    <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-background ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-blue-500' : 'bg-foreground/20'}`}>
                      {task.status === 'completed' ? <CheckCircle size={12} className="text-background" /> : <Clock size={12} className="text-background" />}
                    </div>
                    <div className="glass-card rounded-xl p-5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-lg font-bold pr-4 ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${task.priority === 'urgent' ? 'bg-red-500/20 text-red-400' : task.priority === 'high' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {task.priority}
                          </span>
                          <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                            title="Görevi Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                      
                      {task.profiles && (
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <img src={task.profiles?.avatar_url || "https://github.com/identicons/hubby.png"} alt="assignee" className="w-5 h-5 rounded-full" />
                          <span>{task.profiles?.full_name} ilgileniyor</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "team" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Takım Üyeleri</h3>
              <button 
                onClick={() => setIsMemberModalOpen(true)}
                className="px-4 py-2 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              >
                + Üye Ekle
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {team.map((member) => (
                <div key={member.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                  <img src={member.profiles?.avatar_url || "https://github.com/identicons/hubby.png"} className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="font-bold">{member.profiles?.full_name || "İsimsiz Kullanıcı"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

      {isTaskModalOpen && (
        <AddTaskModal 
          onClose={() => setIsTaskModalOpen(false)} 
          onSuccess={() => fetchProjectData()} 
        />
      )}

      {isMemberModalOpen && (
        <AddMemberModal 
          projectId={projectId}
          onClose={() => setIsMemberModalOpen(false)} 
          onSuccess={() => {
            setIsMemberModalOpen(false);
            fetchProjectData();
          }} 
        />
      )}
    </div>
  );
}
