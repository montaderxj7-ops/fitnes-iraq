import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Utensils, Pill, ChevronDown, CheckCircle2, Flame, PlayCircle, Clock, Save, Check, Square, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoachData } from './ClientAppFlow';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getWorkoutPlan } from '@/actions/workouts';

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

const mockNutritionPlan = {
  macros: { calories: 2450, protein: 180, carbs: 250, fats: 80 },
  meals: [
    { time: '08:00 AM', name: 'وجبة الإفطار', items: '4 بيضات كاملة، 100 جرام شوفان، كوب حليب قليل الدسم' },
    { time: '01:00 PM', name: 'وجبة الغداء', items: '200 جرام صدر دجاج، 150 جرام رز أبيض، صحن سلطة خضراء' },
    { time: '05:00 PM', name: 'وجبة قبل التمرين', items: 'موزة، سكوب بروتين واي، ملعقة زبدة فول سوداني' },
    { time: '09:00 PM', name: 'وجبة العشاء', items: '150 جرام لحم مفروم قليل الدسم، 100 جرام بطاطا مشوية' },
  ]
};

const mockSupplements = [
  { name: 'Whey Protein', dose: '1 Scoop (30g)', timing: 'بعد التمرين مباشرة' },
  { name: 'Creatine Monohydrate', dose: '5g', timing: 'في أي وقت خلال اليوم' },
  { name: 'Omega 3', dose: '1 Capsule', timing: 'مع وجبة الغداء' },
];

export function ClientPlan({ coach, userData }: ClientPlanProps) {
  const { t, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition' | 'supplements'>('workout');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [trackedWeights, setTrackedWeights] = useState<Record<string, string>>({});
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [tempWeight, setTempWeight] = useState<string>('');
  const [completedMeals, setCompletedMeals] = useState<Record<number, boolean>>({});
  
  const [workoutPlan, setWorkoutPlan] = useState<any[]>(mockWorkoutPlan);
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
            }
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
  const totalMealsCount = mockNutritionPlan.meals.length;
  const nutritionProgress = totalMealsCount > 0 ? (completedMealsCount / totalMealsCount) * 100 : 0;

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
              {/* Macros Summary (Premium) */}
              <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#1c1c1c] to-[#111] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden shadow-xl group">
                <div className="absolute -top-10 -right-10 w-40 h-40 blur-[50px] opacity-20 rounded-full pointer-events-none transition-opacity group-hover:opacity-40" style={{ backgroundColor: coach.primaryColor }} />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="text-white font-black text-lg flex items-center gap-2 drop-shadow-sm">
                    <div className="p-2 rounded-xl bg-white/5 backdrop-blur-md">
                      <Flame className="w-5 h-5" style={{ color: coach.primaryColor }} />
                    </div>
                    {t('plan.macros')}
                  </h3>
                  <div className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    الالتزام: {Math.round(nutritionProgress)}%
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full h-2 bg-black/50 rounded-full mb-6 relative z-10 overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${nutritionProgress}%` }}
                    className="h-full rounded-full transition-all duration-500"
                    style={{ backgroundColor: coach.primaryColor, boxShadow: `0 0 10px ${coach.primaryColor}` }}
                  />
                </div>
                
                <div className="flex justify-between items-end mb-8 relative z-10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight drop-shadow-md">
                      {mockNutritionPlan.macros.calories}
                    </span>
                    <span className="text-gray-500 font-bold text-sm tracking-wide">{t('plan.calories')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 relative z-10">
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner flex flex-col items-center justify-center group-hover:bg-black/60 transition-colors">
                    <span className="text-2xl font-black text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">{mockNutritionPlan.macros.protein}g</span>
                    <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider">{t('plan.protein')}</span>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner flex flex-col items-center justify-center group-hover:bg-black/60 transition-colors">
                    <span className="text-2xl font-black text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]">{mockNutritionPlan.macros.carbs}g</span>
                    <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider">{t('plan.carbs')}</span>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner flex flex-col items-center justify-center group-hover:bg-black/60 transition-colors">
                    <span className="text-2xl font-black text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]">{mockNutritionPlan.macros.fats}g</span>
                    <span className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wider">{t('plan.fats')}</span>
                  </div>
                </div>
              </motion.div>

              {/* Meals (Premium) */}
              <motion.div variants={itemVariants}>
                <h3 className="text-white font-black text-xl mb-5 flex items-center gap-2 drop-shadow-sm">
                  <div className="p-2 rounded-xl bg-white/5 backdrop-blur-md">
                    <Utensils className="w-5 h-5" style={{ color: coach.primaryColor }} />
                  </div>
                  {t('plan.meals')}
                </h3>
                <div className="space-y-4">
                  {mockNutritionPlan.meals.map((meal, idx) => {
                    const isCompleted = completedMeals[idx] || false;
                    return (
                    <div key={idx} onClick={() => setCompletedMeals(prev => ({ ...prev, [idx]: !isCompleted }))} className={cn("cursor-pointer border border-white/5 rounded-3xl p-5 flex gap-4 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group", isCompleted ? "bg-gradient-to-r from-green-900/20 to-[#151515] border-green-500/20" : "bg-gradient-to-r from-[#1a1a1a] to-[#151515]")}>
                      <div className={cn("w-14 h-14 rounded-2xl border shadow-inner flex items-center justify-center shrink-0 transition-colors", isCompleted ? "bg-green-500/10 border-green-500/30" : "bg-black/50 border-white/10")}>
                        {isCompleted ? <Check className="w-6 h-6 text-green-500" /> : <Clock className="w-6 h-6 text-gray-400 group-hover:text-white" />}
                      </div>
                      <div className="flex-1 pt-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className={cn("font-bold text-lg leading-tight transition-colors", isCompleted ? "text-green-400" : "text-white")}>{meal.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-gray-400" dir="ltr">{meal.time}</span>
                            <div className="w-6 h-6 rounded-md border border-white/20 flex items-center justify-center bg-black/30">
                              {isCompleted && <CheckSquare className="w-4 h-4 text-green-500" />}
                              {!isCompleted && <Square className="w-4 h-4 text-transparent group-hover:text-white/20 transition-colors" />}
                            </div>
                          </div>
                        </div>
                        <p className={cn("text-sm leading-relaxed font-medium transition-colors", isCompleted ? "text-gray-500 line-through" : "text-gray-400")}>{meal.items}</p>
                      </div>
                    </div>
                  )})}
                </div>
              </motion.div>
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
              className="px-6 space-y-4"
            >
              {mockSupplements.map((supp, idx) => (
                <motion.div variants={itemVariants} key={idx} className="bg-gradient-to-r from-[#1c1c1c] to-[#151515] border border-white/5 rounded-3xl p-5 relative overflow-hidden group shadow-lg">
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-20" style={{ backgroundColor: coach.primaryColor }} />
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner" style={{ backgroundColor: `${coach.primaryColor}15` }}>
                      <Pill className="w-7 h-7 drop-shadow-md" style={{ color: coach.primaryColor }} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-h-[56px]">
                      <h4 className="font-black text-white text-xl mb-3 drop-shadow-sm leading-tight">{supp.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/5 shadow-inner">
                          <CheckCircle2 className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-300 font-medium"><strong>الجرعة:</strong> {supp.dose}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/5 shadow-inner">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-300 font-medium"><strong>الوقت:</strong> {supp.timing}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
