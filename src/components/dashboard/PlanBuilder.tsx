'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutExercise {
  id: string; // unique id for this assignment
  exerciseId: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: number;
  targetRpe?: number | null;
  targetRir?: number | null;
}

interface WorkoutDay {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
}

interface PlanBuilderProps {
  days: WorkoutDay[];
  onUpdateExercise: (dayId: string, exId: string, field: 'sets' | 'reps' | 'targetRpe' | 'targetRir', value: number | null) => void;
  onRemoveExercise: (dayId: string, exId: string) => void;
  onAddDay: () => void;
}

function SortableExerciseItem({ ex, dayId, onUpdate, onRemove }: { ex: WorkoutExercise, dayId: string, onUpdate: any, onRemove: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ex.id,
    data: { type: 'Exercise', exercise: ex, dayId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-black/30 border border-white/5 rounded-xl p-3 flex items-center gap-3 relative group",
        isDragging && "opacity-50 z-50 border-neon"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-white transition-colors">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="flex-1 flex flex-col gap-3 p-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="pr-2">
            <h5 className="text-sm font-bold text-white whitespace-normal break-words leading-tight">{ex.name}</h5>
            <span className="text-[10px] text-gray-500 font-medium mt-1 inline-block">{ex.targetMuscle}</span>
          </div>
          <button 
            onClick={() => onRemove(dayId, ex.id)}
            className="p-1.5 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 bg-red-400/10 shrink-0"
            title="حذف التمرين"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-2" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
            <span className="text-[11px] text-gray-400 font-medium">الجولات</span>
            <input 
              type="number" 
              value={ex.sets}
              onChange={(e) => onUpdate(dayId, ex.id, 'sets', parseInt(e.target.value) || 0)}
              className="w-10 bg-white/5 border border-transparent hover:border-white/20 rounded px-1 text-center text-sm font-bold text-white focus:border-neon outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
            <span className="text-[11px] text-gray-400 font-medium">التكرارات</span>
            <input 
              type="number" 
              value={ex.reps}
              onChange={(e) => onUpdate(dayId, ex.id, 'reps', parseInt(e.target.value) || 0)}
              className="w-10 bg-white/5 border border-transparent hover:border-white/20 rounded px-1 text-center text-sm font-bold text-white focus:border-neon outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
            <span className="text-[11px] text-gray-400 font-medium">RPE</span>
            <input 
              type="number" 
              value={ex.targetRpe || ''}
              placeholder="-"
              onChange={(e) => onUpdate(dayId, ex.id, 'targetRpe', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-10 bg-white/5 border border-transparent hover:border-white/20 rounded px-1 text-center text-sm font-bold text-white focus:border-neon outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg border border-white/5">
            <span className="text-[11px] text-gray-400 font-medium">RIR</span>
            <input 
              type="number" 
              value={ex.targetRir || ''}
              placeholder="-"
              onChange={(e) => onUpdate(dayId, ex.id, 'targetRir', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-10 bg-white/5 border border-transparent hover:border-white/20 rounded px-1 text-center text-sm font-bold text-white focus:border-neon outline-none transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function DayDroppable({ day, onUpdate, onRemove }: { day: WorkoutDay, onUpdate: any, onRemove: any }) {
  const { setNodeRef, isOver } = useDroppable({
    id: day.id,
    data: { type: 'Day', dayId: day.id }
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "border-2 rounded-2xl p-4 transition-all duration-300 min-h-[150px] flex flex-col",
        isOver 
          ? "border-dashed border-[#E50914] bg-[#E50914]/5 shadow-[0_0_20px_rgba(229,9,20,0.15)]" 
          : "border-solid border-white/5 bg-[#111]"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">{day.name}</h3>
        <span className="text-xs font-medium text-gray-500 bg-white/5 px-2 py-1 rounded-md">{day.exercises.length} تمارين</span>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <SortableContext items={day.exercises.map(e => e.id)} strategy={verticalListSortingStrategy}>
          {day.exercises.map(ex => (
            <SortableExerciseItem 
              key={ex.id} 
              ex={ex} 
              dayId={day.id} 
              onUpdate={onUpdate} 
              onRemove={onRemove} 
            />
          ))}
        </SortableContext>
        
        {day.exercises.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500 border border-dashed border-white/5 rounded-xl">
            اسحب التمارين وأفلتها هنا
          </div>
        )}
      </div>
    </div>
  );
}

export function PlanBuilder({ days, onUpdateExercise, onRemoveExercise, onAddDay }: PlanBuilderProps) {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-[2rem] overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-white/5 bg-[#111]">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">جدول المشترك</h2>
          <p className="text-xs text-gray-400">اسحب التمارين من المكتبة لتصميم النظام التدريبي</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {days.map(day => (
            <DayDroppable 
              key={day.id} 
              day={day} 
              onUpdate={onUpdateExercise} 
              onRemove={onRemoveExercise} 
            />
          ))}

          {/* Add Day Button */}
          <div 
            onClick={onAddDay}
            className="border-2 border-dashed border-white/10 rounded-2xl p-4 min-h-[150px] flex flex-col items-center justify-center text-gray-500 hover:text-neon hover:border-neon/30 hover:bg-neon/5 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">إضافة يوم جديد</span>
          </div>
        </div>
      </div>
    </div>
  );
}
