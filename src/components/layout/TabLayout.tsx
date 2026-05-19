"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/i18n";

const tabs = [
  { key: "repositories", id: "repositories" },
  { key: "team", id: "team" },
  { key: "dashboard", id: "dashboard" },
  { key: "workflow", id: "workflow" },
  { key: "roadmap", id: "roadmap" },
  { key: "aiSystems", id: "ai-systems" },
  { key: "techStack", id: "tech-stack" },
] as const;

interface TabLayoutProps {
  children: Record<string, React.ReactNode>;
}

export function TabLayout({ children }: TabLayoutProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("repositories");

  return (
    <div id="sections">
      <div className="sticky top-16 z-40 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-strong rounded-2xl p-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? "text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-foreground rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    {t.nav[tab.key as keyof typeof t.nav]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {children[activeTab]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
