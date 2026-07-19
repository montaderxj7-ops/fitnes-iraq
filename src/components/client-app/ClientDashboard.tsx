import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Home, Zap, BarChart2, Users, Target, Activity, MessageCircle, PlayCircle, Flame, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoachData } from './ClientAppFlow';
import { ClientProfile } from './ClientProfile';
import { ClientPlan } from './ClientPlan';
import { ClientChat } from './ClientChat';
import { getWorkoutPlan } from '@/actions/workouts';
import { getNutritionPlan } from '@/actions/nutrition';
import { getSupplementPlan } from '@/actions/supplements';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { NotificationsBell } from './NotificationsBell';

interface ClientDashboardProps {
  coach: CoachData;
  userData: { id?: string; name: string; email: string; image?: string; intakeData?: Record<string, string> };
  selectedPackage: any;
  onLogout?: () => void;
  onUpdateUser?: (updated: any) => void;
}

export function ClientDashboard({ coach, userData, selectedPackage, onLogout, onUpdateUser }: ClientDashboardProps) {
  const { t, dir } = useLanguage();
  const [currentTab, setCurrentTab] = React.useState<'home' | 'profile' | 'plan'>('home');
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  
  const [workoutStats, setWorkoutStats] = React.useState({ title: '', duration: '0', hasWorkout: false });
  const [nutritionStats, setNutritionStats] = React.useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [supplementStats, setSupplementStats] = React.useState({ count: 0, hasSupplements: false });

  React.useEffect(() => {
    async function fetchStats() {
      if (userData?.id) {
        try {
          const wRes = await getWorkoutPlan(userData.id);
          if (wRes.success && wRes.plan && wRes.plan.days.length > 0) {
            const firstDay = wRes.plan.days.find((d: any) => d.exercises.length > 0) || wRes.plan.days[0];
            if (firstDay && firstDay.exercises.length > 0) {
              const estimatedDuration = firstDay.exercises.length * 10; // ~10 mins per exercise
              setWorkoutStats({
                title: firstDay.name,
                duration: `${estimatedDuration}`,
                hasWorkout: true
              });
            }
          }

          const nRes = await getNutritionPlan(userData.id);
          if (nRes.success && nRes.plan && nRes.plan.days.length > 0) {
            const firstDay = nRes.plan.days[0];
            let cals = 0, pro = 0, car = 0, fat = 0;
            firstDay.meals.forEach((m: any) => {
              m.foods.forEach((mf: any) => {
                cals += mf.food?.calories || 0;
                pro += mf.food?.protein || 0;
                car += mf.food?.carbs || 0;
                fat += mf.food?.fats || 0;
              });
            });
            setNutritionStats({ calories: cals, protein: pro, carbs: car, fats: fat });
          }

          const sRes = await getSupplementPlan(userData.id);
          if (sRes.success && sRes.plan && sRes.plan.days.length > 0) {
            const firstDay = sRes.plan.days[0];
            setSupplementStats({ count: firstDay.items.length, hasSupplements: true });
          }
        } catch (error) {
          console.error("Failed to fetch dashboard stats", error);
        }
      }
    }
    fetchStats();
  }, [userData?.id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const hasChat = selectedPackage ? selectedPackage.hasChat : coach.packages[0]?.hasChat;
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="h-full flex flex-col relative bg-[#0a0a0a] text-white overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 pb-2 relative z-50">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentTab('profile')}>
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#222] bg-[#1a1a1a] flex items-center justify-center group-hover:border-white/20 transition-colors">
              {userData?.image ? (
                <img src={userData.image} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight group-hover:text-gray-200 transition-colors">{t('dash.welcome')} {userData?.name ? userData.name.split(' ')[0] : t('dash.trainee')}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Target className="w-3 h-3" style={{ color: coach.primaryColor }} /> 
                <span style={{ color: coach.primaryColor }}>بطل</span>
              </p>
            </div>
          </div>
          <NotificationsBell userId={userData?.id || ''} />
        </div>

        {currentTab === 'home' ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 pt-4 space-y-6"
        >
          {/* Big Hero Card (Premium) */}
          <motion.div variants={itemVariants} className="relative rounded-[2rem] p-6 overflow-hidden shadow-2xl border border-white/10" style={{ backgroundColor: coach.primaryColor }}>
            {/* Dynamic premium gradients */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20" />
            <div className={`absolute top-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 ${dir === 'rtl' ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'}`} />
            <div className={`absolute bottom-0 w-48 h-48 bg-black/30 rounded-full blur-3xl translate-y-1/3 ${dir === 'rtl' ? 'left-0 -translate-x-1/3' : 'right-0 translate-x-1/3'}`} />
            
            {/* Content */}
            <div className="relative z-10 w-[65%] flex flex-col justify-center min-h-[140px]">
              <span className="inline-block px-3 py-1 bg-black/10 backdrop-blur-md rounded-full text-black/80 font-bold text-[10px] mb-3 border border-black/10 w-fit">
                {coach.dashboardHeroTopText}
              </span>
              <h2 className="text-black font-black text-3xl mb-2 leading-tight drop-shadow-sm">
                {coach.dashboardHeroMainText}
              </h2>
              <p className="text-black/70 text-sm mt-1 font-bold max-w-[140px] leading-snug">
                {coach.dashboardHeroBottomText}
              </p>
            </div>

            {/* Coach/Athlete Image overlaying the side */}
            <div className={`absolute bottom-0 w-[55%] h-[120%] pointer-events-none ${dir === 'rtl' ? 'left-0' : 'right-0'}`}>
              {coach.dashboardHeroImage && (
                <img 
                  src={coach.dashboardHeroImage} 
                  alt="Athlete" 
                  className={`w-full h-full object-contain object-bottom drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)] scale-110 translate-y-2 ${dir === 'rtl' ? '-translate-x-4' : 'translate-x-4'}`}
                />
              )}
            </div>
          </motion.div>

          {/* Section Title */}
          <motion.div variants={itemVariants}>
            <h3 className="text-xl font-bold text-white mb-4">{t('dash.overview')}</h3>
          </motion.div>

          {/* Two Prominent Cards Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Workout Card (Premium) */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#1c1c1c] to-[#111] border border-white/5 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-40" style={{ backgroundColor: coach.primaryColor }} />
              
              <div className="relative z-10 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-white/5 backdrop-blur-md">
                    <Activity className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('dash.workout')}</p>
                </div>
                <h4 className="text-white font-black text-xl leading-tight drop-shadow-md whitespace-pre-wrap">{workoutStats.title || t('dash.workout')}</h4>
                <p className="text-xs text-gray-500 mt-2 font-medium flex items-center gap-1">
                  <span>{workoutStats.duration}</span>
                  <span>{t('dash.minute')}</span>
                </p>
              </div>
              
              <div className="relative z-10 flex justify-end">
                <button 
                  onClick={() => setCurrentTab('plan')}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 group-hover:scale-105 shadow-[0_10px_20px_rgba(0,0,0,0.3)] relative overflow-hidden"
                  style={{ backgroundColor: coach.primaryColor }}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <PlayCircle className="w-7 h-7 text-black relative z-10" />
                </button>
              </div>
            </motion.div>

            {/* Nutrition Card (Premium) */}
            <motion.div 
              variants={itemVariants} 
              onClick={() => setCurrentTab('plan')}
              className="bg-gradient-to-br from-[#1c1c1c] to-[#111] border border-white/5 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-xl cursor-pointer hover:border-white/10 transition-colors"
            >
              <div className="absolute top-0 left-0 w-32 h-32 opacity-10 rounded-full blur-2xl -translate-y-1/2 -translate-x-1/2 transition-opacity group-hover:opacity-30 bg-orange-500" />
              
              <div className="relative z-10 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-white/5 backdrop-blur-md">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">{t('dash.nutrition')}</p>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-black text-3xl leading-none tracking-tight">{nutritionStats.calories.toFixed(0)}</h4>
                  <span className="text-[10px] text-gray-500 font-bold">{t('dash.calories')}</span>
                </div>
                
                {/* Mini Macros (Enhanced) */}
                <div className="flex gap-2 mt-5">
                  <div className="flex-1">
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-1.5 border border-white/5 shadow-inner">
                      <div className="h-full bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)] transition-all" style={{ width: `${Math.min(100, (nutritionStats.protein / (nutritionStats.protein + nutritionStats.carbs + nutritionStats.fats || 1)) * 100)}%` }} />
                    </div>
                    <p className="text-[9px] text-gray-400 font-medium text-center">{t('dash.protein')} {nutritionStats.protein.toFixed(0)}g</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-1.5 border border-white/5 shadow-inner">
                      <div className="h-full bg-orange-400 rounded-full shadow-[0_0_8px_rgba(251,146,60,0.5)] transition-all" style={{ width: `${Math.min(100, (nutritionStats.carbs / (nutritionStats.protein + nutritionStats.carbs + nutritionStats.fats || 1)) * 100)}%` }} />
                    </div>
                    <p className="text-[9px] text-gray-400 font-medium text-center">{t('dash.carbs')} {nutritionStats.carbs.toFixed(0)}g</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-1.5 border border-white/5 shadow-inner">
                      <div className="h-full bg-yellow-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.5)] transition-all" style={{ width: `${Math.min(100, (nutritionStats.fats / (nutritionStats.protein + nutritionStats.carbs + nutritionStats.fats || 1)) * 100)}%` }} />
                    </div>
                    <p className="text-[9px] text-gray-400 font-medium text-center">{t('dash.fats')} {nutritionStats.fats.toFixed(0)}g</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Supplement Card (Premium) */}
          {supplementStats.hasSupplements && (
            <motion.div variants={itemVariants} className="mt-4">
              <div 
                onClick={() => { setCurrentTab('plan'); setTimeout(() => {
                  const suppTabBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent?.includes(t('plan.supplements')));
                  if(suppTabBtn) suppTabBtn.click();
                }, 100); }}
                className="w-full bg-gradient-to-r from-[#1c1c1c] to-[#151515] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group cursor-pointer hover:border-white/10 transition-colors"
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-30 bg-purple-500" />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center relative border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <User className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm mb-0.5">{t('plan.supplements')}</h5>
                    <p className="text-xs text-purple-400 font-medium">
                      {supplementStats.count} مكملات اليوم
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center relative z-10 group-hover:bg-white/10 transition-colors">
                  <PlayCircle className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Alert Banner (Premium) */}
          {hasChat && (
            <motion.div variants={itemVariants} className="mt-4">
              <div className="w-full bg-gradient-to-r from-[#1c1c1c] to-[#151515] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center relative border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <MessageCircle className="w-6 h-6 text-green-500" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#151515] animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-white font-bold text-sm mb-0.5">{t('dash.chatTitle')}</h5>
                    <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> {t('dash.chatStatus')}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg relative z-10"
                  style={{ backgroundColor: coach.primaryColor, color: '#000' }}
                >
                  {t('dash.chatBtn')}
                </button>
              </div>
            </motion.div>
          )}

        </motion.div>
        ) : currentTab === 'plan' ? (
          <ClientPlan coach={coach} userData={userData} />
        ) : (
          <ClientProfile 
            coach={coach} 
            userData={userData} 
            selectedPackage={selectedPackage}
            onLogout={onLogout}
            onUpdateUser={onUpdateUser}
          />
        )}
      </div>

      {/* Fixed Bottom Navigation (Premium Glassmorphism) */}
      <div className="absolute bottom-6 left-6 right-6 z-50">
        <div className="bg-[#111111]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] h-[72px] flex items-center justify-between px-6 shadow-[0_20px_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Subtle top highlight for glass 3D effect */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <button 
            onClick={() => setCurrentTab('profile')} 
            className="flex flex-col items-center gap-1.5 transition-all relative flex-1"
            style={{ color: currentTab === 'profile' ? coach.primaryColor : '#888', transform: currentTab === 'profile' ? 'translateY(-2px)' : 'none' }}
          >
            {currentTab === 'profile' && <div className="absolute -top-3 w-8 h-1 bg-current rounded-full shadow-[0_0_10px_currentColor]" />}
            <User className={cn("w-6 h-6 transition-transform", currentTab === 'profile' && "scale-110")} />
            <span className="text-[10px] font-bold tracking-wide">{t('dash.nav.profile')}</span>
          </button>

          {hasChat && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex flex-col items-center gap-1.5 transition-all relative flex-1"
              style={{ color: isChatOpen ? coach.primaryColor : '#888', transform: isChatOpen ? 'translateY(-2px)' : 'none' }}
            >
              {isChatOpen && <div className="absolute -top-3 w-8 h-1 bg-current rounded-full shadow-[0_0_10px_currentColor]" />}
              <MessageCircle className={cn("w-6 h-6 transition-transform", isChatOpen && "scale-110")} />
              <span className="text-[10px] font-bold tracking-wide">{t('dash.nav.chat')}</span>
            </button>
          )}

          <button 
            onClick={() => setCurrentTab('plan')}
            className="flex flex-col items-center gap-1.5 transition-all relative flex-1"
            style={{ color: currentTab === 'plan' ? coach.primaryColor : '#888', transform: currentTab === 'plan' ? 'translateY(-2px)' : 'none' }}
          >
            {currentTab === 'plan' && <div className="absolute -top-3 w-8 h-1 bg-current rounded-full shadow-[0_0_10px_currentColor]" />}
            <Zap className={cn("w-6 h-6 transition-transform", currentTab === 'plan' && "scale-110")} />
            <span className="text-[10px] font-bold tracking-wide">{t('dash.nav.plan')}</span>
          </button>

          <button 
            onClick={() => setCurrentTab('home')}
            className="flex flex-col items-center gap-1.5 transition-all relative flex-1" 
            style={{ color: currentTab === 'home' ? coach.primaryColor : '#888', transform: currentTab === 'home' ? 'translateY(-2px)' : 'none' }}
          >
            {currentTab === 'home' && <div className="absolute -top-3 w-8 h-1 bg-current rounded-full shadow-[0_0_10px_currentColor]" />}
            <Home className={cn("w-6 h-6 transition-transform", currentTab === 'home' && "scale-110")} />
            <span className="text-[10px] font-bold tracking-wide">{t('dash.nav.home')}</span>
          </button>
        </div>
      </div>

      {/* Chat Modal Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <ClientChat 
            coach={coach} 
            userData={userData!} 
            onClose={() => setIsChatOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
