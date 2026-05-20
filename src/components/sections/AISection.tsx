"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AI_FEATURES } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  workflow: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m7 16 4-8 4 5 4-9" />
    </svg>
  ),
  repository: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M6 21V9a9 9 0 0 0 9 9" />
    </svg>
  ),
  documentation: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  productivity: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </svg>
  ),
};

export function AISection() {
  const { t } = useTranslation();

  return (
    <section id="ai-systems" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t.ai.badge}
          title={t.ai.title}
          subtitle={t.ai.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {AI_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-2xl p-8 group transition-all duration-300 hover:bg-[var(--glass-hover)] hover:glow-crimson"
            >
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-crimson/10 border border-crimson/20 flex items-center justify-center flex-shrink-0 text-crimson group-hover:bg-crimson/20 transition-colors">
                  {iconMap[feature.icon]}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-crimson transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {feature.description}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    {feature.metrics.map((metric) => (
                      <div key={metric.label} className="bg-accent/50 rounded-lg px-3 py-2 border border-border">
                        <div className="text-xs text-muted-foreground mb-0.5">{metric.label}</div>
                        <div className="text-sm font-semibold">{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
