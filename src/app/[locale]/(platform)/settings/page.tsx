"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { motion } from "framer-motion";
import { User, GitBranch, Save, Loader2, Code } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillsText, setSkillsText] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.getMyProfile();
      setProfile(res.data);
      if (res.data?.skills) {
        setSkillsText(res.data.skills.join(", "));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skills = skillsText.split(",").map(s => s.trim()).filter(s => s !== "");
      await api.updateMyProfile({
        full_name: profile.full_name,
        role: profile.role,
        skills
      });
      alert("Profil güncellendi.");
    } catch (err) {
      alert("Güncelleme başarısız.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto h-full overflow-y-auto">
      <h1 className="text-3xl font-black mb-8">Ayarlar</h1>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
          <User className="text-crimson" /> Profil Bilgileri
        </h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center gap-6 mb-6">
            <img 
              src={profile?.avatar_url || "https://github.com/ghost.png"} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full border border-border/50"
            />
            <div>
              <p className="font-bold text-lg">{profile?.github_username || "GitHub Kullanıcısı"}</p>
              <p className="text-sm text-muted-foreground">Profil fotoğrafınız GitHub üzerinden alınmaktadır.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Ad Soyad</label>
            <input 
              type="text" 
              value={profile?.full_name || ""}
              onChange={e => setProfile({...profile, full_name: e.target.value})}
              className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 flex items-center gap-1.5"><Code size={14} /> Yetenekler ve Rol</label>
            <p className="text-xs text-muted-foreground ml-1 mb-2">Bu bilgiler yapay zekanın size uygun görev ataması yapabilmesi için kullanılacaktır.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input 
                  type="text" 
                  value={profile?.role || ""}
                  onChange={e => setProfile({...profile, role: e.target.value})}
                  placeholder="Rolünüz (Örn: Frontend Developer)"
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30"
                />
              </div>
              <div>
                <input 
                  type="text" 
                  value={skillsText}
                  onChange={e => setSkillsText(e.target.value)}
                  placeholder="Yetenekler (Örn: React, Node, Python)"
                  className="w-full bg-foreground/5 border border-border/50 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-foreground/30"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Kaydet
            </button>
          </div>
        </form>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-border/50 pb-4">
          <GitBranch className="text-foreground" /> Entegrasyonlar
        </h2>
        
        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <GitBranch size={24} className="text-emerald-500" />
            <div>
              <p className="font-bold text-sm text-emerald-500">GitHub Bağlı</p>
              <p className="text-xs text-muted-foreground">Depolarınıza ve commit loglarınıza erişim sağlanıyor.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">Aktif</span>
        </div>
      </motion.div>
    </div>
  );
}
