"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { api } from "@/services/api";
import { TaskModal } from "@/components/shared/TaskModal";
import { AddTaskModal } from "@/components/shared/AddTaskModal";
import { DndContext, closestCorners, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Kanban Sütunları
const COLUMNS = ["todo", "in-progress", "review", "completed"];

function SortableTaskItem({ task, onClick }: { task: any, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const t = useTranslations("Kanban");

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors: any = {
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    high: "text-red-400 bg-red-500/10 border-red-500/20"
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="glass-card p-4 rounded-xl hover:bg-foreground/5 transition-colors cursor-grab active:cursor-grabbing mb-3 border border-border/50 relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm">{task.title}</h4>
        {task.priority && (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityColors[task.priority] || priorityColors.medium}`}>
            {task.priority}
          </span>
        )}
      </div>
      
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 font-medium">
          {task.description}
        </p>
      )}

      {/* Profil/Atanan Kişi Gösterimi (Eğer backendden profil bilgisi join edilmişse) */}
      <div className="flex justify-end">
         <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-[10px] font-bold">
            {task.profiles?.full_name ? task.profiles.full_name.charAt(0) : "A"}
         </div>
      </div>
    </div>
  );
}

function KanbanColumn({ title, status, tasks, onTaskClick }: { title: string, status: string, tasks: any[], onTaskClick: (task: any) => void }) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className="glass-card p-4 rounded-2xl min-w-[300px] flex-1 flex flex-col h-[70vh] bg-foreground/[0.02]">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-black text-sm tracking-wide uppercase">{title}</h3>
        <span className="bg-foreground/10 text-foreground text-xs px-2 py-1 rounded-full font-bold">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <SortableTaskItem key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export function WorkflowSection() {
  const t = useTranslations("Kanban");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.getTasks(); // Tüm projelerdeki görevleri çeker
      setTasks(res.data || []);
    } catch (error) {
      console.error("Görevler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const activeTask = tasks.find(t => t.id === taskId);
    
    // Hangi kolona sürüklendiğini bul
    // Eğer bir task'ın üzerine bırakıldıysa, o task'ın status'unu al, yoksa kolon id'sine bak
    const overTask = tasks.find(t => t.id === over.id);
    const newStatus = overTask ? overTask.status : over.id as string;

    if (!COLUMNS.includes(newStatus)) return; // Sadece geçerli kolonlara izin ver

    if (activeTask && activeTask.status !== newStatus) {
      // Optimistic Update (Arayüzü anında güncelle)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      // Backend'e gönder
      try {
        await api.updateTask(taskId, { status: newStatus });
      } catch (error) {
        console.error("Görev güncellenemedi, geri alınıyor.", error);
        fetchTasks(); // Hata olursa sunucudan eski haline dön
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">İş Akışı (Kanban)</h1>
          <p className="text-muted-foreground font-medium">Görevlerinizi sürükleyerek yönetin.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-foreground text-background px-4 py-2 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          + {t('add_task')}
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 h-full">
          {COLUMNS.map(col => (
            <KanbanColumn 
              key={col} 
              // DndContext için kolonları droppable yapabilmek için id olarak kolonu atıyoruz
              status={col}
              title={t(col === 'in-progress' ? 'in_progress' : col === 'completed' ? 'done' : col)} 
              tasks={tasks.filter(t => t.status === col)} 
              onTaskClick={setSelectedTask}
            />
          ))}
        </div>
      </DndContext>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onDelete={() => {
            setSelectedTask(null);
            fetchTasks();
          }}
        />
      )}

      {/* Yeni Görev Ekleme Modalı */}
      {isAddModalOpen && (
        <AddTaskModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchTasks(); // Görev eklendikten sonra listeyi yenile
          }} 
        />
      )}
    </div>
  );
}
