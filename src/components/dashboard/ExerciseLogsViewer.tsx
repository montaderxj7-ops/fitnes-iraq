"use client";

import { useState, useEffect } from "react";
import { getExerciseLogs } from "@/actions/exercise-logs";
import { motion } from "framer-motion";
import { Activity, Dumbbell, X, Target, Calendar } from "lucide-react";

export function ExerciseLogsViewer({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      const res = await getExerciseLogs(clientId);
      if (res.success && res.logs) {
        setLogs(res.logs);
      }
      setLoading(false);
    }
    loadLogs();
  }, [clientId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
        dir="rtl"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neon/10 border border-neon/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">تقدم المتدرب (Metrics)</h2>
              <p className="text-sm text-gray-400">تتبع الأوزان، الجهد (RPE) والتكرارات.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-10 text-gray-400">جاري التحميل...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">لا توجد أي سجلات تدريب مسجلة بعد.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <Dumbbell className="w-5 h-5 text-neon" />
                    <h3 className="text-lg font-bold text-white">{log.workoutExercise?.exercise?.name || "تمرين"}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(log.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {log.workoutExercise && (log.workoutExercise.targetRpe || log.workoutExercise.targetRir) && (
                  <div className="flex gap-4 mb-4 text-sm">
                    {log.workoutExercise.targetRpe && (
                      <span className="bg-white/5 px-3 py-1 rounded-lg text-gray-300">الهدف RPE: <strong className="text-white">{log.workoutExercise.targetRpe}</strong></span>
                    )}
                    {log.workoutExercise.targetRir && (
                      <span className="bg-white/5 px-3 py-1 rounded-lg text-gray-300">الهدف RIR: <strong className="text-white">{log.workoutExercise.targetRir}</strong></span>
                    )}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="text-gray-400 border-b border-white/5">
                      <tr>
                        <th className="py-2 px-4 font-medium">الجولة</th>
                        <th className="py-2 px-4 font-medium">الوزن (kg)</th>
                        <th className="py-2 px-4 font-medium">التكرارات</th>
                        <th className="py-2 px-4 font-medium">RPE</th>
                        <th className="py-2 px-4 font-medium">RIR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {Array.isArray(log.sets) && log.sets.map((set: any, idx: number) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 font-bold text-white">{set.setNumber}</td>
                          <td className="py-3 px-4 font-medium text-neon">{set.weight || '-'}</td>
                          <td className="py-3 px-4 font-medium text-gray-300">{set.reps || '-'}</td>
                          <td className="py-3 px-4 font-medium text-gray-300">{set.rpe || '-'}</td>
                          <td className="py-3 px-4 font-medium text-gray-300">{set.rir || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {log.notes && (
                  <div className="mt-4 p-4 bg-black/40 rounded-xl text-sm text-gray-400">
                    <strong className="text-gray-300">ملاحظات:</strong> {log.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
