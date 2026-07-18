"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, Clock, Plus, Trash2, RotateCcw, 
  X, AlertCircle, CalendarClock 
} from "lucide-react";
import { 
  getAllTasks, completeTask, uncompleteTask, 
  deleteTask, createTask 
} from "@/actions/tasks";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  text: string;
  time: string;
  status: string;
  isCompleted: boolean;
  createdAt: Date;
};

export function TasksManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("routine");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    const res = await getAllTasks();
    if (res.success && res.tasks) {
      setTasks(res.tasks);
    }
    setIsLoading(false);
  };

  const handleToggleTask = async (task: Task) => {
    // Optimistic update
    setTasks(tasks.map(t => 
      t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
    ));
    
    if (task.isCompleted) {
      await uncompleteTask(task.id);
    } else {
      await completeTask(task.id);
    }
  };

  const handleDeleteTask = async (id: string) => {
    // Optimistic update
    setTasks(tasks.filter(t => t.id !== id));
    await deleteTask(id);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    
    setIsSubmitting(true);
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const res = await createTask({
      text: newTaskText,
      time: timeString,
      status: newTaskStatus
    });

    if (res.success && res.task) {
      setTasks([res.task as unknown as Task, ...tasks]);
      setNewTaskText("");
      setIsAdding(false);
    }
    setIsSubmitting(false);
  };

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'urgent': return 'bg-[#82c91e] border-[#82c91e] text-[#82c91e]';
      case 'warning': return 'bg-orange-500 border-orange-500 text-orange-500';
      default: return 'bg-blue-500 border-blue-500 text-blue-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'urgent': return 'عاجلة';
      case 'warning': return 'متوسطة';
      default: return 'روتينية';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-[#82c91e]" />
            إدارة المهام
          </h1>
          <p className="text-gray-400">نظم مهامك وتابع إنجازاتك اليومية بسهولة</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#82c91e] hover:bg-[#93e022] text-[#1a1f1a] font-bold px-6 py-3 rounded-[16px] flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(130,201,30,0.3)] hover:shadow-[0_0_30px_rgba(130,201,30,0.5)]"
        >
          <Plus className="w-5 h-5" />
          مهمة جديدة
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddTask} className="bg-[#111111]/80 backdrop-blur-3xl border border-[#82c91e]/30 rounded-[32px] p-8 mb-8 relative shadow-[0_0_50px_rgba(130,201,30,0.15)] overflow-hidden">
              <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="absolute top-6 left-6 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-6">إضافة مهمة جديدة</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">ما هي المهمة؟</label>
                  <input 
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="اكتب تفاصيل المهمة هنا..."
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-[16px] px-5 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#82c91e]/50 focus:ring-1 focus:ring-[#82c91e]/50 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-3">مدى الأهمية</label>
                  <div className="flex flex-wrap gap-3">
                    {['routine', 'warning', 'urgent'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setNewTaskStatus(status)}
                        className={cn(
                          "px-5 py-2.5 rounded-full border transition-all text-sm font-bold flex items-center gap-2",
                          newTaskStatus === status 
                            ? getStatusColor(status).replace('text-', 'bg-opacity-20 text-')
                            : "border-white/10 text-gray-400 hover:border-white/20 hover:text-gray-200 bg-transparent"
                        )}
                      >
                        {status === 'urgent' && <AlertCircle className="w-4 h-4" />}
                        {status === 'warning' && <Clock className="w-4 h-4" />}
                        {status === 'routine' && <CalendarClock className="w-4 h-4" />}
                        {getStatusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting || !newTaskText.trim()}
                    className="w-full bg-[#82c91e] hover:bg-[#93e022] text-[#1a1f1a] disabled:opacity-50 disabled:cursor-not-allowed font-bold px-6 py-4 rounded-[16px] transition-all"
                  >
                    {isSubmitting ? "جاري الإضافة..." : "حفظ المهمة"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Pending Tasks */}
        <div className="bg-[#111111]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col h-full relative overflow-hidden">
          <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white">
              المهام قيد التنفيذ
              <span className="bg-white/10 text-white text-xs px-2.5 py-1 rounded-full">
                {pendingTasks.length}
              </span>
            </h2>
          </div>
          
          <div className="space-y-3 flex-1">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-white/5 rounded-[20px]" />
                ))}
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500">
                <CheckCircle2 className="w-12 h-12 mb-3 opacity-20" />
                <p>لا توجد مهام حالياً. أحسنت!</p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  key={task.id} 
                  className="group relative bg-white/5 border border-white/10 rounded-[24px] p-5 hover:bg-white/10 hover:border-[#82c91e]/40 transition-all flex items-start justify-between gap-4 overflow-hidden shadow-sm hover:shadow-[0_0_20px_rgba(130,201,30,0.15)] backdrop-blur-md z-10"
                >
                  <div className={cn("absolute top-0 right-0 w-1.5 h-full opacity-80 group-hover:opacity-100 transition-opacity", getStatusColor(task.status).split(' ')[0])} />
                  
                  <div className="flex-1">
                    <p className="text-white font-medium leading-relaxed mb-3">{task.text}</p>
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className={cn("px-2 py-0.5 rounded-full border bg-opacity-10", getStatusColor(task.status).replace('text-', 'bg-opacity-10 text-'))}>
                        {getStatusLabel(task.status)}
                      </span>
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {task.time}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <button 
                      onClick={() => handleToggleTask(task)}
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#82c91e] transition-all"
                      title="إكمال المهمة"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="حذف المهمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-[#111111]/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col h-full opacity-80 hover:opacity-100 transition-opacity relative overflow-hidden">
          <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)] pointer-events-none" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold flex items-center gap-3 text-gray-400">
              المهام المنجزة
              <span className="bg-white/5 text-gray-400 text-xs px-2.5 py-1 rounded-full">
                {completedTasks.length}
              </span>
            </h2>
          </div>
          
          <div className="space-y-3 flex-1">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-20 bg-white/5 rounded-[20px]" />
                ))}
              </div>
            ) : completedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-600">
                <p>لم تنجز أي مهمة بعد.</p>
              </div>
            ) : (
              completedTasks.map((task) => (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  key={task.id} 
                  className="group relative bg-white/[0.03] border border-white/5 rounded-[24px] p-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-all z-10"
                >
                  <div className="flex-1 flex items-center gap-4">
                    <CheckCircle2 className="w-5 h-5 text-[#82c91e] shrink-0" />
                    <p className="text-gray-500 line-through text-sm font-medium">{task.text}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleToggleTask(task)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      title="استعادة المهمة"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      title="حذف نهائي"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
