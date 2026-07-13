import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, LogIn } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface WelcomeScreenProps {
  coach: {
    name: string;
    logo: string;
    welcomeImage?: string | null;
    bio: string;
    primaryColor: string;
  };
  onNext: () => void;
  onLogin: () => void;
}

export function WelcomeScreen({ coach, onNext, onLogin }: WelcomeScreenProps) {
  const { t, dir } = useLanguage();
  // Animation variants
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 15 } 
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#050505] text-white">
      
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        {coach.welcomeImage ? (
          <img 
            src={coach.welcomeImage} 
            alt="Welcome" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center">
             <span className="text-white/20 font-bold text-2xl">{t('welcome.noImage')}</span>
          </div>
        )}
      </div>

      {/* Gradient Overlay (Dark bottom) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

      {/* Content Container (Bottom Aligned) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-10 flex flex-col justify-end flex-1 w-full p-8 pb-12"
      >
        <motion.div variants={itemVariants} className={`mb-8 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <p className="text-white/70 text-sm mb-1.5 font-medium tracking-wide">
            {t('welcome.greeting')}
          </p>
          <h1 
            className="text-4xl font-black mb-3 uppercase tracking-tight leading-none"
            style={{ color: coach.primaryColor }}
          >
            {coach.name}
          </h1>
          <p className={`text-white/60 text-sm leading-relaxed max-w-[280px] ${dir === 'rtl' ? 'ml-auto' : 'mr-auto'}`}>
            {coach.bio}
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div variants={itemVariants} className="w-full flex flex-col gap-3">
          <button 
            onClick={onNext}
            className="w-full h-[64px] rounded-full font-black text-xl flex items-center justify-between px-2 transition-transform active:scale-95 group relative overflow-hidden"
            style={{ backgroundColor: coach.primaryColor, color: '#000' }}
          >
            <div className="absolute inset-0 group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full" />
            
            <span className={`px-4 relative z-10 w-full ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
              {t('welcome.startBtn')}
            </span>
            
            <div className="w-[48px] h-[48px] rounded-full bg-black flex items-center justify-center flex-shrink-0 relative z-10">
              {dir === 'rtl' ? <ArrowLeft className="w-5 h-5 text-white" /> : <ArrowRight className="w-5 h-5 text-white" />}
            </div>
          </button>
          
          <button 
            type="button"
            onClick={onLogin}
            className="group w-full h-[56px] rounded-full font-bold text-[16px] flex items-center justify-center gap-2.5 bg-transparent border border-white/10 text-white/70 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-300 active:scale-[0.98]"
          >
            <span>تسجيل الدخول إلى حسابك</span>
            <LogIn className="w-5 h-5 opacity-60 group-hover:opacity-100" />
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
