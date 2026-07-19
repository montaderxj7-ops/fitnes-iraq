"use client";

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { WelcomeScreen } from '@/components/client-app/WelcomeScreen';
import { PackagesScreen } from '@/components/client-app/PackagesScreen';
import { CheckoutScreen } from '@/components/client-app/CheckoutScreen';
import { AuthScreen } from '@/components/client-app/AuthScreen';
import { IntakeForm } from '@/components/client-app/IntakeForm';
import { ClientDashboard } from '@/components/client-app/ClientDashboard';
import { LoginScreen } from '@/components/client-app/LoginScreen';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { registerClientPwa } from '@/actions/clients';
import { cn } from "@/lib/utils";

export interface IntakeQuestion {
  id: string;
  title: string;
  desc: string;
  type: "number" | "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
}

export interface CoachData {
  id: string;
  name: string;
  logo: string;
  welcomeImage?: string | null;
  bio: string;
  primaryColor: string;
  intakeQuestions: IntakeQuestion[];
  dashboardHeroImage: string | null;
  dashboardHeroTopText: string;
  dashboardHeroMainText: string;
  dashboardHeroBottomText: string;
  dashboardHeroProgress: string;
  packages: {
    name: string;
    price: string;
    features: string[];
    chatDays: string;
    chatHours: string;
    hasChat: boolean;
  }[];
  payments?: any;
  paymentMethods?: any[];
}

interface ClientAppFlowProps {
  coach: CoachData;
  builderStep?: number;
}

type Step = 'welcome' | 'packages' | 'checkout' | 'auth' | 'intake' | 'success' | 'dashboard' | 'login';

export function ClientAppFlow({ coach, builderStep }: ClientAppFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [userData, setUserData] = useState<{ id?: string; name: string; email: string; password?: string; image?: string; intakeData?: Record<string, string> } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  // Sync with builder step
  useEffect(() => {
    if (builderStep === 1) setStep('welcome');
    else if (builderStep === 2) setStep('packages');
    else if (builderStep === 3) setStep('packages');
    else if (builderStep === 4) setStep('checkout');
    else if (builderStep === 5) setStep('intake');
    else if (builderStep === 6) setStep('dashboard');
  }, [builderStep]);

  // Persist authentication state
  useEffect(() => {
    if (!builderStep) {
      try {
        const stored = localStorage.getItem('client_user_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) {
            setUserData(parsed);
            setStep('dashboard');
          }
        }
      } catch (e) {
        console.error("Error reading auth state", e);
      }
    }
  }, [builderStep]);

  // Screen transition variants
  const variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <LanguageProvider>
      <div className="h-full w-full bg-black text-white overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div key="welcome" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
            <WelcomeScreen 
              coach={coach} 
              onNext={() => setStep('packages')} 
              onLogin={() => setStep('login')}
            />
          </motion.div>
        )}

        {step === 'login' && (
          <motion.div key="login" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
            <LoginScreen 
              coach={coach}
              onSuccess={(data: any) => {
                setUserData(data);
                localStorage.setItem('client_user_data', JSON.stringify(data));
                if (data.package) {
                  const matchedPkg = coach.packages.find(p => p.name === data.package);
                  if (matchedPkg) setSelectedPackage(matchedPkg);
                }
                setStep('dashboard');
              }}
              onBack={() => setStep('welcome')}
            />
          </motion.div>
        )}

        {step === 'packages' && (
          <motion.div key="packages" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
            <PackagesScreen 
              coach={coach}
              onSelectPackage={(pkg) => {
                setSelectedPackage(pkg);
                setStep('checkout');
              }}
              onBack={() => setStep('welcome')}
            />
          </motion.div>
        )}

        {step === 'checkout' && (
          <motion.div key="checkout" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
            <CheckoutScreen 
              coach={coach}
              selectedPackage={selectedPackage || coach.packages[0]}
              onSuccess={(methodName) => {
                setPaymentMethod(methodName);
                setStep('auth');
              }}
              onBack={() => setStep('packages')}
            />
          </motion.div>
        )}

        {step === 'auth' && (
          <motion.div key="auth" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
            <AuthScreen 
              coach={coach}
              onSuccess={(data) => {
                setUserData(data);
                setStep('intake');
              }}
              onBack={() => setStep('checkout')}
            />
          </motion.div>
        )}

        {step === 'intake' && (
          <motion.div key="intake" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
            <IntakeForm 
              coach={coach}
              onComplete={async (data) => {
                setUserData(prev => prev ? { ...prev, intakeData: data } : null);
                // Call the backend to save client and trigger a task!
                if (userData) {
                  const res = await registerClientPwa(coach.id, {
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    package: selectedPackage?.name || coach.packages[0].name,
                    paymentMethod: paymentMethod,
                    age: data.age ? Number(data.age) : undefined,
                    weight: data.weight ? Number(data.weight) : undefined,
                    height: data.height ? Number(data.height) : undefined,
                    goal: data.goal,
                    injuries: data.injuries
                  });
                  if (!res.success) {
                    alert(res.error || "حدث خطأ أثناء التسجيل");
                    return;
                  }
                  
                  // Save auth session on registration success
                  const finalUser = {
                    id: res.client?.id || '',
                    name: userData.name,
                    email: userData.email,
                    package: selectedPackage?.name || coach.packages[0].name,
                    intakeData: data
                  };
                  setUserData(finalUser);
                  localStorage.setItem('client_user_data', JSON.stringify(finalUser));
                }
                setStep('success');
              }}
            />
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="success" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden" dir="rtl">
            
            {/* Background Glow */}
            <motion.div 
              animate={{ opacity: [0.05, 0.1, 0.05], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] blur-[100px] pointer-events-none rounded-full"
              style={{ backgroundColor: coach.primaryColor }}
            />

            <div className="z-10 flex flex-col items-center max-w-sm mx-auto">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                className="w-28 h-28 rounded-full flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                style={{ backgroundColor: coach.primaryColor }}
              >
                <svg className="w-14 h-14 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-black mb-4 tracking-tight"
              >
                جاهزين للانطلاق! 🚀
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 mb-12 leading-relaxed text-lg"
              >
                تم إعداد ملفك وحفظ اشتراكك بنجاح. خطتك التدريبية بانتظارك، لنبدأ بتحقيق أهدافك الآن.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full"
              >
                <motion.button 
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setStep('dashboard')}
                  className="w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all relative overflow-hidden group hover:brightness-110 shadow-lg text-black"
                  style={{ backgroundColor: coach.primaryColor, boxShadow: `0 10px 30px -10px ${coach.primaryColor}80` }}
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                  <span className="relative z-10 flex items-center gap-3">
                    ابدأ التدريب
                    <svg className="w-6 h-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === 'dashboard' && (
          <motion.div key="dashboard" variants={variants} initial="initial" animate="animate" exit="exit" className="h-full">
            <ClientDashboard 
              coach={coach}
              userData={userData || { 
                name: 'أحمد محمد', 
                email: 'ahmed@example.com',
                intakeData: {}
              }}
              selectedPackage={selectedPackage || coach.packages[0]}
              onLogout={() => {
                setUserData(null);
                localStorage.removeItem('client_user_data');
                setStep('welcome');
              }}
              onUpdateUser={(updated) => {
                const newData = { ...userData, ...updated };
                setUserData(newData);
                localStorage.setItem('client_user_data', JSON.stringify(newData));
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </LanguageProvider>
  );
}
