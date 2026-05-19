"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { WORKFLOW_ITEMS } from "@/lib/constants";
import { WorkflowItem } from "@/types";

const statusConfig = {
  todo: { color: "bg-muted-foreground", dotColor: "bg-zinc-400" },
  "in-progress": { color: "bg-blue-500", dotColor: "bg-blue-400" },
  review: { color: "bg-amber-500", dotColor: "bg-amber-400" },
  completed: { color: "bg-emerald-500", dotColor: "bg-emerald-400" },
};

const priorityConfig = {
  high: "text-red-400 bg-red-500/10 border-red-500/20",
  medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

function TaskCard({ item, index }: { item: WorkflowItem; index: number }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-lg p-4 hover:bg-[var(--glass-hover)] transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm leading-tight pr-2">{item.title}</h4>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border flex-shrink-0 ${
            priorityConfig[item.priority]
          }`}
        >
          {t.workflow.priority[item.priority]}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {item.description}
      </p>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] font-bold text-muted-foreground">{item.assigneeInitials}</span>
        </div>
        <span className="text-[11px] text-muted-foreground truncate">{item.assignee}</span>
      </div>
    </motion.div>
  );
}

export function WorkflowSection() {
  const { t } = useTranslation();

  const columns = [
    { key: "todo" as const, items: WORKFLOW_ITEMS.filter((i) => i.status === "todo") },
    { key: "in-progress" as const, items: WORKFLOW_ITEMS.filter((i) => i.status === "in-progress") },
    { key: "review" as const, items: WORKFLOW_ITEMS.filter((i) => i.status === "review") },
    { key: "completed" as const, items: WORKFLOW_ITEMS.filter((i) => i.status === "completed") },
  ];

  const columnLabels: Record<string, string> = {
    todo: t.workflow.columns.todo,
    "in-progress": t.workflow.columns.inProgress,
    review: t.workflow.columns.review,
    completed: t.workflow.columns.completed,
  };

  return (
    <section id="workflow" className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t.workflow.badge}
          title={t.workflow.title}
          subtitle={t.workflow.subtitle}
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto"
        >
          {columns.map((col) => (
            <div key={col.key} className="min-w-0">
              <div className="flex items-center gap-2 mb-4 px-1">
                <span
                  className={`w-2 h-2 rounded-full ${statusConfig[col.key].dotColor}`}
                />
                <h3 className="text-sm font-semibold">{columnLabels[col.key]}</h3>
                <span className="text-xs text-muted-foreground ml-auto bg-accent px-2 py-0.5 rounded-full">
                  {col.items.length}
                </span>
              </div>
              <div className="space-y-3">
                {col.items.map((item, i) => (
                  <TaskCard key={item.id} item={item} index={i} />
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
