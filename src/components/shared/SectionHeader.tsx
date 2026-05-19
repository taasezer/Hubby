"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  badge: string;
  title: string;
  subtitle: string;
  className?: string;
  id?: string;
}

export function SectionHeader({ badge, title, subtitle, className, id }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn("text-center max-w-3xl mx-auto mb-16", className)}
      id={id}
    >
      <span className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-crimson bg-crimson/10 rounded-full mb-6 border border-crimson/20">
        {badge}
      </span>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4">
        {title}
      </h2>
      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-medium">
        {subtitle}
      </p>
    </motion.div>
  );
}
