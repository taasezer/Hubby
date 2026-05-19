"use client";

import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { TEAM_MEMBERS, WORKFLOW_ITEMS } from "@/lib/constants";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";

const activityData = [
  { day: "Mon", commits: 12, reviews: 4, tasks: 6 },
  { day: "Tue", commits: 18, reviews: 7, tasks: 3 },
  { day: "Wed", commits: 9, reviews: 5, tasks: 8 },
  { day: "Thu", commits: 22, reviews: 9, tasks: 5 },
  { day: "Fri", commits: 15, reviews: 6, tasks: 7 },
  { day: "Sat", commits: 7, reviews: 2, tasks: 2 },
  { day: "Sun", commits: 4, reviews: 1, tasks: 1 },
];

const recentActivities = [
  {
    id: "act-1",
    user: "Taha Sezer",
    initials: "TS",
    action: "merged pull request",
    target: "#47 GitHub API rate limit handler",
    time: "2 hours ago",
    color: "#8b1a1a",
  },
  {
    id: "act-2",
    user: "Bartu Selçuk",
    initials: "BS",
    action: "completed task",
    target: "Liquid Glass Design System",
    time: "4 hours ago",
    color: "#2d1a4e",
  },
  {
    id: "act-3",
    user: "Yunus Emre Sayın",
    initials: "YES",
    action: "pushed 3 commits to",
    target: "feature/ai-workflow-engine",
    time: "5 hours ago",
    color: "#1a3a5c",
  },
  {
    id: "act-4",
    user: "Taha Sezer",
    initials: "TS",
    action: "created issue",
    target: "#52 Sprint velocity tracking dashboard",
    time: "6 hours ago",
    color: "#8b1a1a",
  },
  {
    id: "act-5",
    user: "Bartu Selçuk",
    initials: "BS",
    action: "opened pull request",
    target: "#48 Responsive navigation overhaul",
    time: "8 hours ago",
    color: "#2d1a4e",
  },
  {
    id: "act-6",
    user: "Yunus Emre Sayın",
    initials: "YES",
    action: "reviewed pull request",
    target: "#45 Repository intelligence pipeline",
    time: "1 day ago",
    color: "#1a3a5c",
  },
];

function BarChart() {
  const maxCommits = Math.max(...activityData.map((d) => d.commits));

  return (
    <div className="flex items-end gap-2 h-32 w-full">
      {activityData.map((day, i) => (
        <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${(day.commits / maxCommits) * 100}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
            className="w-full rounded-t-sm bg-crimson/60 hover:bg-crimson transition-colors relative group min-h-[4px]"
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-foreground text-background text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {day.commits} commits
            </div>
          </motion.div>
          <span className="text-[10px] text-muted-foreground font-medium">{day.day}</span>
        </div>
      ))}
    </div>
  );
}

function MemberWorkload({ name, initials, color, tasks }: { name: string; initials: string; color: string; tasks: { todo: number; inProgress: number; review: number; completed: number } }) {
  const total = tasks.todo + tasks.inProgress + tasks.review + tasks.completed;
  const completionRate = total > 0 ? Math.round((tasks.completed / total) * 100) : 0;

  return (
    <div className="glass rounded-lg p-4 hover:bg-[var(--glass-hover)] transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
        >
          <span className="text-white font-bold text-xs">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{name}</div>
          <div className="text-[11px] text-muted-foreground">{total} tasks assigned</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-sm">{completionRate}%</div>
          <div className="text-[10px] text-muted-foreground">done</div>
        </div>
      </div>

      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-accent">
        {tasks.completed > 0 && (
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(tasks.completed / total) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-emerald-400 rounded-full"
          />
        )}
        {tasks.review > 0 && (
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(tasks.review / total) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="bg-amber-400 rounded-full"
          />
        )}
        {tasks.inProgress > 0 && (
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(tasks.inProgress / total) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="bg-blue-400 rounded-full"
          />
        )}
        {tasks.todo > 0 && (
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${(tasks.todo / total) * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="bg-muted-foreground/30 rounded-full"
          />
        )}
      </div>

      <div className="flex gap-3 mt-2">
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {tasks.completed} done
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {tasks.review} review
        </span>
        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> {tasks.inProgress} active
        </span>
      </div>
    </div>
  );
}

export function DashboardSection() {
  const { t } = useTranslation();

  const memberTaskCounts = TEAM_MEMBERS.map((member) => {
    const memberTasks = WORKFLOW_ITEMS.filter((item) => item.assignee === member.name);
    return {
      ...member,
      tasks: {
        todo: memberTasks.filter((t) => t.status === "todo").length,
        inProgress: memberTasks.filter((t) => t.status === "in-progress").length,
        review: memberTasks.filter((t) => t.status === "review").length,
        completed: memberTasks.filter((t) => t.status === "completed").length,
      },
    };
  });

  const totalTasks = WORKFLOW_ITEMS.length;
  const completedTasks = WORKFLOW_ITEMS.filter((t) => t.status === "completed").length;
  const inProgressTasks = WORKFLOW_ITEMS.filter((t) => t.status === "in-progress").length;
  const reviewTasks = WORKFLOW_ITEMS.filter((t) => t.status === "review").length;

  return (
    <section id="dashboard" className="py-24 sm:py-32 relative bg-gradient-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={t.dashboard.badge}
          title={t.dashboard.title}
          subtitle={t.dashboard.subtitle}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: t.dashboard.totalTasks, value: totalTasks, suffix: "", color: "text-foreground" },
            { label: t.dashboard.completed, value: completedTasks, suffix: "", color: "text-emerald-400" },
            { label: t.dashboard.inReview, value: reviewTasks, suffix: "", color: "text-amber-400" },
            { label: t.dashboard.inProgress, value: inProgressTasks, suffix: "", color: "text-blue-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-xl p-5 text-center"
            >
              <div className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${stat.color}`}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1 glass rounded-xl p-6"
          >
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-1 text-foreground">
              {t.dashboard.weeklyActivity}
            </h3>
            <p className="text-xs text-muted-foreground mb-5">{t.dashboard.commitsThisWeek}</p>
            <BarChart />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass rounded-xl p-6"
          >
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-1 text-foreground">
              {t.dashboard.teamWorkload}
            </h3>
            <p className="text-xs text-muted-foreground mb-5">{t.dashboard.taskDistribution}</p>
            <div className="space-y-3">
              {memberTaskCounts.map((member) => (
                <MemberWorkload
                  key={member.id}
                  name={member.name}
                  initials={member.initials}
                  color={member.gradientFrom}
                  tasks={member.tasks}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-6 mt-8"
        >
          <h3 className="font-semibold text-sm uppercase tracking-wider mb-1 text-foreground">
            {t.dashboard.recentActivity}
          </h3>
          <p className="text-xs text-muted-foreground mb-5">{t.dashboard.latestUpdates}</p>

          <div className="space-y-1">
            {recentActivities.map((activity, i) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${activity.color}, ${activity.color}cc)` }}
                >
                  <span className="text-white font-bold text-[9px]">{activity.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">{activity.action}</span>{" "}
                    <span className="font-medium text-crimson">{activity.target}</span>
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground flex-shrink-0 hidden sm:block">
                  {activity.time}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
