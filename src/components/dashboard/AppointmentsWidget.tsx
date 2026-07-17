"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, Plus, X, Check, Trash2, CalendarClock, User, Edit } from "lucide-react";
import { getAppointments, createAppointment, updateAppointmentStatus, deleteAppointment, editAppointment } from "@/actions/appointments";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Appointment = {
  id: string;
  title: string;
  date: Date;
  clientName?: string | null;
  duration: number;
  status: string;
};

export function AppointmentsWidget() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newDuration, setNewDuration] = useState(60);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    // Format date as YYYY-MM-DD
    const dateStr = selectedDate.toISOString().split('T')[0];
    const res = await getAppointments(dateStr);
    
    if (res.success && res.appointments) {
      setAppointments(res.appointments as any[]);
    }
    setIsLoading(false);
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setIsSubmitting(true);
    
    // Combine selected date and new time
    const [hours, minutes] = newTime.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    if (editingId) {
      const res = await editAppointment(editingId, {
        title: newTitle,
        date: appointmentDate,
        clientName: newClientName,
        duration: newDuration,
      });

      if (res.success && res.appointment) {
        setAppointments(appointments.map(a => a.id === editingId ? (res.appointment as any) : a).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        resetForm();
        toast.success("تم تعديل الجلسة بنجاح!");
      } else {
        toast.error(res.error || "حدث خطأ أثناء تعديل الجلسة");
      }
    } else {
      const res = await createAppointment({
        title: newTitle,
        date: appointmentDate,
        clientName: newClientName,
        duration: newDuration,
      });

      if (res.success && res.appointment) {
        setAppointments([...appointments, res.appointment as any].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        resetForm();
        toast.success("تم حفظ الجلسة بنجاح!");
      } else {
        toast.error(res.error || "حدث خطأ أثناء حفظ الجلسة");
      }
    }
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewTitle("");
    setNewClientName("");
    setNewTime("10:00");
    setNewDuration(60);
  };

  const handleEditClick = (appointment: Appointment) => {
    setNewTitle(appointment.title);
    setNewClientName(appointment.clientName || "");
    const d = new Date(appointment.date);
    setNewTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
    setNewDuration(appointment.duration);
    setEditingId(appointment.id);
    setIsAdding(true);
  };

  const handleComplete = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "completed" ? "scheduled" : "completed";
    
    // Optimistic update
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
    await updateAppointmentStatus(id, newStatus);
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    setAppointments(appointments.filter(a => a.id !== id));
    await deleteAppointment(id);
  };

  // Generate simple week days for calendar
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    // Show 3 days before, today, and 3 days after
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const arabicDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  return (
    <div className="bg-[#1a1f1a] border border-white/5 rounded-[32px] p-6 flex flex-col h-full relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#82c91e]/10 rounded-full blur-3xl" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h2 className="text-xl font-bold flex items-center gap-3 text-white">
          <span className="w-10 h-10 rounded-full bg-[#82c91e]/10 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-[#82c91e]" />
          </span>
          جلساتك المجدولة
        </h2>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="text-sm bg-[#82c91e] text-[#1a1f1a] hover:bg-[#93e022] font-bold flex items-center gap-1 px-4 py-2 rounded-full transition-all shadow-[0_0_15px_rgba(130,201,30,0.3)] hover:shadow-[0_0_20px_rgba(130,201,30,0.5)]"
        >
          <Plus className="w-4 h-4" />
          جلسة جديدة
        </button>
      </div>

      {/* Mini Calendar Strip */}
      <div className="flex justify-between items-center mb-6 relative z-10 bg-black/20 p-2 rounded-[20px] border border-white/5">
        {weekDates.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-[16px] transition-all min-w-[45px]",
                isSelected 
                  ? "bg-[#82c91e] text-[#1a1f1a] shadow-[0_0_10px_rgba(130,201,30,0.3)]" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className={cn("text-[10px] font-medium mb-1", isSelected ? "text-[#1a1f1a]/70" : "text-gray-500")}>
                {isToday ? "اليوم" : arabicDays[date.getDay()]}
              </span>
              <span className="text-lg font-bold">
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleAddAppointment}
            className="flex-1 bg-black/40 border border-white/10 rounded-[24px] p-5 relative z-10"
          >
            <button 
              type="button" 
              onClick={resetForm}
              className="absolute top-4 left-4 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-white font-bold mb-4">{editingId ? "تعديل الجلسة" : "تفاصيل الجلسة الجديدة"}</h3>
            
            <div className="space-y-4">
              <div>
                <input 
                  type="text" 
                  placeholder="عنوان الجلسة (مثال: تدريب شخصي)"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#82c91e]/50 focus:outline-none"
                />
              </div>
              <div>
                <input 
                  type="text" 
                  placeholder="اسم المتدرب (اختياري)"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#82c91e]/50 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 mb-1 block">الوقت</label>
                  <input 
                    type="time" 
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#82c91e]/50 focus:outline-none [color-scheme:dark]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-500 mb-1 block">المدة (دقائق)</label>
                  <select 
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#82c91e]/50 focus:outline-none appearance-none"
                  >
                    <option value={30} className="bg-gray-900">30 دقيقة</option>
                    <option value={45} className="bg-gray-900">45 دقيقة</option>
                    <option value={60} className="bg-gray-900">60 دقيقة</option>
                    <option value={90} className="bg-gray-900">90 دقيقة</option>
                    <option value={120} className="bg-gray-900">120 دقيقة</option>
                  </select>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#82c91e] hover:bg-[#93e022] text-[#1a1f1a] font-bold py-3 rounded-xl mt-2 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "حفظ الجلسة"}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            key={selectedDate.toString()}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 relative z-10 min-h-[250px]"
          >
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-white/5 rounded-[20px]" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-10">
                <CalendarClock className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium text-lg text-gray-400">لا توجد جلسات مجدولة</p>
                <p className="text-sm mt-1">لهذا اليوم. يمكنك أخذ قسط من الراحة! ☕</p>
              </div>
            ) : (
              appointments.map((appointment) => {
                const isCompleted = appointment.status === "completed";
                return (
                  <div 
                    key={appointment.id} 
                    className={cn(
                      "group bg-black/40 border rounded-[20px] p-4 transition-all flex items-start gap-4",
                      isCompleted ? "border-white/5 opacity-60" : "border-[#82c91e]/20 hover:border-[#82c91e]/50"
                    )}
                  >
                    <div className="flex flex-col items-center justify-center min-w-[60px] bg-white/5 rounded-[12px] p-2">
                      <span className="text-white font-bold text-sm">{formatTime(appointment.date)}</span>
                      <span className="text-[10px] text-gray-500 mt-1">{appointment.duration} دقيقة</span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={cn("font-bold mb-1", isCompleted ? "text-gray-400 line-through" : "text-white")}>
                        {appointment.title}
                      </h4>
                      {appointment.clientName && (
                        <p className="text-sm text-gray-400 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {appointment.clientName}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleComplete(appointment.id, appointment.status)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                          isCompleted ? "bg-white/10 text-gray-400 hover:text-white" : "bg-[#82c91e]/10 text-[#82c91e] hover:bg-[#82c91e] hover:text-[#1a1f1a]"
                        )}
                        title={isCompleted ? "التراجع" : "تحديد كمكتملة"}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditClick(appointment)}
                        className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-all"
                        title="تعديل الجلسة"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(appointment.id)}
                        className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                        title="إلغاء الجلسة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
