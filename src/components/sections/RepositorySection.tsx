"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { fetchRepositories, formatDate, getUniqueLanguages } from "@/lib/github";
import { LANGUAGE_COLORS } from "@/lib/constants";
import { Repository } from "@/types";

export function RepositorySection() {
  const { t } = useTranslation();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [languages, setLanguages] = useState<string[]>([]);

  const loadRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRepositories();
      setRepos(data);
      setLanguages(getUniqueLanguages(data));
    } catch {
      setError(t.repositories.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRepos =
    activeFilter === "All" ? repos : repos.filter((r) => r.language === activeFilter);

  return (
    <section id="repositories" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t.repositories.badge}
          title={t.repositories.title}
          subtitle={t.repositories.subtitle}
        />

        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-2 mb-12"
          >
            <button
              onClick={() => setActiveFilter("All")}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeFilter === "All"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {t.repositories.filterAll}
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveFilter(lang)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  activeFilter === lang
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: LANGUAGE_COLORS[lang] || "#888" }}
                />
                {lang}
              </button>
            ))}
          </motion.div>
        )}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-6">
                <div className="skeleton h-5 w-2/3 mb-3" />
                <div className="skeleton h-4 w-full mb-2" />
                <div className="skeleton h-4 w-4/5 mb-6" />
                <div className="flex gap-4">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={loadRepos}
              className="px-6 py-2.5 rounded-lg bg-crimson text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              {t.repositories.retry}
            </button>
          </motion.div>
        )}

        {!loading && !error && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredRepos.map((repo, i) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-xl p-6 group transition-all duration-300 hover:bg-[var(--glass-hover)] hover:glow-crimson"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground flex-shrink-0">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      <h3 className="font-semibold text-sm truncate group-hover:text-crimson transition-colors">
                        {repo.name}
                      </h3>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded border border-border flex-shrink-0">
                      {repo.visibility}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {repo.description || "No description provided"}
                  </p>

                  <div className="flex items-center gap-4 mb-5 text-xs text-muted-foreground">
                    {repo.language && (
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || "#888" }}
                        />
                        {repo.language}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {repo.stargazers_count}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="18" r="3" />
                        <circle cx="6" cy="6" r="3" />
                        <circle cx="18" cy="6" r="3" />
                        <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
                        <path d="M12 12v3" />
                      </svg>
                      {repo.forks_count}
                    </span>
                    <span className="text-muted-foreground/70">
                      {formatDate(repo.updated_at)}
                    </span>
                  </div>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-medium text-crimson hover:text-crimson-light transition-colors group/link"
                  >
                    {t.repositories.openRepo}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover/link:translate-x-0.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
