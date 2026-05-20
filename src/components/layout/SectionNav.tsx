"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";

const tabs = [
  { key: "repositories", href: "/repositories" },
  { key: "team", href: "/team" },
  { key: "dashboard", href: "/dashboard" },
  { key: "workflow", href: "/workflow" },
  { key: "roadmap", href: "/roadmap" },
  { key: "aiSystems", href: "/ai-systems" },
  { key: "techStack", href: "/tech-stack" },
] as const;

export function SectionNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-40 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-strong rounded-2xl p-2 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.key}
                href={tab.href}
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
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
