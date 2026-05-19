"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TEAM_MEMBERS } from "@/lib/constants";

export function TeamSection() {
  const { t } = useTranslation();

  return (
    <section id="team" className="py-24 sm:py-32 relative bg-gradient-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t.team.badge}
          title={t.team.title}
          subtitle={t.team.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="glass rounded-2xl p-8 group transition-all duration-300 hover:bg-[var(--glass-hover)] hover:glow-crimson"
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${member.gradientFrom}, ${member.gradientTo})`,
                  }}
                >
                  <span className="text-white font-bold text-xl tracking-wide">
                    {member.initials}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-crimson">
                  {member.role}
                </span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6 text-center">
                {member.description}
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                {member.responsibilities.map((resp) => (
                  <span
                    key={resp}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-accent text-muted-foreground border border-border"
                  >
                    {resp}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
