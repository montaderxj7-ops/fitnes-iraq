'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Save, Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { ExerciseLibrary } from './ExerciseLibrary';
import { PlanBuilder } from './PlanBuilder';
import { saveWorkoutPlan } from '@/actions/workouts';

interface WorkoutWorkspaceProps {
  clientId: string;
  initialExercises: any[];
  initialPlan?: any;
  onClose: () => void;
}

export function WorkoutWorkspace({ clientId, initialExercises, initialPlan, onClose }: WorkoutWorkspaceProps) {
  const [exercises, setExercises] = useState(initialExercises);
  const [days, setDays] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeExercise, setActiveExercise] = useState<any | null>(null);

  // Initialize days
  useEffect(() => {
    if (initialPlan && initialPlan.days && initialPlan.days.length > 0) {
      // Map existing plan
      const mappedDays = initialPlan.days.map((d: any) => ({
        id: d.id || uuidv4(),
        name: d.name,
        exercises: d.exercises.map((ex: any) => ({
          id: ex.id || uuidv4(),
          exerciseId: ex.exerciseId,
          name: ex.exercise?.name || 'تمرين',
          targetMuscle: ex.exercise?.targetMuscle || '',
          sets: ex.sets,
          reps: ex.reps
        }))
      }));
      setDays(mappedDays);
    } else {
      // Empty template
      setDays([
        { id: uuidv4(), name: 'اليوم الأول', exercises: [] },
        { id: uuidv4(), name: 'اليوم الثاني', exercises: [] },
        { id: uuidv4(), name: 'اليوم الثالث', exercises: [] },
      ]);
    }
  }, [initialPlan]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // 5px movement to start drag
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active.data.current?.type !== 'Exercise') {
      setActiveExercise(active.data.current?.exercise);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveExercise(null);

    if (!over) return;

    // Is dragging from library to day or an exercise inside a day
    if (active.id.toString().startsWith('lib-ex-')) {
      const exercise = active.data.current?.exercise;
      let dayId = null;
      
      if (over.data.current?.type === 'Day') {
        dayId = over.id;
      } else if (over.data.current?.type === 'Exercise') {
        dayId = over.data.current?.dayId;
      }

      if (exercise && dayId) {
        setDays(prevDays => prevDays.map(day => {
          if (day.id === dayId) {
            return {
              ...day,
              exercises: [...day.exercises, {
                id: uuidv4(),
                exerciseId: exercise.id,
                name: exercise.name,
                targetMuscle: exercise.targetMuscle,
                sets: exercise.defaultSets,
                reps: exercise.defaultReps
              }]
            };
          }
          return day;
        }));
      }
    }
    
    // Future enhancement: Handle sorting between days using SortableContext
  };

  const handleUpdateExercise = (dayId: string, exId: string, field: 'sets' | 'reps', value: number) => {
    setDays(prevDays => prevDays.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.map((ex: any) => 
            ex.id === exId ? { ...ex, [field]: value } : ex
          )
        };
      }
      return day;
    }));
  };

  const handleRemoveExercise = (dayId: string, exId: string) => {
    setDays(prevDays => prevDays.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          exercises: day.exercises.filter((ex: any) => ex.id !== exId)
        };
      }
      return day;
    }));
  };

  const handleAddDay = () => {
    setDays([...days, { id: uuidv4(), name: `اليوم ${days.length + 1}`, exercises: [] }]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const planData = { days };
    const res = await saveWorkoutPlan(clientId, planData);
    if (res.success) {
      toast.success("تم حفظ النظام التدريبي بنجاح!");
      onClose(); // Exit workspace
    } else {
      toast.error("حدث خطأ أثناء الحفظ");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-[#111]">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-white">مساحة عمل النظام التدريبي</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm font-bold">
            <Copy className="w-4 h-4" />
            استنساخ خطة
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-neon text-black font-black hover:bg-[#c4e649] transition-colors shadow-[0_0_15px_rgba(214,248,84,0.2)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "جاري الحفظ..." : "حفظ النظام"}
          </button>
        </div>
      </div>

      {/* Workspace Area */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          <div className="lg:col-span-2 min-h-0">
            <PlanBuilder 
              days={days} 
              onUpdateExercise={handleUpdateExercise} 
              onRemoveExercise={handleRemoveExercise} 
              onAddDay={handleAddDay}
            />
          </div>
          <div className="min-h-0">
            <ExerciseLibrary 
              exercises={exercises} 
              onAddExercise={(newEx) => setExercises([newEx, ...exercises])}
            />
          </div>
        </div>

        <DragOverlay>
          {activeExercise ? (
            <div className="p-3 rounded-xl bg-black/80 border border-neon shadow-[0_0_20px_rgba(214,248,84,0.4)] flex items-center gap-3 w-64 rotate-3 opacity-90 backdrop-blur-sm">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{activeExercise.name}</h4>
                <span className="text-[10px] text-neon">{activeExercise.targetMuscle}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
