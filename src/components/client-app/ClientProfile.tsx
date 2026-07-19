import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, CreditCard, Bell, ChevronLeft, ChevronRight, User, Mail, Calendar, ShieldCheck, Activity, ArrowRight, ArrowLeft, Moon, Sun, Globe, Lock, Trash2, Smartphone } from 'lucide-react';
import { CoachData } from './ClientAppFlow';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { savePushSubscription } from '@/actions/notifications';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface ClientProfileProps {
  coach: CoachData;
  userData: { name: string; email: string; intakeData?: Record<string, string> };
  selectedPackage: any;
  onLogout?: () => void;
}

export function ClientProfile({ coach, userData, selectedPackage, onLogout }: ClientProfileProps) {
  const { t, language, setLanguage, dir } = useLanguage();
  const [activeModal, setActiveModal] = useState<'settings' | 'notifications' | 'privacy' | null>(null);
  const [settings, setSettings] = useState({
    darkMode: true,
    systemTheme: false,
    workoutReminders: true,
    waterReminders: false,
    coachMessages: true,
    pushNotifications: false,
    twoFactorAuth: false
  });

  useEffect(() => {
    // Check actual push subscription status when component mounts
    const checkSubscription = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
              setSettings(prev => ({ ...prev, pushNotifications: true }));
            }
          }
        } catch (e) {
          console.error("Error checking subscription:", e);
        }
      }
    };
    checkSubscription();
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePushToggle = async () => {
    if (!userData?.id && !settings.pushNotifications) {
      alert("هذه الميزة غير متاحة في وضع المعاينة. يرجى تسجيل الدخول كمتدرب حقيقي.");
      return;
    }
    
    if (!settings.pushNotifications) {
      if (!('serviceWorker' in navigator)) {
        alert("متصفحك لا يدعم الإشعارات، يرجى التحديث لمتصفح أحدث.");
        return;
      }
      if (!('PushManager' in window)) {
        alert("جهازك لا يدعم الإشعارات في هذا المتصفح. إذا كنت تستخدم آيفون، يجب عليك إضافة التطبيق للشاشة الرئيسية (Add to Home Screen) وتفعيله من هناك.");
        return;
      }
      
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
        });
        const res = await savePushSubscription(userData.id as string, JSON.parse(JSON.stringify(subscription)));
        if (!res.success) {
          throw new Error(res.error || "Failed to save subscription");
        }
        
        alert("تم تفعيل الإشعارات بنجاح!");
        setSettings(prev => ({ ...prev, pushNotifications: true }));
      } catch (err: any) {
        console.error('Service Worker / Push Error:', err);
        alert(`حدث خطأ أثناء تفعيل الإشعارات: ${err.message || 'تأكد من السماح للإشعارات من إعدادات المتصفح.'}`);
      }
    } else {
      setSettings(prev => ({ ...prev, pushNotifications: false }));
    }
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
    <div className="h-full w-full overflow-y-auto pb-28 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-[#0a0a0a] text-white">
      {/* Header Profile Area */}
      <div className="relative pt-12 pb-6 px-6 overflow-hidden">
        {/* Dynamic Background Blur using coach primary color */}
        <div 
          className="absolute top-0 left-0 right-0 h-48 opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: coach.primaryColor }}
        />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center"
        >
          {/* Avatar */}
          <motion.div variants={itemVariants} className="relative mb-4">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-white/20 to-transparent">
              <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center border-2 border-[#111] overflow-hidden">
                <User className="w-10 h-10 text-gray-500" />
              </div>
            </div>
            <div 
              className="absolute bottom-1 left-1 w-6 h-6 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center"
              style={{ backgroundColor: coach.primaryColor }}
            >
              <ShieldCheck className="w-3 h-3 text-black" />
            </div>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-2xl font-black mb-1 text-center">
            {userData?.name || t('dash.trainee')}
          </motion.h2>
          <motion.p variants={itemVariants} className="text-gray-400 text-sm font-medium mb-6 flex items-center gap-2">
            <Mail className="w-4 h-4" /> {userData?.email || "user@example.com"}
          </motion.p>
          
          {/* Subscribed Package Card */}
          <motion.div variants={itemVariants} className="w-full bg-[#151515] border border-white/5 rounded-3xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex justify-between items-center mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${coach.primaryColor}20`, color: coach.primaryColor }}
                >
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold mb-0.5">{t('profile.currentPackage')}</p>
                  <h3 className="font-bold text-white leading-tight">
                    {selectedPackage?.name || t('app.unknownPackage')}
                  </h3>
                </div>
              </div>
              <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-lg text-xs font-bold border border-green-500/20">
                {t('profile.active')}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-white/5 relative z-10">
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 mb-1">{t('profile.joinDate')}</p>
                <p className="text-sm font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {new Date().toLocaleDateString('ar-IQ')}
                </p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 mb-1">{t('profile.renewStatus')}</p>
                <p className="text-sm font-bold flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                  {t('profile.autoRenew')}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Intake Data Summary */}
        {userData?.intakeData && Object.keys(userData.intakeData).length > 0 && (
          <motion.div variants={itemVariants} className="mt-6 w-full">
            <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">{t('profile.personalInfo') || 'المعلومات الشخصية'}</h3>
            <div className="grid grid-cols-2 gap-3">
              {coach.intakeQuestions?.map((q, idx) => {
                const answer = userData.intakeData![q.id];
                if (!answer) return null;
                return (
                  <div key={q.id} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                    <p className="text-[10px] text-gray-500 mb-1">{q.title}</p>
                    <p className="text-sm font-bold text-gray-200 line-clamp-2">{answer}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Settings Menu */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-6 space-y-3"
      >
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">{t('profile.settings')}</h3>
        </motion.div>

        <motion.button onClick={() => setActiveModal('settings')} variants={itemVariants} className="w-full bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{t('profile.appSettings')}</span>
          </div>
          {dir === 'rtl' ? <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" /> : <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />}
        </motion.button>

        <motion.button onClick={() => setActiveModal('notifications')} variants={itemVariants} className="w-full bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{t('profile.notifications')}</span>
          </div>
          {dir === 'rtl' ? <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" /> : <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />}
        </motion.button>

        <motion.button onClick={() => setActiveModal('privacy')} variants={itemVariants} className="w-full bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{t('profile.privacy')}</span>
          </div>
          {dir === 'rtl' ? <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" /> : <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />}
        </motion.button>

        <motion.div variants={itemVariants} className="pt-4 pb-12">
          <button 
            onClick={onLogout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 transition-colors text-red-500 font-bold group"
          >
            <LogOut className={`w-5 h-5 transition-transform ${dir === 'rtl' ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
            {t('profile.logout')}
          </button>
        </motion.div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute inset-0 bg-[#0a0a0a] z-50 flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-white/10">
              <button 
                onClick={() => setActiveModal(null)}
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-white" /> : <ArrowLeft className="w-5 h-5 text-white" />}
              </button>
              <h2 className="text-xl font-bold text-white">
                {activeModal === 'settings' && t('settings.title')}
                {activeModal === 'notifications' && t('notif.title')}
                {activeModal === 'privacy' && t('privacy.title')}
              </h2>
            </div>

            {/* Settings Options */}
            <div className="flex-1 overflow-y-auto p-6 pb-24">
              {activeModal === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">{t('settings.appearance')}</h3>
                    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <Moon className="w-5 h-5 text-gray-400" />
                          <span className="font-bold text-sm">{t('settings.darkMode')}</span>
                        </div>
                        <div 
                          onClick={() => toggleSetting('darkMode')}
                          className="w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors" 
                          style={{ backgroundColor: settings.darkMode ? coach.primaryColor : 'rgba(255,255,255,0.1)' }}
                        >
                          <div className={`w-4 h-4 rounded-full absolute transition-all ${settings.darkMode ? (dir === 'rtl' ? 'left-1' : 'right-1') + ' bg-black' : (dir === 'rtl' ? 'right-1' : 'left-1') + ' bg-gray-400'}`} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Smartphone className="w-5 h-5 text-gray-400" />
                          <span className="font-bold text-sm">{t('settings.systemTheme')}</span>
                        </div>
                        <div 
                          onClick={() => toggleSetting('systemTheme')}
                          className="w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors" 
                          style={{ backgroundColor: settings.systemTheme ? coach.primaryColor : 'rgba(255,255,255,0.1)' }}
                        >
                          <div className={`w-4 h-4 rounded-full absolute transition-all ${settings.systemTheme ? (dir === 'rtl' ? 'left-1' : 'right-1') + ' bg-black' : (dir === 'rtl' ? 'right-1' : 'left-1') + ' bg-gray-400'}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">{t('settings.languageRegion')}</h3>
                    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden p-2 space-y-1">
                      <button 
                        onClick={() => setLanguage('ar')} 
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${language === 'ar' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      >
                        <span className="font-bold text-sm">العربية</span>
                        {language === 'ar' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: coach.primaryColor }} />}
                      </button>
                      <button 
                        onClick={() => setLanguage('en')} 
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${language === 'en' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      >
                        <span className="font-bold text-sm">English</span>
                        {language === 'en' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: coach.primaryColor }} />}
                      </button>
                      <button 
                        onClick={() => setLanguage('ku')} 
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${language === 'ku' ? 'bg-white/10' : 'hover:bg-white/5'}`}
                      >
                        <span className="font-bold text-sm">کوردی</span>
                        {language === 'ku' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: coach.primaryColor }} />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">الإشعارات الخارجية (الجهاز)</h3>
                    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden mb-6">
                      <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">تفعيل الإشعارات (Push)</span>
                          <span className="text-xs text-gray-500 mt-1">لتصلك تنبيهات النظام الغذائي والتدريب خارج التطبيق</span>
                        </div>
                        <div 
                          onClick={handlePushToggle}
                          className="w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors shrink-0 mx-2" 
                          style={{ backgroundColor: settings.pushNotifications ? coach.primaryColor : 'rgba(255,255,255,0.1)' }}
                        >
                          <div className={`w-4 h-4 rounded-full absolute transition-all ${settings.pushNotifications ? (dir === 'rtl' ? 'left-1' : 'right-1') + ' bg-black' : (dir === 'rtl' ? 'right-1' : 'left-1') + ' bg-gray-400'}`} />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">{t('notif.workout')}</h3>
                    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-white/5">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{t('notif.workoutReminder')}</span>
                          <span className="text-xs text-gray-500 mt-1">{t('notif.workoutDesc')}</span>
                        </div>
                        <div 
                          onClick={() => toggleSetting('workoutReminders')}
                          className="w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors shrink-0 mx-2" 
                          style={{ backgroundColor: settings.workoutReminders ? coach.primaryColor : 'rgba(255,255,255,0.1)' }}
                        >
                          <div className={`w-4 h-4 rounded-full absolute transition-all ${settings.workoutReminders ? (dir === 'rtl' ? 'left-1' : 'right-1') + ' bg-black' : (dir === 'rtl' ? 'right-1' : 'left-1') + ' bg-gray-400'}`} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{t('notif.waterReminder')}</span>
                          <span className="text-xs text-gray-500 mt-1">{t('notif.waterDesc')}</span>
                        </div>
                        <div 
                          onClick={() => toggleSetting('waterReminders')}
                          className="w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors shrink-0 mx-2" 
                          style={{ backgroundColor: settings.waterReminders ? coach.primaryColor : 'rgba(255,255,255,0.1)' }}
                        >
                          <div className={`w-4 h-4 rounded-full absolute transition-all ${settings.waterReminders ? (dir === 'rtl' ? 'left-1' : 'right-1') + ' bg-black' : (dir === 'rtl' ? 'right-1' : 'left-1') + ' bg-gray-400'}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">{t('notif.coach')}</h3>
                    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{t('notif.messages')}</span>
                          <span className="text-xs text-gray-500 mt-1">{t('notif.messagesDesc')}</span>
                        </div>
                        <div 
                          onClick={() => toggleSetting('coachMessages')}
                          className="w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors shrink-0 mx-2" 
                          style={{ backgroundColor: settings.coachMessages ? coach.primaryColor : 'rgba(255,255,255,0.1)' }}
                        >
                          <div className={`w-4 h-4 rounded-full absolute transition-all ${settings.coachMessages ? (dir === 'rtl' ? 'left-1' : 'right-1') + ' bg-black' : (dir === 'rtl' ? 'right-1' : 'left-1') + ' bg-gray-400'}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">{t('privacy.security')}</h3>
                    <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-gray-400" />
                          <span className="font-bold text-sm">{t('privacy.changePassword')}</span>
                        </div>
                        {dir === 'rtl' ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
                      </div>
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-gray-400" />
                          <span className="font-bold text-sm">{t('privacy.2fa')}</span>
                        </div>
                        <div 
                          onClick={() => toggleSetting('twoFactorAuth')}
                          className="w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors" 
                          style={{ backgroundColor: settings.twoFactorAuth ? coach.primaryColor : 'rgba(255,255,255,0.1)' }}
                        >
                          <div className={`w-4 h-4 rounded-full absolute transition-all ${settings.twoFactorAuth ? (dir === 'rtl' ? 'left-1' : 'right-1') + ' bg-black' : (dir === 'rtl' ? 'right-1' : 'left-1') + ' bg-gray-400'}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-red-500/50 mb-3 px-2">{t('privacy.dangerZone')}</h3>
                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl overflow-hidden">
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-500/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <Trash2 className="w-5 h-5 text-red-500" />
                          <span className="font-bold text-sm text-red-500">{t('privacy.deleteAccount')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
