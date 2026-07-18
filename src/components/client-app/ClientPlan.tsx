import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Utensils, Pill, ChevronDown, CheckCircle2, Flame, PlayCircle, Clock, Save, Check, Square, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoachData } from './ClientAppFlow';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getWorkoutPlan } from '@/actions/workouts';
import { getNutritionPlan } from '@/actions/nutrition';
import { getSupplementPlan } from '@/actions/supplements';

interface ClientPlanProps {
  coach: CoachData;
  userData?: { id?: string; name: string; email: string };
}

// Mock Data for the Plan
const mockWorkoutPlan = [
  { day: 1, title: 'Push Day (الصدر والترايسبس)', rest: false, exercises: [
    { name: 'Barbell Bench Press', sets: 4, reps: '8-10' },
    { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12' },
    { name: 'Cable Crossovers', sets: 3, reps: '12-15' },
    { name: 'Triceps Pushdown', sets: 4, reps: '12-15' },
  ]},
  { day: 2, title: 'Pull Day (الظهر والبايسبس)', rest: false, exercises: [
    { name: 'Lat Pulldown', sets: 4, reps: '10-12' },
    { name: 'Barbell Rows', sets: 3, reps: '8-10' },
    { name: 'Face Pulls', sets: 3, reps: '15' },
    { name: 'Bicep Curls', sets: 4, reps: '12-15' },
  ]},
  { day: 3, title: 'راحة واستشفاء', rest: true, exercises: [] },
  { day: 4, title: 'Legs Day (الأرجل)', rest: false, exercises: [
    { name: 'Squats', sets: 4, reps: '8-10' },
    { name: 'Leg Press', sets: 3, reps: '10-12' },
    { name: 'Leg Extensions', sets: 3, reps: '15' },
    { name: 'Calf Raises', sets: 4, reps: '15-20' },
  ]},
];

// Mock Data removed

export function ClientPlan({ coach, userData }: ClientPlanProps) {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'supplements'>('workout');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [trackedWeights, setTrackedWeights] = useState<Record<string, string>>({});
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [tempWeight, setTempWeight] = useState<string>('');
  const [completedMeals, setCompletedMeals] = useState<Record<number, boolean>>({});
  
  const [workoutPlan, setWorkoutPlan] = useState<any[]>([]);
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [supplementPlan, setSupplementPlan] = useState<any>(null);
  const [hasPlan, setHasPlan] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  React.useEffect(() => {
    async function fetchPlan() {
      if (userData?.id) {
        try {
          const res = await getWorkoutPlan(userData.id);
          if (res.success && res.plan) {
            const mappedDays = res.plan.days.map((d: any, index: number) => ({
              day: index + 1,
              title: d.name,
              rest: d.exercises.length === 0,
              exercises: d.exercises.map((ex: any) => ({
                name: ex.exercise?.name || 'تمرين',
                sets: ex.exercise?.defaultSets || 3,
                reps: ex.exercise?.defaultReps || 12,
                mediaUrl: ex.exercise?.mediaUrl
              }))
            }));
            if (mappedDays.length > 0) {
              setWorkoutPlan(mappedDays);
              setHasPlan(true);
            }
          }

          const nutRes = await getNutritionPlan(userData.id);
          if (nutRes.success && nutRes.plan) {
            setNutritionPlan(nutRes.plan);
          }

          const suppRes = await getSupplementPlan(userData.id);
          if (suppRes.success && suppRes.plan) {
            setSupplementPlan(suppRes.plan);
          }
        } catch (error) {
          console.error("Error loading plan:", error);
        }
      }
      setIsLoadingPlan(false);
    }
    fetchPlan();
  }, [userData]);
  
  const completedMealsCount = Object.values(completedMeals).filter(Boolean).length;
  const totalMealsCount = 0;
  const nutritionProgress = 0;

  const getDayInfo = (dayNumber: number) => {
    const date = new Date();
    const currentDay = date.getDay(); 
    const targetDayOfWeek = dayNumber === 7 ? 6 : dayNumber % 7; // Assuming Day 1 = Sunday (0), Day 2 = Monday (1)... Day 7 = Saturday (6)
    
    // Find the date for this day of the current week
    const diff = targetDayOfWeek - currentDay;
    const targetDate = new Date(date);
    targetDate.setDate(date.getDate() + diff);

    const dayName = new Intl.DateTimeFormat('ar-EG', { weekday: 'long' }).format(targetDate);
    const formattedDate = new Intl.DateTimeFormat('ar-EG', { month: 'short', day: 'numeric' }).format(targetDate);
    const isToday = diff === 0;

    return { dayName, formattedDate, isToday };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full flex flex-col relative bg-[#0a0a0a] text-white overflow-hidden" dir={dir}>
      <div className="flex-1 overflow-y-auto pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Header */}
        <div className="pt-8 px-6 pb-4">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-white mb-2">{t('plan.title')}</h1>
            <p className="text-gray-400 text-sm">هنا تجد كل تفاصيل خطتك المصممة خصيصاً لك.</p>
          </motion.div>
        </div>

        {/* Custom Tabs */}
        <div className="px-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-1.5 flex items-center">
            <button
              onClick={() => setActiveTab('workout')}
              className={cn(
                "flex-1 py-2 px-1 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all relative z-10",
                activeTab === 'workout' ? "text-black" : "text-gray-400 hover:text-white"
              )}
            >
              {activeTab === 'workout' && (
                <motion.div layoutId="planTab" className="absolute inset-0 rounded-xl" style={{ backgroundColor: coach.primaryColor }} />
              )}
              <Dumbbell className="w-4 h-4 md:w-5 md:h-5 shrink-0 relative z-10" />
              <span className="relative z-10 text-[10px] sm:text-xs md:text-sm text-center leading-tight">{t('plan.workout')}</span>
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={cn(
                "flex-1 py-2 px-1 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all relative z-10",
                activeTab === 'nutrition' ? "text-black" : "text-gray-400 hover:text-white"
              )}
            >
              {activeTab === 'nutrition' && (
                <motion.div layoutId="planTab" className="absolute inset-0 rounded-xl" style={{ backgroundColor: coach.primaryColor }} />
              )}
              <Utensils className="w-4 h-4 md:w-5 md:h-5 shrink-0 relative z-10" />
              <span className="relative z-10 text-[10px] sm:text-xs md:text-sm text-center leading-tight">{t('plan.nutrition')}</span>
            </button>
            <button
              onClick={() => setActiveTab('supplements')}
              className={cn(
                "flex-1 py-2 px-1 rounded-xl font-bold flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-all relative z-10",
                activeTab === 'supplements' ? "text-black" : "text-gray-400 hover:text-white"
              )}
            >
              {activeTab === 'supplements' && (
                <motion.div layoutId="planTab" className="absolute inset-0 rounded-xl" style={{ backgroundColor: coach.primaryColor }} />
              )}
              <Pill className="w-4 h-4 md:w-5 md:h-5 shrink-0 relative z-10" />
              <span className="relative z-10 text-[10px] sm:text-xs md:text-sm text-center leading-tight">{t('plan.supplements')}</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* WORKOUT TAB */}
          {activeTab === 'workout' && (
            <motion.div
              key="workout"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="px-6 space-y-4">
                {isLoadingPlan ? (
                  <div className="text-center text-gray-500 text-sm py-10">جاري تحميل الخطة التدريبية...</div>
                ) : workoutPlan.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-10">لا توجد خطة تدريبية مخصصة لك حتى الآن.</div>
                ) : workoutPlan.map((day) => (
                  <motion.div variants={itemVariants} key={day.day} className="bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-white/5 rounded-[2rem] overflow-hidden shadow-lg relative group">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <button 
                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                    className="w-full p-5 flex items-center justify-between relative z-10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex flex-col items-center justify-center border shadow-inner relative overflow-hidden transition-colors",
                        getDayInfo(day.day).isToday 
                          ? "bg-[#D6F854]/10 border-[#D6F854]/30" 
                          : "bg-black/50 border-white/10"
                      )}>
                        {getDayInfo(day.day).isToday && (
                          <div className="absolute top-0 right-0 w-full h-full opacity-20 blur-md translate-y-1/2" style={{ backgroundColor: coach.primaryColor }} />
                        )}
                        <span className="text-[11px] text-gray-400 font-bold relative z-10">{getDayInfo(day.day).dayName}</span>
                        <span className="text-sm font-black relative z-10 drop-shadow-md mt-0.5" style={{ color: getDayInfo(day.day).isToday ? coach.primaryColor : 'white' }}>{getDayInfo(day.day).formattedDate}</span>
                        {getDayInfo(day.day).isToday && (
                          <span className="absolute top-0 right-0 w-2 h-2 bg-[#D6F854] rounded-full m-1" />
                        )}
                      </div>
                      <div className={`flex-1 text-${dir === 'rtl' ? 'right' : 'left'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-white text-lg md:text-xl leading-tight">{day.title}</h3>
                          {getDayInfo(day.day).isToday && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D6F854]/20 text-[#D6F854]">اليوم</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                          {day.rest ? (
                            <><Clock className="w-3.5 h-3.5" /> {t('plan.rest')}</>
                          ) : (
                            <><Dumbbell className="w-3.5 h-3.5" style={{ color: coach.primaryColor }} /> {day.exercises.length} {t('plan.workout')}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className={cn("w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-300", expandedDay === day.day && "rotate-180 bg-white/10")}>
                      <ChevronDown className="w-5 h-5 text-gray-300" />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {expandedDay === day.day && !day.rest && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5 bg-black/20"
                      >
                        <div className="p-3 space-y-2">
                          {day.exercises.map((ex: any, idx: number) => {
                            const exId = `${day.day}-${idx}`;
                            const isEditing = editingWeightId === exId;
                            return (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[1.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group gap-4 relative overflow-hidden">
                              <div className="flex items-start sm:items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-sm font-bold text-gray-400 group-hover:text-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all shrink-0">
                                  {idx + 1}
                                </div>
                                <div>
                                  <span className="font-bold text-sm sm:text-base text-gray-200 leading-tight block">{ex.name}</span>
                                </div>
                              </div>
                              <div className={`flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-wider ${dir === 'rtl' ? 'mr-14 sm:mr-0' : 'ml-14 sm:ml-0'}`}>
                                <span className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-gray-300 shadow-inner flex items-center gap-1.5 h-[38px]">
                                  <span className="text-sm">{ex.sets}</span> {t('plan.sets')}
                                </span>
                                <span className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 shadow-inner flex items-center gap-1.5 h-[38px]" style={{ color: coach.primaryColor, borderColor: `${coach.primaryColor}30` }}>
                                  <span className="text-sm">{ex.reps}</span> {t('plan.reps')}
                                </span>
                                {/* Weight Tracking Pill */}
                                <div className="relative">
                                  {isEditing ? (
                                    <div className="flex items-center gap-1 bg-black/60 border border-white/20 px-1 py-1 rounded-xl shadow-inner h-[38px]">
                                      <input
                                        type="number"
                                        value={tempWeight}
                                        onChange={(e) => setTempWeight(e.target.value)}
                                        placeholder="كجم"
                                        className="bg-transparent w-12 text-center text-xs text-white focus:outline-none"
                                        autoFocus
                                      />
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if(tempWeight.trim()) {
                                            setTrackedWeights(prev => ({ ...prev, [exId]: tempWeight }));
                                          }
                                          setEditingWeightId(null);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-white/10 hover:bg-green-500/20 text-white hover:text-green-400 transition-colors"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTempWeight(trackedWeights[exId] || '');
                                        setEditingWeightId(exId);
                                      }}
                                      className={cn("px-3 py-2 rounded-xl border shadow-inner flex items-center gap-1.5 transition-colors h-[38px]", trackedWeights[exId] ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-black/40 border-white/10 text-gray-400 hover:text-white")}
                                    >
                                      <Dumbbell className="w-3 h-3" />
                                      <span className="text-sm mt-0.5">{trackedWeights[exId] ? `${trackedWeights[exId]} كجم` : 'الوزن'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )})}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
              </div>
            </motion.div>
          )}

          {/* NUTRITION TAB */}
          {activeTab === 'nutrition' && (
            <motion.div
              key="nutrition"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="px-6 space-y-6"
            >
              {isLoadingPlan ? (
                <div className="text-center text-gray-500 text-sm py-10">جاري تحميل الخطة الغذائية...</div>
              ) : !nutritionPlan || nutritionPlan.days.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-10 flex flex-col items-center justify-center min-h-[300px]">لا توجد خطة تغذية مخصصة لك حتى الآن.</div>
              ) : (
                <div className="space-y-4">
                  {nutritionPlan.days.map((day: any) => {
                    let totalCalories = 0;
                    let totalProtein = 0;
                    let totalCarbs = 0;
                    let totalFats = 0;
                    day.meals.forEach((meal: any) => {
                      meal.foods.forEach((mf: any) => {
                        totalCalories += mf.food?.calories || 0;
                        totalProtein += mf.food?.protein || 0;
                        totalCarbs += mf.food?.carbs || 0;
                        totalFats += mf.food?.fats || 0;
                      });
                    });

                    return (
                      <motion.div variants={itemVariants} key={day.id} className="bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden shadow-lg">
                        <div className="p-5 flex flex-col gap-3 border-b border-white/5 bg-gradient-to-r from-blue-500/10 to-transparent">
                          <h3 className="text-xl font-bold text-white">{day.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-bold text-gray-300 bg-white/10 px-3 py-1.5 rounded-xl">{totalCalories.toFixed(0)} سعرة</span>
                            <span className="text-xs font-bold text-red-400 bg-red-400/10 px-3 py-1.5 rounded-xl">P: {totalProtein.toFixed(0)}g</span>
                            <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1.5 rounded-xl">C: {totalCarbs.toFixed(0)}g</span>
                            <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-xl">F: {totalFats.toFixed(0)}g</span>
                          </div>
                        </div>
                        
                        <div className="p-4 space-y-4 bg-black/20">
                          {day.meals.map((meal: any, idx: number) => {
                            const mealCalories = meal.foods.reduce((acc: number, curr: any) => acc + (curr.food?.calories || 0), 0);
                            return (
                              <div key={meal.id} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                                    <h4 className="text-white font-bold">{meal.name}</h4>
                                  </div>
                                  <span className="text-xs text-gray-400">{mealCalories.toFixed(0)} سعرة</span>
                                </div>
                                <div className="space-y-3">
                                  {meal.foods.map((mf: any) => (
                                    <div key={mf.id} className="flex items-center justify-between group">
                                      <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-gray-600 group-hover:bg-blue-400 transition-colors" />
                                        <div>
                                          <p className="text-sm font-medium text-gray-200">{mf.food?.name}</p>
                                          <p className="text-[10px] text-gray-500">{mf.food?.calories} سعرة | P:{mf.food?.protein} C:{mf.food?.carbs} F:{mf.food?.fats}</p>
                                          {mf.food?.ingredients && (
                                            <div className="mt-1.5 p-2 rounded-lg bg-black/40 border border-white/5">
                                              <span className="text-[10px] text-blue-400 font-bold block mb-0.5">المكونات:</span>
                                              <p className="text-[11px] text-gray-300 leading-snug">{mf.food.ingredients}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg border border-blue-400/20">{mf.amount}</span>
                                    </div>
                                  ))}
                                  {meal.foods.length === 0 && (
                                    <p className="text-xs text-gray-500 text-center py-2">لا توجد أصناف في هذه الوجبة</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* SUPPLEMENTS TAB */}
          {activeTab === 'supplements' && (
            <motion.div
              key="supplements"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              className="px-6 space-y-6"
            >
              {isLoadingPlan ? (
                <div className="text-center text-gray-500 text-sm py-10">جاري تحميل خطة المكملات...</div>
              ) : !supplementPlan || supplementPlan.days.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-10 flex flex-col items-center justify-center min-h-[300px]">لا توجد مكملات غذائية مخصصة لك حتى الآن.</div>
              ) : (
                <div className="space-y-4">
                  {supplementPlan.days.map((day: any) => (
                    <motion.div variants={itemVariants} key={day.id} className="bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden shadow-lg">
                      <div className="p-5 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">{day.name}</h3>
                        <span className="text-xs font-bold text-purple-400 bg-purple-400/10 px-3 py-1.5 rounded-xl">{day.items.length} مكملات</span>
                      </div>
                      <div className="p-4 space-y-3 bg-black/20">
                        {day.items.map((item: any, idx: number) => (
                          <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                                <Pill className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-white font-bold">{item.supplement?.name || item.name}</h4>
                                {item.supplement?.description && (
                                  <p className="text-xs text-gray-400 mt-1">{item.supplement.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col items-center bg-black/40 border border-white/10 rounded-xl px-4 py-2 min-w-[80px]">
                                <span className="text-[10px] text-gray-500 mb-1">الجرعة</span>
                                <span className="text-sm font-bold text-white">{item.amount}</span>
                              </div>
                              <div className="flex flex-col items-center bg-black/40 border border-white/10 rounded-xl px-4 py-2 min-w-[80px]">
                                <span className="text-[10px] text-gray-500 mb-1">التوقيت</span>
                                <span className="text-sm font-bold text-purple-400">{item.timing}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {day.items.length === 0 && (
                          <p className="text-xs text-gray-500 text-center py-4">لا توجد مكملات في هذا اليوم</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
