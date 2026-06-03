"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/routing";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGithubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Normal Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        // Register with manual GitHub username
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // If sign up successful, we could ideally save the github_username to the profiles table
        // but Supabase triggers usually handle the profile creation. 
        // We can update the profile here if the user was created.
        if (data.user) {
          await supabase.from("profiles").update({ github_username: githubUsername }).eq("id", data.user.id);
        }
        
        // Show success or redirect
        alert("Kayıt başarılı! Lütfen giriş yapın.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 rounded-2xl flex flex-col gap-6"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black mb-2 tracking-tight">Hubby</h1>
          <p className="text-muted-foreground font-medium">
            {isLogin ? "Tekrar hoş geldin!" : "Aramıza katıl."}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleGithubLogin}
          className="w-full flex items-center justify-center gap-3 bg-foreground text-background font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub ile {isLogin ? "Giriş Yap" : "Kayıt Ol"}
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-border/50"></div>
          <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm font-medium">veya e-posta ile</span>
          <div className="flex-grow border-t border-border/50"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold ml-1">GitHub Kullanıcı Adı (Opsiyonel)</label>
              <input
                type="text"
                placeholder="Örn: tahasezer"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-foreground/50 transition-colors font-medium"
              />
              <p className="text-xs text-muted-foreground ml-1">Takım arkadaşlarınızın sizi bulabilmesi için.</p>
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold ml-1">E-posta</label>
            <input
              type="email"
              required
              placeholder="isim@sirket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-foreground/50 transition-colors font-medium"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold ml-1">Şifre</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-accent/30 border border-border rounded-xl px-4 py-2.5 outline-none focus:border-foreground/50 transition-colors font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/80 text-foreground font-bold py-3 px-4 rounded-xl transition-colors mt-2"
          >
            {loading ? "Bekleniyor..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
          </button>
        </form>

        <p className="text-center text-sm font-medium text-muted-foreground mt-2">
          {isLogin ? "Hesabınız yok mu?" : "Zaten hesabınız var mı?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-foreground font-bold hover:underline"
          >
            {isLogin ? "Kayıt Ol" : "Giriş Yap"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
