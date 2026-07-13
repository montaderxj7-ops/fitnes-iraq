"use client";

import { BuilderState, MockupView } from "@/app/builder/page";
import { motion, AnimatePresence } from "framer-motion";
import { User, MessageSquare, Home, CreditCard, ChevronLeft, LogOut, Info, Settings, LayoutDashboard, Crown, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ClientAppFlow } from "@/components/client-app/ClientAppFlow";

interface LiveMockupProps {
  state: BuilderState;
  currentView: MockupView;
  onViewChange: (view: MockupView) => void;
  currentStep?: number;
}

export default function LiveMockup({ state, currentView, onViewChange, currentStep }: LiveMockupProps) {
  
  const isDark = state.theme === "dark" || state.theme === "both";
  const bgColor = isDark ? "#000000" : "#F3F4F6";
  const cardColor = isDark ? "#111111" : "#FFFFFF";
  const textColor = isDark ? "#FFFFFF" : "#000000";
  const subTextColor = isDark ? "#9CA3AF" : "#6B7280";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <div className="relative w-[320px] h-[650px] lg:w-[360px] lg:h-[740px] z-10 transition-transform duration-500 hover:scale-[1.02]">
      {/* Phone Hardware Frame */}
      <div className="absolute inset-0 bg-black rounded-[48px] shadow-[0_0_0_2px_rgba(255,255,255,0.1),0_20px_60px_rgba(0,0,0,0.5)] border-[8px] border-[#222] overflow-hidden">
        
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#222] rounded-b-2xl z-50 flex justify-center items-center">
          <div className="w-16 h-1.5 bg-black rounded-full" />
        </div>

        {/* Screen Content Container */}
        <div 
          className="w-full h-full relative overflow-y-auto overflow-x-hidden flex flex-col hide-scrollbar"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          {/* Mockup Header */}
          <div 
            className="pt-12 pb-4 px-6 flex items-center gap-3 sticky top-0 z-40 backdrop-blur-md"
            style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(243,244,246,0.8)', borderBottom: `1px solid ${borderColor}` }}
          >
            {state.appLogo ? (
              <img src={state.appLogo} alt="Logo" className="h-8 object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: state.primaryColor, color: '#000' }}>
                {state.appName ? state.appName.charAt(0).toUpperCase() : "A"}
              </div>
            )}
            <h2 className="font-bold text-lg truncate">
              {state.appName || "اسم التطبيق"}
            </h2>
          </div>

          {/* Dynamic Views */}
          <div className="flex-1 p-6 pb-24">
            <AnimatePresence mode="wait">
              {/* Packages View (Now Onboarding/Client App) */}
              {currentView === "packages" && (
                <motion.div 
                  key="packages"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 z-50 bg-black"
                >
                  <ClientAppFlow 
                    builderStep={currentStep}
                    coach={{
                      name: state.appName || "اسم التطبيق",
                      logo: state.appLogo || "",
                      welcomeImage: state.welcomeImage,
                      bio: state.welcomeMessage || "مرحباً بك في فريقي! أنا هنا لأساعدك في الوصول إلى هدفك وتغيير حياتك للأفضل من خلال التزامك وتوجيهاتي المستمرة. هل أنت مستعد للبدء؟",
                      primaryColor: state.primaryColor,
                      intakeQuestions: state.intakeQuestions,
                      dashboardHeroImage: state.dashboardHeroImage,
                      dashboardHeroTopText: state.dashboardHeroTopText,
                      dashboardHeroMainText: state.dashboardHeroMainText,
                      dashboardHeroBottomText: state.dashboardHeroBottomText,
                      dashboardHeroProgress: state.dashboardHeroProgress,
                      packages: [
                        {
                          name: state.firstPackage.name || "الباقة الشاملة",
                          price: state.firstPackage.price || "50,000",
                          features: state.firstPackage.features || ["جدول تدريب مخصص", "نظام غذائي مرن"],
                          chatDays: state.firstPackage.chatDays,
                          chatHours: state.firstPackage.chatHours,
                          hasChat: state.firstPackage.hasChat,
                        },
                        {
                          name: "باقة المتابعة فقط",
                          price: "25,000",
                          features: ["متابعة مستمرة", "تعديل الجدول"],
                          chatDays: "3",
                          chatHours: "2",
                          hasChat: true,
                        }
                      ],
                    }} 
                  />
                </motion.div>
              )}

              {/* Login View */}
              {currentView === "login" && (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 flex flex-col justify-center h-full pt-10"
                >
                  <div className="text-center">
                    {state.appIcon ? (
                      <img src={state.appIcon} alt="Icon" className="w-24 h-24 mx-auto rounded-3xl object-cover mb-6 shadow-xl" />
                    ) : (
                      <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center font-black text-4xl mb-6 shadow-xl" style={{ backgroundColor: state.primaryColor, color: '#000' }}>
                        {state.appName ? state.appName.charAt(0).toUpperCase() : "A"}
                      </div>
                    )}
                    <h3 className="text-2xl font-black mb-2">أهلاً بك في {state.appName || "التطبيق"}</h3>
                    <p style={{ color: subTextColor }} className="text-sm">سجل دخولك لمتابعة تدريبك</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <input 
                        type="text" 
                        placeholder="البريد الإلكتروني" 
                        disabled
                        className="w-full p-4 rounded-xl text-sm"
                        style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}`, color: textColor }}
                      />
                    </div>
                    <div>
                      <input 
                        type="password" 
                        placeholder="كلمة المرور" 
                        disabled
                        className="w-full p-4 rounded-xl text-sm"
                        style={{ backgroundColor: cardColor, border: `1px solid ${borderColor}`, color: textColor }}
                      />
                    </div>
                    <button 
                      className="w-full py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95 mt-4"
                      style={{ backgroundColor: state.primaryColor, color: '#000' }}
                    >
                      تسجيل الدخول
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Profile View */}
              {currentView === "profile" && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2" style={{ borderColor: state.primaryColor }}>
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="User" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">أحمد محمد</h3>
                      <p style={{ color: state.primaryColor }} className="text-sm font-medium mt-1">مشترك نشط</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2" style={{ backgroundColor: cardColor }}>
                      <span style={{ color: subTextColor }} className="text-xs">الوزن الحالي</span>
                      <span className="text-xl font-black">75 Kg</span>
                    </div>
                    <div className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2" style={{ backgroundColor: cardColor }}>
                      <span style={{ color: subTextColor }} className="text-xs">أيام التدريب</span>
                      <span className="text-xl font-black">12 يوم</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {["الإعدادات", "الاشتراكات", "طرق الدفع", "تواصل مع الكابتن"].map((item, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-4 rounded-xl"
                        style={{ backgroundColor: cardColor }}
                      >
                        <span className="font-medium text-sm">{item}</span>
                        <ChevronLeft className="w-4 h-4" style={{ color: subTextColor }} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          {currentView !== "packages" && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-20 px-6 flex justify-between items-center backdrop-blur-xl border-t z-60"
              style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)', borderColor: borderColor }}
            >
              {[
                { id: "packages", icon: Home, label: "الرئيسية" },
                { id: "login", icon: LayoutDashboard, label: "تمارين" },
                { id: "profile", icon: User, label: "حسابي" }
              ].map((tab) => {
                const isActive = currentView === tab.id;
                return (
                  <button 
                    key={tab.id}
                    onClick={() => onViewChange(tab.id as MockupView)}
                    className="flex flex-col items-center gap-1.5 p-2 transition-transform active:scale-95"
                  >
                    <tab.icon 
                      className="w-6 h-6 transition-colors" 
                      style={{ color: isActive ? state.primaryColor : subTextColor }} 
                    />
                    <span 
                      className="text-[10px] font-bold transition-colors"
                      style={{ color: isActive ? state.primaryColor : subTextColor }}
                    >
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>
      
      {/* Decorative Blur behind phone */}
      <div 
        className="absolute -inset-10 -z-10 blur-[80px] opacity-10 rounded-full pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: state.primaryColor }}
      />
    </div>
  );
}
