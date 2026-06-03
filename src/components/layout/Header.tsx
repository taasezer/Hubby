"use client";

import { Bell, Search } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Link } from '@/i18n/routing';

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{projects: any[], tasks: any[]}>({projects: [], tasks: []});
  const [isSearching, setIsSearching] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [receiverSearch, setReceiverSearch] = useState("");
  const [receiverOptions, setReceiverOptions] = useState<any[]>([]);
  const [selectedReceiverName, setSelectedReceiverName] = useState("");
  const [openDropdown, setOpenDropdown] = useState<"messages" | "notifications" | "profile" | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const fetchHeaderData = async () => {
      try {
        const [notifs, msgs] = await Promise.all([
          api.getNotifications(),
          api.getMessages()
        ]);
        setNotifications(notifs.data.filter((n: any) => !n.is_read));
        setMessages(msgs.data || []);
      } catch (err) {
        console.log("Header verileri yüklenemedi", err);
      }
    };
    fetchHeaderData();
  }, [supabase]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults({projects: [], tasks: []});
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search(searchQuery);
        setSearchResults(res.data);
      } catch(e) { console.log(e) }
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (receiverSearch.length < 2) {
      setReceiverOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.searchProfiles(receiverSearch);
        setReceiverOptions(res.data || []);
      } catch(e) { console.log(e) }
    }, 300);
    return () => clearTimeout(timer);
  }, [receiverSearch]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSendMessage = async () => {
    if (!receiverId || !messageText) return alert("Kişi ID'si ve mesaj girilmelidir.");
    try {
      await api.sendMessage(receiverId, messageText);
      setMessageText("");
      setShowMessageModal(false);
      alert("Mesaj başarıyla gönderildi.");
      // Refresh messages
      const msgs = await api.getMessages();
      setMessages(msgs.data || []);
    } catch (err) {
      alert("Mesaj gönderilemedi");
    }
  };

  return (
    <header className="h-20 glass-card border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="relative w-96 z-50">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input 
          type="text" 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Projelerde veya görevlerde ara..." 
          className="w-full bg-white/5 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-md rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-white/30 focus:shadow-[0_4px_30px_rgba(255,255,255,0.1)] transition-all duration-300"
        />
        {(searchResults.projects.length > 0 || searchResults.tasks.length > 0) ? (
          <div className="absolute top-full mt-3 w-full z-[100] bg-background/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            {searchResults.projects.length > 0 && (
              <div className="p-3 border-b border-border/50">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Projeler</p>
                {searchResults.projects.map(p => (
                  <a key={p.id} href="/tr/projects" className="block px-3 py-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-md transition-all duration-300 text-sm font-medium">
                    {p.name}
                  </a>
                ))}
              </div>
            )}
            {searchResults.tasks.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Görevler</p>
                {searchResults.tasks.map(t => (
                  <a key={t.id} href="/tr/dashboard" className="block px-3 py-2 rounded-lg hover:bg-white/10 hover:backdrop-blur-md transition-all duration-300 text-sm font-medium">
                    {t.title} <span className="text-xs text-muted-foreground float-right">{t.status}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (searchQuery.length >= 2 && !isSearching) ? (
          <div className="absolute top-full mt-3 w-full z-[100] bg-background/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-4 text-center text-sm font-medium text-muted-foreground animate-in fade-in slide-in-from-top-2">
            Aramanızla eşleşen sonuç bulunamadı.
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-6">
        {/* Messages Dropdown */}
        <div className="relative py-2" onClick={(e) => e.stopPropagation()}>
          <div 
            onClick={() => setOpenDropdown(openDropdown === "messages" ? null : "messages")}
            className="relative p-2 cursor-pointer text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg rounded-full border border-transparent hover:border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            {messages.filter(m => !m.is_read && m.receiver_id === user?.id).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
            )}
          </div>
          
          <div className={`absolute top-full right-0 pt-2 w-80 z-[100] transition-all duration-300 ${openDropdown === "messages" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
            <div className="bg-background/90 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-96">
              <div className="p-3 border-b border-border/50 flex justify-between items-center bg-white/5">
                <span className="font-bold text-sm">Mesajlar</span>
                <button onClick={(e) => { e.stopPropagation(); setShowMessageModal(true); setOpenDropdown(null); }} className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded-md hover:bg-blue-500/10">Yeni Mesaj</button>
              </div>
              <div className="overflow-y-auto p-2 space-y-1">
                {messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Henüz mesajınız yok.</p>
                ) : (
                  messages.slice(0, 5).map((m) => {
                    const isMine = m.sender_id === user?.id;
                    const otherPerson = isMine ? m.receiver : m.sender;
                    return (
                      <div key={m.id} className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={() => {if(!isMine && !m.is_read) api.markMessageRead(m.id);}}>
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                          {otherPerson?.full_name?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-0.5">
                            <p className="text-sm font-bold truncate">{isMine ? `Siz -> ${otherPerson?.full_name}` : otherPerson?.full_name}</p>
                            <span className="text-[10px] text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className={`text-xs truncate ${!isMine && !m.is_read ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{m.content}</p>
                        </div>
                        {!isMine && !m.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 self-center"></div>}
                      </div>
                    );
                  })
                )}
                {messages.length > 5 && <p className="text-xs text-center py-2 text-muted-foreground">Tümünü gör...</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="relative py-2" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={() => setOpenDropdown(openDropdown === "notifications" ? null : "notifications")}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg rounded-full border border-transparent hover:border-white/10"
          >
            <Bell size={22} />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
            )}
          </button>
          
          <div className={`absolute top-full right-0 pt-2 w-80 z-[100] transition-all duration-300 ${openDropdown === "notifications" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
            <div className="bg-background/90 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-96">
              <div className="p-3 border-b border-border/50 flex justify-between items-center bg-white/5">
                <span className="font-bold text-sm">Bildirimler</span>
              </div>
              <div className="overflow-y-auto p-2 space-y-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Yeni bildiriminiz yok.</p>
                ) : (
                  notifications.slice(0, 5).map((n: any) => (
                    <div 
                      key={n.id} 
                      onClick={async () => {
                        await api.markNotificationRead(n.id);
                        setNotifications(prev => prev.filter(notif => notif.id !== n.id));
                      }}
                      className="flex gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border-b border-border/30 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                        <Bell size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{n.content}</p>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-red-500 self-center"></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 border-l border-border/50 pl-6 relative py-2" onClick={(e) => e.stopPropagation()}>
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold">{user?.user_metadata?.full_name || 'Geliştirici'}</p>
            <p className="text-xs text-muted-foreground font-medium">{user?.email}</p>
          </div>
          <div 
            onClick={() => setOpenDropdown(openDropdown === "profile" ? null : "profile")}
            className="w-10 h-10 rounded-full cursor-pointer bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md overflow-hidden hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 border border-white/10"
          >
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              user?.email?.[0].toUpperCase() || 'G'
            )}
          </div>
          
          <div className={`absolute top-full right-0 pt-2 w-48 transition-all duration-300 ${openDropdown === "profile" ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}`}>
            <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl p-2 flex flex-col gap-1">
              <Link 
                href="/settings"
                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-white/10 hover:backdrop-blur-md font-bold rounded-lg transition-all duration-300"
              >
                Profil ve Ayarlar
              </Link>
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 font-bold rounded-lg transition-all duration-300"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>

      {showMessageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Yeni Mesaj Gönder</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Kime Gönderilecek?</label>
                {receiverId ? (
                  <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-lg p-2.5">
                    <span className="text-sm font-bold">{selectedReceiverName}</span>
                    <button onClick={() => {setReceiverId(""); setSelectedReceiverName(""); setReceiverSearch("");}} className="text-xs text-red-400 hover:text-red-300">Değiştir</button>
                  </div>
                ) : (
                  <div className="relative">
                    <input 
                      type="text" 
                      value={receiverSearch}
                      onChange={e => setReceiverSearch(e.target.value)}
                      placeholder="İsim veya kullanıcı adı ara..." 
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm"
                    />
                    {receiverOptions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-white/10 rounded-lg shadow-xl overflow-hidden z-50 max-h-40 overflow-y-auto">
                        {receiverOptions.map(opt => (
                          <div 
                            key={opt.id} 
                            onClick={() => {
                              setReceiverId(opt.id);
                              setSelectedReceiverName(opt.full_name || opt.github_username || 'Kullanıcı');
                              setReceiverOptions([]);
                            }}
                            className="p-2.5 hover:bg-white/10 cursor-pointer flex items-center gap-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold shrink-0 text-indigo-400">
                              {(opt.full_name || opt.github_username || "?")[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{opt.full_name || opt.github_username}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Mesajınız</label>
                <textarea 
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Selam, nasılsın?" 
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                İptal
              </button>
              <button 
                onClick={handleSendMessage}
                className="px-4 py-2 text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
