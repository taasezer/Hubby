"use client";

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { LayoutDashboard, CheckSquare, Activity, Settings, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export function Sidebar() {
  const t = useTranslations('Dashboard');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    api.getProjects().then(res => setProjects(res.data || [])).catch(console.error);
  }, []);

  const menuItems = [
    { name: t('title'), path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: t('projects'), path: '/projects', icon: <Activity size={20} /> },
    { name: t('workflows'), path: '/workflow', icon: <CheckSquare size={20} /> },
    { name: t('settings'), path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="w-64 glass-card border-r border-border/50 h-screen flex flex-col justify-between hidden md:flex sticky top-0 z-40">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="Hubby Logo" className="w-10 h-10 object-contain rounded-lg shadow-lg shadow-purple-500/10" />
          <h2 className="text-2xl font-black tracking-tight mt-1">Hubby</h2>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path as any}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium border border-transparent ${
                pathname === item.path 
                  ? 'bg-white/10 dark:bg-white/5 backdrop-blur-md border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] text-foreground' 
                  : 'text-muted-foreground hover:bg-white/5 hover:backdrop-blur-md hover:border-white/10 hover:shadow-lg hover:text-foreground'
              }`}>
                {item.icon}
                {item.name}
              </div>
            </Link>
          ))}

          {projects.length > 0 && (
            <div className="pt-6 mt-4 border-t border-border/50">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-2 block">Aktif Projeler</span>
              <div className="space-y-1">
                {projects.map(p => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="block">
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm text-muted-foreground border border-transparent hover:bg-white/5 hover:backdrop-blur-md hover:border-white/10 hover:shadow-lg hover:text-foreground">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                      <span className="truncate">{p.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="p-6 border-t border-border/50 space-y-4">
        {mounted && (
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-muted-foreground">Tema</span>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-foreground/5 hover:bg-white/10 hover:backdrop-blur-md hover:shadow-lg border border-transparent hover:border-white/10 transition-all duration-300"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        )}
        <div className="flex items-center justify-between px-2">
          <span className="text-sm font-medium text-muted-foreground">Dil</span>
          <select 
            className="bg-foreground/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none text-center cursor-pointer"
            value={locale}
            onChange={(e) => {
              const l = e.target.value;
              window.location.href = `/${l}${pathname}`;
            }}
          >
            <option value="tr" className="bg-background">TR</option>
            <option value="en" className="bg-background">EN</option>
            <option value="fr" className="bg-background">FR</option>
            <option value="es" className="bg-background">ES</option>
            <option value="de" className="bg-background">DE</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
