"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ROADMAP_PHASES } from "@/lib/constants";

const statusStyles = {
  completed: {
    dot: "bg-emerald-400",
    line: "bg-emerald-400/30",
    badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  active: {
    dot: "bg-crimson",
    line: "bg-crimson/30",
    badge: "text-crimson bg-crimson/10 border-crimson/20",
  },
  upcoming: {
    dot: "bg-muted-foreground/40",
    line: "bg-muted-foreground/10",
    badge: "text-muted-foreground bg-muted border-border",
  },
};

export function RoadmapSection() {
  const { t } = useTranslation();

  return (
    <section id="roadmap" className="py-24 sm:py-32 relative bg-gradient-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t.roadmap.badge}
          title={t.roadmap.title}
          subtitle={t.roadmap.subtitle}
        />

        <div className="relative">
          <div className="absolute left-8 sm:left-10 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-12">
            {ROADMAP_PHASES.map((phase, i) => {
              const styles = statusStyles[phase.status];

              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="relative pl-20 sm:pl-24"
                >
                  <div className="absolute left-6 sm:left-8 top-1">
                    <div className={`w-4 h-4 rounded-full border-2 border-background ${styles.dot} ring-4 ring-background`} />
                  </div>

                  <div className="glass rounded-xl p-6 hover:bg-[var(--glass-hover)] transition-all duration-300">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Phase {phase.phase}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badge}`}>
                        {t.roadmap.status[phase.status]}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {phase.timeline}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg mb-2">{phase.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {phase.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phase.items.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            phase.status === "completed" ? "bg-emerald-400" :
                            phase.status === "active" ? "bg-crimson" : "bg-muted-foreground/30"
                          }`} />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
