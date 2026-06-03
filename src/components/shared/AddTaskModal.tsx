"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, UserPlus } from "lucide-react";
import { api } from "@/services/api";

interface AddTaskModalProps {
  onClose: () => void;
  onSuccess: () => void;
  projectId?: string;
}

export function AddTaskModal({ onClose, onSuccess, projectId }: AddTaskModalProps) {
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
  
  // Manual Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState("");
  
  // AI Form
  const [aiPrompt, setAiPrompt] = useState("");
  
  // Data
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || "");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTeamMembers(selectedProjectId);
    } else {
      setTeamMembers([]);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.data);
      if (!selectedProjectId && res.data.length > 0) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeamMembers = async (pid: string) => {
    try {
      const res = await api.getProjectMembers(pid);
      setTeamMembers(res.data || []);
    } catch (err) {
      console.error("Takım üyeleri çekilemedi", err);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setLoading(true);

    try {
      let targetId = selectedProjectId;
      if (!targetId) {
        const newProjRes = await api.createProject({ name: "Kişisel Alan", description: "Otomatik oluşturulan çalışma alanı." });
        targetId = newProjRes.data.id;
      }

      await api.createTask({
        project_id: targetId,
        title,
        description,
        priority,
        status: "todo",
        assignee_id: assigneeId || undefined
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Görev oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt) {
      alert("Lütfen AI için bir komut girin.");
      return;
    }
    setLoading(true);

    try {
      let targetId = selectedProjectId;
      if (!targetId) {
        const newProjRes = await api.createProject({ name: "Kişisel Alan", description: "Otomatik oluşturulan çalışma alanı." });
        targetId = newProjRes.data.id;
      }
      
      await api.generateRoadmap(targetId, aiPrompt);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Yapay zeka yol haritası oluşturamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="glass-card w-full max-w-md flex flex-col rounded-2xl border border-border/50 overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-5 border-b border-border/50 bg-foreground/[0.02]">
            <h2 className="text-xl font-black tracking-tight">Yeni Görev Ekle</h2>
            <button onClick={onClose} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex p-2 bg-foreground/5 mx-6 mt-6 rounded-xl">
            <button
              onClick={() => setActiveTab("manual")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === "manual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Manuel Görev
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === "ai" ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Sparkles size={14} /> AI Yol Haritası
            </button>
          </div>

          {activeTab === "manual" ? (
            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1">Proje</label>
                <select 
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30"
                >
                  <option value="" className="bg-background">Kişisel Alan (Otomatik Oluştur)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-background">{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1">Görev Başlığı</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Örn: Login sayfasını kodla" 
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1">Açıklama (Opsiyonel)</label>
                <textarea 
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Görev detayları..." 
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30 custom-scrollbar"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1">Öncelik</label>
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30"
                >
                  <option value="low" className="bg-background">Düşük</option>
                  <option value="medium" className="bg-background">Orta</option>
                  <option value="high" className="bg-background">Yüksek</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1">Kime Atanacak?</label>
                <select 
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30"
                >
                  <option value="" className="bg-background">Bana Ata (veya Seçilmedi)</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.user_id} className="bg-background">
                      {member.profiles?.full_name || "İsimsiz Kullanıcı"}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 bg-foreground text-background font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Görevi Oluştur"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAIGenerate} className="p-6 space-y-4">
               <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1">Proje Seçin</label>
                <select 
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30"
                >
                  <option value="" className="bg-background">Kişisel Alan (Otomatik Oluştur)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-background">{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold ml-1 text-purple-400 flex items-center gap-1">
                  <Sparkles size={14} /> Ne yapmak istiyorsunuz?
                </label>
                <textarea 
                  required
                  autoFocus
                  rows={4}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Örn: Kullanıcıların şifremi unuttum akışını tasarla ve backend entegrasyonlarını yap..." 
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30 custom-scrollbar"
                />
                <p className="text-xs text-muted-foreground ml-1 mt-2">
                  Yapay zeka projenizdeki yetenekleri analiz edip bu hedefi küçük görevlere bölecek ve doğru kişilere atayacaktır.
                </p>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "AI ile Görevleri Üret"}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
