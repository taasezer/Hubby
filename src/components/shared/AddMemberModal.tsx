"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Search, UserPlus } from "lucide-react";
import { api } from "@/services/api";

interface AddMemberModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddMemberModal({ projectId, onClose, onSuccess }: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.searchProfiles(searchQuery);
        setResults(res.data || []);
      } catch (err) {
        console.error("Arama hatası", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddMember = async (userId: string) => {
    setAddingId(userId);
    try {
      await api.addMember(projectId, userId);
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Eklenirken bir hata oluştu.");
    } finally {
      setAddingId(null);
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
            <h2 className="text-xl font-black tracking-tight">Takım Arkadaşı Ekle</h2>
            <button onClick={onClose} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                autoFocus
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="İsim veya GitHub kullanıcı adı ara..." 
                className="w-full bg-foreground/5 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-foreground/30"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
              {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
              ) : results.length > 0 ? (
                results.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-foreground/5 border border-transparent hover:border-border/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar_url || "https://github.com/identicons/hubby.png"} className="w-10 h-10 rounded-full" alt="avatar" />
                      <div>
                        <p className="font-bold text-sm">{user.full_name || "İsimsiz"}</p>
                        <p className="text-xs text-muted-foreground">@{user.github_username}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAddMember(user.id)}
                      disabled={addingId === user.id}
                      className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                    >
                      {addingId === user.id ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                    </button>
                  </div>
                ))
              ) : searchQuery.length >= 2 ? (
                <p className="text-center text-sm text-muted-foreground py-4">Kullanıcı bulunamadı.</p>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">Aramaya başlamak için en az 2 karakter girin.</p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
