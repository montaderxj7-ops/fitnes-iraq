"use client";

import { useState } from "react";
import { saveExerciseLog } from "@/actions/exercise-logs";
import { CheckCircle2, ChevronDown, Dumbbell, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ExerciseTracker({ 
  clientId, 
  workoutExerciseId, 
  targetSets, 
  targetReps,
  targetRpe,
  targetRir,
  coachPrimaryColor 
}: { 
  clientId: string; 
  workoutExerciseId: string; 
  targetSets: number; 
  targetReps: number;
  targetRpe?: number;
  targetRir?: number;
  coachPrimaryColor: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sets, setSets] = useState<any[]>(
    Array.from({ length: targetSets }).map((_, i) => ({
      setNumber: i + 1,
      reps: targetReps,
      weight: '',
      rpe: '',
      rir: ''
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleUpdateSet = (index: number, field: string, value: string) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
    setIsSaved(false);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaving(true);
    const formattedSets = sets.map(s => ({
      setNumber: s.setNumber,
      reps: parseInt(s.reps) || targetReps,
      weight: parseFloat(s.weight) || 0,
      rpe: s.rpe ? parseFloat(s.rpe) : undefined,
      rir: s.rir ? parseFloat(s.rir) : undefined
    }));

    const res = await saveExerciseLog({
      clientId,
      workoutExerciseId,
      date: new Date(),
      sets: formattedSets
    });

    setIsSaving(false);
    if (res.success) {
      setIsSaved(true);
      setTimeout(() => setIsExpanded(false), 1500);
    } else {
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <div className="w-full mt-2" onClick={e => e.stopPropagation()}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 font-bold hover:bg-white/10 transition-colors"
      >
        <Dumbbell className="w-3.5 h-3.5" style={{ color: coachPrimaryColor }} />
        سجل أوزانك (Progress)
        <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-4">
              {(targetRpe || targetRir) && (
                <div className="flex gap-4 text-xs">
                  {targetRpe && (
                    <span className="text-gray-400">الهدف RPE: <strong className="text-white">{targetRpe}</strong></span>
                  )}
                  {targetRir && (
                    <span className="text-gray-400">الهدف RIR: <strong className="text-white">{targetRir}</strong></span>
                  )}
                </div>
              )}
              
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-gray-500 font-bold px-1">
                  <div>الجولة</div>
                  <div>الوزن(kg)</div>
                  <div>التكرار</div>
                  <div>RPE</div>
                  <div>RIR</div>
                </div>

                {sets.map((set, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                    <div className="text-center text-xs font-bold text-gray-300 bg-white/5 py-2 rounded-lg">{set.setNumber}</div>
                    <input 
                      type="number" 
                      value={set.weight}
                      onChange={(e) => handleUpdateSet(idx, 'weight', e.target.value)}
                      placeholder="-"
                      className="bg-white/10 border border-white/5 rounded-lg py-2 px-1 text-center text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <input 
                      type="number" 
                      value={set.reps}
                      onChange={(e) => handleUpdateSet(idx, 'reps', e.target.value)}
                      className="bg-white/10 border border-white/5 rounded-lg py-2 px-1 text-center text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <input 
                      type="number" 
                      value={set.rpe}
                      onChange={(e) => handleUpdateSet(idx, 'rpe', e.target.value)}
                      placeholder="-"
                      className="bg-white/10 border border-white/5 rounded-lg py-2 px-1 text-center text-xs text-white focus:outline-none focus:border-white/30"
                    />
                    <input 
                      type="number" 
                      value={set.rir}
                      onChange={(e) => handleUpdateSet(idx, 'rir', e.target.value)}
                      placeholder="-"
                      className="bg-white/10 border border-white/5 rounded-lg py-2 px-1 text-center text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || isSaved}
                className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all mt-4"
                style={{ 
                  backgroundColor: isSaved ? '#22c55e' : coachPrimaryColor,
                  color: isSaved ? '#fff' : '#000'
                }}
              >
                {isSaving ? "جاري الحفظ..." : isSaved ? (
                  <>تم الحفظ بنجاح <CheckCircle2 className="w-4 h-4" /></>
                ) : (
                  "حفظ السجل"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
