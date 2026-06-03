"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { Search, Users, UserPlus, X, Loader2, Code, Shield } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function TeamPage() {
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("project") || "";

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTeamMembers();
    } else {
      setTeamMembers([]);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.data || []);
      if (!selectedProjectId && res.data && res.data.length > 0) {
        setSelectedProjectId(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const res = await api.getProject(selectedProjectId);
      // Wait, getProject returns project info but we need members. 
      // api.getProjects() includes project_members inside projects.
      const projectsRes = await api.getProjects();
      const proj = projectsRes.data.find((p: any) => p.id === selectedProjectId);
      if (proj && proj.project_members) {
        setTeamMembers(proj.project_members);
      } else {
        setTeamMembers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const res = await api.searchProfiles(searchQuery);
      setSearchResults(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedProjectId) return;
    try {
      await api.addMember(selectedProjectId, userId);
      alert("Üye eklendi.");
      setSearchQuery("");
      setSearchResults([]);
      fetchTeamMembers();
    } catch (err: any) {
      alert("Hata: " + (err.message || "Üye eklenemedi."));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedProjectId) return;
    if (!confirm("Bu üyeyi projeden çıkarmak istediğinize emin misiniz?")) return;
    try {
      await api.removeMember(selectedProjectId, userId);
      fetchTeamMembers();
    } catch (err: any) {
      alert("Hata: " + err.message);
    }
  };

  if (loading && projects.length === 0) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2"><Users className="text-crimson" /> Takım Yönetimi</h1>
          <p className="text-muted-foreground font-medium">Projelerinizdeki takım arkadaşlarınızı yönetin ve yeni üyeler davet edin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="mb-6">
              <label className="text-sm font-bold ml-1 mb-2 block">Proje Seçin</label>
              <select 
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30"
              >
                <option value="" disabled className="bg-background">Bir proje seçin...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-background">{p.name}</option>
                ))}
              </select>
            </div>

            <h3 className="text-lg font-bold mb-4 border-b border-border/50 pb-2">Mevcut Üyeler</h3>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground"><Loader2 size={24} className="animate-spin mx-auto" /></div>
            ) : teamMembers.length > 0 ? (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {/* If we had full names here we'd show initials */}
                        <UserPlus size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Kullanıcı ID: <span className="font-mono text-xs text-muted-foreground">{member.user_id.substring(0, 8)}...</span></p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 flex items-center gap-1">
                            <Shield size={10} /> {member.role === 'owner' ? 'Kurucu' : 'Üye'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveMember(member.user_id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      title="Projeden Çıkar"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Bu projede henüz kimse yok veya proje seçilmedi.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-6 sticky top-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus size={18} className="text-emerald-400" /> Üye Davet Et
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Hubby platformundaki diğer geliştiricileri ismine veya GitHub kullanıcı adına göre arayarak projenize dahil edin.</p>
            
            <form onSubmit={handleSearch} className="mb-6 relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="İsim veya kullanıcı adı ara..." 
                className="w-full bg-foreground/5 border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30"
              />
              <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
              <button type="submit" className="hidden" />
            </form>

            <div className="space-y-3">
              {searching ? (
                <div className="text-center py-4"><Loader2 size={18} className="animate-spin mx-auto text-muted-foreground" /></div>
              ) : searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div key={user.id} className="flex flex-col gap-2 p-3 bg-foreground/5 border border-border/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar_url || "https://github.com/ghost.png"} alt="" className="w-8 h-8 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{user.full_name || user.github_username}</p>
                        <p className="text-xs text-muted-foreground truncate">@{user.github_username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddMember(user.id)}
                      disabled={!selectedProjectId}
                      className="w-full py-1.5 bg-foreground text-background text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                    >
                      Ekle
                    </button>
                  </div>
                ))
              ) : searchQuery.length >= 2 ? (
                <p className="text-xs text-muted-foreground text-center">Sonuç bulunamadı.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
