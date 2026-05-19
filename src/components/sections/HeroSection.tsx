"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

export function HeroSection() {
  const { t } = useTranslation();

  const stats = [
    { value: 10, suffix: "+", label: t.hero.stats.repositories },
    { value: 24, suffix: "", label: t.hero.stats.workflows },
    { value: 87, suffix: "%", label: t.hero.stats.sprintProgress },
    { value: 3, suffix: "", label: t.hero.stats.contributors },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-crimson/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-crimson/3 blur-3xl animate-float-delay" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-crimson bg-crimson/10 rounded-full mb-8 border border-crimson/20">
              <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse-soft" />
              {t.hero.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6"
          >
            {t.hero.title}{" "}
            <span className="text-gradient-crimson">{t.hero.titleAccent}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
          >
            <div className="glass-strong rounded-2xl p-3 inline-flex flex-col sm:flex-row items-center gap-3">
              <a
                href="#sections"
                className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-foreground text-background font-bold text-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                {t.hero.cta1}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#sections"
                className="inline-flex items-center justify-center h-12 px-8 rounded-xl border border-border font-bold text-sm transition-all hover:bg-accent hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
              >
                {t.hero.cta2}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="glass rounded-xl p-5 text-center"
              >
                <div className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-muted-foreground/50" />
        </motion.div>
      </div>
    </section>
  );
}
