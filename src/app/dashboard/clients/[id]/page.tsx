"use client";

import { motion } from "framer-motion";
import { ChevronRight, Dumbbell, Apple, Plus, Save, Clock, AlertTriangle, Target, User, Activity, Pill } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { WorkoutWorkspace } from "@/components/dashboard/WorkoutWorkspace";
import { NutritionWorkspace } from "@/components/dashboard/NutritionWorkspace";
import { SupplementWorkspace } from "@/components/dashboard/SupplementWorkspace";
import { getExercises, getWorkoutPlan } from "@/actions/workouts";
import { getNutritionPlan, getFoodItems } from "@/actions/nutrition";
import { getSupplementPlan, getSupplementItems } from "@/actions/supplements";
import { getClientById } from "@/actions/clients";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function ClientProfilePage() {
  const params = useParams();
  const clientId = params.id as string;
  
  const [isBuildingWorkout, setIsBuildingWorkout] = useState(false);
  const [isBuildingNutrition, setIsBuildingNutrition] = useState(false);
  const [isBuildingSupplement, setIsBuildingSupplement] = useState(false);
  const [exercisesLib, setExercisesLib] = useState<any[]>([]);
  const [foodsLib, setFoodsLib] = useState<any[]>([]);
  const [supplementsLib, setSupplementsLib] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [currentNutritionPlan, setCurrentNutritionPlan] = useState<any>(null);
  const [currentSupplementPlan, setCurrentSupplementPlan] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);

  // Fetch data
  useEffect(() => {
    async function loadData() {
      const exRes = await getExercises();
      if (exRes.success) setExercisesLib(exRes.exercises || []);

      const planRes = await getWorkoutPlan(clientId);
      if (planRes.success && planRes.plan) {
        setCurrentPlan(planRes.plan);
      }

      const foodRes = await getFoodItems();
      if (foodRes.success) setFoodsLib(foodRes.foodItems || []);

      const nutPlanRes = await getNutritionPlan(clientId);
      if (nutPlanRes.success && nutPlanRes.plan) {
        setCurrentNutritionPlan(nutPlanRes.plan);
      }

      const suppItemsRes = await getSupplementItems();
      if (suppItemsRes.success) setSupplementsLib(suppItemsRes.supplementItems || []);

      const suppPlanRes = await getSupplementPlan(clientId);
      if (suppPlanRes.success && suppPlanRes.plan) {
        setCurrentSupplementPlan(suppPlanRes.plan);
      }

      const clientRes = await getClientById(clientId);
      if (clientRes.success && clientRes.client) {
        setClientData(clientRes.client);
      }
    }
    loadData();
  }, [clientId]);

  if (isBuildingWorkout && clientData) {
    return (
      <WorkoutWorkspace 
        clientId={clientId} 
        initialExercises={exercisesLib} 
        initialPlan={currentPlan}
        onClose={() => {
          setIsBuildingWorkout(false);
          // Refresh plan data
          getWorkoutPlan(clientId).then(res => {
            if (res.success && res.plan) setCurrentPlan(res.plan);
          });
        }} 
      />
    );
  }

  if (isBuildingNutrition && clientData) {
    return (
      <NutritionWorkspace 
        clientId={clientId} 
        initialFoods={foodsLib} 
        initialPlan={currentNutritionPlan}
        onClose={() => {
          setIsBuildingNutrition(false);
          // Refresh plan data
          getNutritionPlan(clientId).then(res => {
            if (res.success && res.plan) setCurrentNutritionPlan(res.plan);
          });
        }} 
      />
    );
  }

  if (isBuildingSupplement && clientData) {
    return (
      <SupplementWorkspace 
        clientId={clientId} 
        initialSupplements={supplementsLib} 
        initialPlan={currentSupplementPlan}
        onClose={() => {
          setIsBuildingSupplement(false);
          // Refresh plan data
          getSupplementPlan(clientId).then(res => {
            if (res.success && res.plan) setCurrentSupplementPlan(res.plan);
          });
        }} 
      />
    );
  }

  if (!clientData) {
    return <div className="p-8 text-center text-white">جاري التحميل...</div>;
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Breadcrumb & Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/clients">
          <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white" />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white mb-1">ملف المشترك</h1>
          <p className="text-gray-400">إدارة خطط وبرامج المتدرب.</p>
        </div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity & Health Data */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-6 relative z-10">
            <div className="flex flex-col items-center gap-4 shrink-0">
              <img src={clientData.avatar || `https://i.pravatar.cc/150?u=${clientData.id}`} alt={clientData.name} className="w-24 h-24 rounded-full object-cover border-4 border-[#1a1a1a] shadow-[0_0_20px_rgba(214,248,84,0.2)]" />
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">{clientData.name}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold mt-2 inline-block border ${
                  clientData.status === 'active' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                    : clientData.status === 'expired'
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                }`}>
                  {clientData.status === 'active' ? 'نشط الآن' : clientData.status === 'expired' ? 'منتهي الصلاحية' : clientData.status}
                </span>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1 text-gray-400">
                  <User className="w-4 h-4" /> <span className="text-xs">العمر</span>
                </div>
                <span className="text-lg font-bold text-white">{clientData.age || '—'} سنة</span>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1 text-gray-400">
                  <Activity className="w-4 h-4" /> <span className="text-xs">الوزن</span>
                </div>
                <span className="text-lg font-bold text-white">{clientData.weight || '—'} كجم</span>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1 text-gray-400">
                  <Activity className="w-4 h-4" /> <span className="text-xs">الطول</span>
                </div>
                <span className="text-lg font-bold text-white">{clientData.height || '—'} سم</span>
              </div>
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1 text-gray-400">
                  <Target className="w-4 h-4" /> <span className="text-xs">الهدف</span>
                </div>
                <span className="text-sm font-bold text-white leading-tight">{clientData.goal || '—'}</span>
              </div>
              
              {/* Injuries Full Width */}
              <div className="col-span-2 md:col-span-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-orange-400/80 font-medium mb-1 block">الإصابات والمشاكل الصحية:</span>
                  <span className="text-sm font-bold text-orange-400">{clientData.injuries || 'لا يوجد إجابة'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Package Info */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">معلومات الباقة</h3>
              <div className="p-2 bg-white/5 rounded-xl">
                <Clock className="w-5 h-5 text-neon" />
              </div>
            </div>
            <p className="text-3xl font-black text-white mb-2">{clientData.package}</p>
            <p className="text-gray-400 text-sm">الباقة الحالية للمشترك</p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10">
            <span className="text-xs text-gray-500 block mb-1">تاريخ الانتهاء</span>
            <span className="text-lg font-bold text-red-400">{clientData.expiry}</span>
          </div>
        </motion.div>
      </div>

      {/* Work Area (Plans) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Workout Plan Section */}
        <motion.div variants={itemVariants} className="bg-[#111] border border-white/5 rounded-[2rem] p-6 flex flex-col relative overflow-hidden group">
          <div className="flex flex-col items-center justify-center h-[300px] text-center z-10 relative">
            <div className="w-20 h-20 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-neon/20 transition-all duration-500 shadow-[0_0_30px_rgba(214,248,84,0.1)]">
              <Dumbbell className="w-10 h-10 text-neon" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">النظام التدريبي</h3>
            <p className="text-gray-400 mb-8 max-w-[250px]">
              {currentPlan ? "يوجد نظام تدريبي مخصص لهذا المشترك." : "لا يوجد نظام تدريبي مخصص لهذا المشترك حتى الآن."}
            </p>
            
            <button 
              onClick={() => setIsBuildingWorkout(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-neon text-black font-black hover:bg-[#c4e649] hover:shadow-[0_0_20px_rgba(214,248,84,0.4)] hover:-translate-y-1 transition-all"
            >
              <Plus className="w-5 h-5" />
              {currentPlan ? "تعديل النظام التدريبي" : "إضافة نظام تدريبي"}
            </button>
          </div>
        </motion.div>

        {/* Nutrition Plan Section */}
        <motion.div variants={itemVariants} className={`bg-[#111] border border-white/5 rounded-[2rem] p-6 flex flex-col relative overflow-hidden group ${!clientData.hasNutrition ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
          <div className="flex flex-col items-center justify-center h-[300px] text-center z-10 relative">
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <Apple className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">الخطة الغذائية</h3>
            <p className="text-gray-400 mb-8 max-w-[250px]">
              {clientData.hasNutrition 
                ? (currentNutritionPlan ? "يوجد خطة غذائية مخصصة لهذا المشترك." : "قم بإعداد الخطة الغذائية المخصصة لهذا المشترك.")
                : "باقة المشترك لا تتضمن خطة غذائية (أو غير مدعومة حالياً)."}
            </p>
            
            <button 
              onClick={() => {
                if (clientData.hasNutrition) {
                  setIsBuildingNutrition(true);
                }
              }}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-500 text-white font-black hover:bg-blue-600 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:-translate-y-1 transition-all"
            >
              <Plus className="w-5 h-5" />
              {currentNutritionPlan ? "تعديل الخطة الغذائية" : "إضافة خطة غذائية"}
            </button>
          </div>
        </motion.div>

        {/* Supplement Plan Section */}
        <motion.div variants={itemVariants} className="bg-[#111] border border-white/5 rounded-[2rem] p-6 flex flex-col relative overflow-hidden group">
          <div className="flex flex-col items-center justify-center h-[300px] text-center z-10 relative">
            <div className="w-20 h-20 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
              <Pill className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">خطة المكملات</h3>
            <p className="text-gray-400 mb-8 max-w-[250px]">
              {currentSupplementPlan ? "يوجد خطة مكملات مخصصة لهذا المشترك." : "قم بإعداد خطة المكملات المخصصة لهذا المشترك."}
            </p>
            
            <button 
              onClick={() => setIsBuildingSupplement(true)}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-purple-500 text-white font-black hover:bg-purple-600 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-1 transition-all"
            >
              <Plus className="w-5 h-5" />
              {currentSupplementPlan ? "تعديل المكملات" : "إضافة خطة مكملات"}
            </button>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
}
