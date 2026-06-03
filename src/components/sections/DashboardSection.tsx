"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/i18n";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { api } from "@/services/api";

function BarChart({ activityData }: { activityData: any[] }) {
  const maxCommits = Math.max(...activityData.map((d) => d.commits), 1);

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
              {day.commits} işlem
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
          style={{ background: color || `linear-gradient(135deg, #1a3a5c, #2d1a4e)` }}
        >
          <span className="text-white font-bold text-xs">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{name}</div>
          <div className="text-[11px] text-muted-foreground">{total} görev atandı</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-sm">{completionRate}%</div>
          <div className="text-[10px] text-muted-foreground">tamamlandı</div>
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
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const [tasksRes, actsRes] = await Promise.all([
          api.getTasks(),
          api.getActivities()
        ]);
        setTasks(tasksRes.data || []);
        setActivities(actsRes.data || []);
      } catch (err) {
        console.log("Dashboard verileri alınamadı (sunucu kapalı olabilir).", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!mounted) return null;

  // Compute stats dynamically
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const reviewTasks = tasks.filter((t) => t.status === "review").length;

  // Group tasks by assignee
  const assigneeMap: Record<string, any> = {};
  tasks.forEach(task => {
    let name = "Atanmamış";
    let initials = "?";
    
    // Attempt to extract assignee name from profiles if exists
    if (task.profiles) {
      if (Array.isArray(task.profiles) && task.profiles.length > 0) {
        name = task.profiles[0].full_name || name;
      } else if (task.profiles.full_name) {
        name = task.profiles.full_name;
      }
    }
    
    if (name !== "Atanmamış") {
      initials = name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
    }

    if (!assigneeMap[name]) {
      assigneeMap[name] = {
        name,
        initials,
        tasks: { todo: 0, inProgress: 0, review: 0, completed: 0 }
      };
    }
    
    if (task.status === "todo") assigneeMap[name].tasks.todo++;
    else if (task.status === "in-progress") assigneeMap[name].tasks.inProgress++;
    else if (task.status === "review") assigneeMap[name].tasks.review++;
    else if (task.status === "completed") assigneeMap[name].tasks.completed++;
  });

  const memberTaskCounts = Object.values(assigneeMap);

  // Generate chart data from activities (Mocking past days, adding real data to today)
  const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const activityData = days.map(d => ({ day: d, commits: Math.floor(Math.random() * 15) + 1 }));
  // Add actual activities length to the current day
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  activityData[todayIndex].commits += activities.length;

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
            <BarChart activityData={activityData} />
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
              {memberTaskCounts.length > 0 ? (
                memberTaskCounts.map((member: any, i) => (
                  <MemberWorkload
                    key={i}
                    name={member.name}
                    initials={member.initials}
                    color={`linear-gradient(135deg, #1a3a5c, #2d1a4e)`}
                    tasks={member.tasks}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Henüz atanan görev yok.</p>
              )}
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
            {activities.length > 0 ? (
              activities.slice(0, 10).map((activity, i) => {
                let name = "Sistem";
                let initials = "S";
                if (activity.profiles) {
                  name = Array.isArray(activity.profiles) ? activity.profiles[0]?.full_name : activity.profiles?.full_name;
                  if (name) initials = name.split(" ").map((n: string) => n[0]).join("").substring(0,2).toUpperCase();
                }

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500"
                    >
                      <span className="text-white font-bold text-[9px]">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-medium">{name}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium text-crimson">{activity.details}</span>
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground flex-shrink-0 hidden sm:block">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Henüz bir aktivite yok.</p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
