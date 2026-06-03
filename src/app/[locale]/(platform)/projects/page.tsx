"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Search, GitBranch, Plus, ExternalLink, Users, AlertCircle, RefreshCw, User } from "lucide-react";
import { useRouter } from "@/i18n/routing";

export default function ProjectsPage() {
  const router = useRouter();
  const [repos, setRepos] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [importingRepo, setImportingRepo] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reposRes, projectsRes] = await Promise.all([
        api.getGithubRepos(),
        api.getProjects()
      ]);
      setRepos(reposRes.data);
      setProjects(projectsRes.data);
    } catch (err: any) {
      setError(err.message || "Depolar yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const executeImport = async (repo: any, isTeam: boolean) => {
    try {
      // 1. Create project
      const newProj = await api.createProject({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        url: repo.url
      });

      // 2. Setup GitHub Webhook
      try {
        await api.setupGithubWebhook(newProj.data.id, repo.full_name);
      } catch (hookErr: any) {
        console.warn("Webhook kurulumu başarısız:", hookErr);
      }
      
      setImportingRepo(null);

      // Eğer takım projesiyse takım sayfasına yönlendir ki insanları davet etsin
      if (isTeam) {
        router.push(`/team?project=${newProj.data.id}`);
      } else {
        router.push(`/projects/${newProj.data.id}`);
      }
    } catch (err: any) {
      alert("Proje içe aktarılırken hata: " + err.message);
      setImportingRepo(null);
    }
  };

  const isImported = (repoUrl: string) => {
    return projects.some(p => p.url === repoUrl);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2">Depolar ve Projeler</h1>
          <p className="text-muted-foreground font-medium">
            GitHub depolarınızı Hubby'ye aktarın ve yönetin.
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-lg font-medium transition-colors"
        >
          <RefreshCw size={16} />
          <span>Yenile</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-red-500">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => {
          const imported = isImported(repo.url);
          const project = imported ? projects.find(p => p.url === repo.url) : null;

          return (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6 flex flex-col relative overflow-hidden group cursor-pointer hover:border-white/20 transition-all duration-300"
              onClick={() => {
                if (imported && project) {
                  router.push(`/projects/${project.id}`);
                }
              }}
            >
              {imported && (
                <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-emerald-500/30">
                  İçe Aktarıldı
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <GitBranch size={24} className={imported ? "text-emerald-400" : "text-foreground"} />
                <h3 className="font-bold text-lg truncate flex-1">{repo.name}</h3>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-2">
                {repo.description || "Açıklama bulunmuyor."}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-foreground/5">
                  {repo.language || "Bilinmiyor"}
                </span>
                
                {!imported && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImportingRepo(repo); }}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-foreground text-background hover:bg-foreground/90 rounded-lg text-sm font-bold transition-colors"
                  >
                    <Plus size={14} />
                    Projeye Çevir
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {importingRepo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-2">Nasıl devam etmek istiyorsunuz?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                "{importingRepo.name}" projesini içe aktarıyorsunuz. Bu projeyi tek başınıza mı yürüteceksiniz, yoksa bir ekiple mi?
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  onClick={() => executeImport(importingRepo, false)}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <User size={24} />
                  </div>
                  <span className="font-bold text-sm">Kişisel Proje</span>
                  <span className="text-xs text-muted-foreground text-center">Sadece ben çalışacağım</span>
                </button>
                
                <button 
                  onClick={() => executeImport(importingRepo, true)}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Users size={24} />
                  </div>
                  <span className="font-bold text-sm">Ekip Projesi</span>
                  <span className="text-xs text-muted-foreground text-center">Çalışma arkadaşları davet et</span>
                </button>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => setImportingRepo(null)}
                  className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  İptal Et
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
