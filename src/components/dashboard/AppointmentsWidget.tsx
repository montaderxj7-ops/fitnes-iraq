"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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

function CustomTimeSelect({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const timeOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = i.toString().padStart(2, '0');
        const minute = j.toString().padStart(2, '0');
        const ampm = i >= 12 ? 'م' : 'ص';
        const displayHour = i % 12 === 0 ? 12 : i % 12;
        const displayHourStr = displayHour.toString().padStart(2, '0');
        opts.push({
          value: `${hour}:${minute}`,
          label: `${displayHourStr}:${minute} ${ampm}`
        });
      }
    }
    return opts;
  }, []);

  const selectedLabel = timeOptions.find(o => o.value === value)?.label || value;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#82c91e]/50 focus:outline-none transition-colors hover:border-white/20"
      >
        <span>{selectedLabel}</span>
        <Clock className="w-4 h-4 text-gray-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1a1f1a] border border-white/10 rounded-xl max-h-48 overflow-y-auto custom-scrollbar shadow-2xl"
          >
            <div className="p-1">
              {timeOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    "w-full text-right px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-between",
                    value === opt.value ? "bg-[#82c91e] text-[#1a1f1a] font-bold" : "text-gray-300 hover:bg-white/5 hover:text-white"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                  {value === opt.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppointmentsWidget() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState("");
  const [newClientName, setNewClientName] = useState("");
  const [newTime, setNewTime] = useState("10:00");
  const [newDuration, setNewDuration] = useState(60);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const res = await getAppointments(startOfDay.toISOString(), endOfDay.toISOString());
    if (res.success && res.appointments) {
      setAppointments(res.appointments as any[]);
    }
    setIsLoading(false);
  };

  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
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
    setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
    await updateAppointmentStatus(id, newStatus);
  };

  const handleDelete = async (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
    await deleteAppointment(id);
  };

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
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
    <div className="bg-[#111111]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-6 h-[calc(100vh-3rem)] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-2xl font-black text-white flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-[#82c91e]/10 flex items-center justify-center border border-[#82c91e]/20 shadow-[0_0_15px_rgba(130,201,30,0.15)]">
            <CalendarIcon className="w-6 h-6 text-[#82c91e] drop-shadow-[0_0_5px_currentColor]" />
          </span>
          <div className="flex flex-col">
            <span>جلساتك</span>
            <span className="text-sm font-medium text-gray-400">المجدولة</span>
          </div>
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="bg-[#82c91e] hover:bg-[#93e022] text-[#1a1f1a] w-12 h-12 md:w-auto md:px-5 md:h-12 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all shadow-[0_0_20px_rgba(130,201,30,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden md:block">جلسة جديدة</span>
        </motion.button>
      </div>

      <div className="bg-black/40 backdrop-blur-md rounded-[24px] p-2 flex justify-between mb-8 border border-white/5 shadow-inner relative z-10">
        {weekDates.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          return (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              key={i}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "flex flex-col items-center justify-center w-[13%] py-3 rounded-[18px] transition-all relative overflow-hidden",
                isSelected ? "bg-[#82c91e] text-[#1a1f1a] shadow-[0_0_20px_rgba(130,201,30,0.3)] border border-[#82c91e]/50" : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {isSelected && <motion.div layoutId="selectedDay" className="absolute inset-0 bg-[#82c91e] z-0" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
              <span className="text-[10px] font-bold mb-1 relative z-10 opacity-80">{isToday ? "اليوم" : arabicDays[date.getDay()]}</span>
              <span className="text-lg font-black relative z-10 drop-shadow-sm">{date.getDate()}</span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleAddAppointment}
            className="flex-1 bg-black/40 border border-white/10 rounded-[32px] p-8 relative z-10 backdrop-blur-xl"
          >
            <button type="button" onClick={resetForm} className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-white text-xl font-bold mb-6">{editingId ? "تعديل الجلسة" : "إضافة جلسة جديدة"}</h3>
            <div className="space-y-5">
              <input type="text" placeholder="عنوان الجلسة" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#82c91e]/50 outline-none" />
              <input type="text" placeholder="اسم المتدرب" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-[#82c91e]/50 outline-none" />
              <div className="flex gap-4">
                <div className="flex-1">
                  <CustomTimeSelect value={newTime} onChange={setNewTime} />
                </div>
                <select value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none">
                  <option value={30}>30 دقيقة</option>
                  <option value={60}>60 دقيقة</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#82c91e] text-[#1a1f1a] font-bold py-4 rounded-2xl hover:bg-[#93e022] transition-colors">
                {isSubmitting ? "جاري الحفظ..." : "حفظ الجلسة"}
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4 custom-scrollbar relative z-10 pb-6"
          >
            <AnimatePresence>
            {isLoading ? (
              <div className="animate-pulse space-y-4">{[1, 2].map(i => <div key={i} className="h-28 bg-white/5 rounded-[24px]" />)}</div>
            ) : appointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <CalendarClock className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-medium text-lg">لا توجد جلسات مجدولة لهذا اليوم</p>
              </div>
            ) : (
              appointments.map((appointment) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={appointment.id}
                  className={cn(
                    "p-5 rounded-[24px] border transition-all flex items-center justify-between group relative overflow-hidden backdrop-blur-md",
                    appointment.status === 'completed' 
                      ? "bg-[#82c91e]/5 border-[#82c91e]/20" 
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                  )}
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-1.5 h-full opacity-80",
                    appointment.status === 'completed' ? "bg-[#82c91e] shadow-[0_0_10px_#82c91e]" : "bg-gray-500 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                  )} />
                  <div className="flex-1 pl-4">
                    <p className={cn("font-bold text-lg mb-1 transition-colors", appointment.status === 'completed' ? "text-gray-400 line-through" : "text-white group-hover:text-[#82c91e]")}>
                      {appointment.title}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                      <span className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-md border border-white/5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(appointment.date)} ({appointment.duration} دقيقة)
                      </span>
                      {appointment.clientName && (
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          {appointment.clientName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleComplete(appointment.id, appointment.status)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        appointment.status === 'completed' ? "bg-white/10 text-gray-400 hover:text-white" : "bg-[#82c91e]/10 text-[#82c91e] hover:bg-[#82c91e] hover:text-[#1a1f1a]"
                      )}
                      title={appointment.status === 'completed' ? "التراجع" : "تحديد كمكتملة"}
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
                </motion.div>
              ))
            )}
          </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
