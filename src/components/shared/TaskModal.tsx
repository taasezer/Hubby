"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User as UserIcon } from "lucide-react";
import { api } from "@/services/api";

export function TaskModal({ task, onClose, onDelete }: { task: any, onClose: () => void, onDelete?: () => void }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (task) {
      fetchComments();
    }
  }, [task]);

  const fetchComments = async () => {
    try {
      const res = await api.getComments(task.id);
      setComments(res.data || []);
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.addComment(task.id, newComment);
      setNewComment("");
      fetchComments();
    } catch (e) {
      console.log(e);
    }
  };

  const handleEvaluateAI = async () => {
    setLoadingAi(true);
    try {
      const res = await api.evaluateTask(task.id);
      setAiInsight(res.evaluation);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Bu görevi silmek istediğinize emin misiniz?")) {
      try {
        await api.deleteTask(task.id);
        if (onDelete) onDelete();
        else onClose();
      } catch (e: any) {
        alert("Görev silinirken hata oluştu.");
      }
    }
  };

  if (!task) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
          className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border/50 overflow-hidden shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-foreground/[0.02]">
            <div>
              <h2 className="text-2xl font-black">{task.title}</h2>
              <span className="text-xs font-bold px-2 py-1 bg-foreground/10 rounded-md uppercase tracking-wide mt-2 inline-block">
                {task.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDelete} className="px-3 py-1.5 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                Sil
              </button>
              <button onClick={onClose} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div>
              <h3 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Açıklama</h3>
              <p className="text-sm font-medium leading-relaxed">{task.description || "Açıklama bulunmuyor."}</p>
            </div>

            <div className="glass p-5 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-blue-500/5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
              <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-sm font-bold flex items-center gap-2 text-purple-400">
                  <Bot size={18} /> Yapay Zeka Analizi
                </h3>
                {!aiInsight && (
                  <button onClick={handleEvaluateAI} disabled={loadingAi} className="text-xs font-bold bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition-colors shadow-lg shadow-purple-500/20">
                    {loadingAi ? "Analiz Ediliyor..." : "Analiz Et"}
                  </button>
                )}
              </div>
              
              {aiInsight && (
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-white">{aiInsight.score}/100</span>
                    <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-2 py-1 rounded-md">Kalite Skoru</span>
                  </div>
                  <p className="text-sm font-medium text-foreground/80">{aiInsight.feedback}</p>
                  <div className="bg-background/50 p-3 rounded-lg border border-border/50">
                    <span className="text-xs font-bold text-muted-foreground block mb-1">Aksiyon Önerisi:</span>
                    <span className="text-sm font-semibold">{aiInsight.action_item}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Takım Yorumları</h3>
              <div className="space-y-4 mb-4">
                {comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic font-medium">Henüz yorum yapılmamış.</p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                        {c.profiles?.full_name ? c.profiles.full_name.charAt(0) : <UserIcon size={14} />}
                      </div>
                      <div className="glass-card p-3 rounded-xl rounded-tl-none border border-border/50 flex-1">
                        <p className="text-xs font-bold mb-1">{c.profiles?.full_name || "Bilinmeyen Kullanıcı"}</p>
                        <p className="text-sm font-medium">{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Yorumunuzu yazın..." 
                  className="flex-1 bg-foreground/5 border border-border/50 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-foreground/30"
                />
                <button type="submit" className="bg-foreground text-background p-2 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center w-10">
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
