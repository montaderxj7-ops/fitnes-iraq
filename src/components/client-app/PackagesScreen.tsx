import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowLeft, ArrowRight, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Package {
  name: string;
  price: string;
  features: string[];
  chatDays: string;
  chatHours: string;
  hasChat: boolean;
}

interface PackagesScreenProps {
  coach: {
    primaryColor: string;
    packages: Package[];
  };
  onSelectPackage: (pkg: Package) => void;
  onBack: () => void;
}

export function PackagesScreen({ coach, onSelectPackage, onBack }: PackagesScreenProps) {
  const { t, dir } = useLanguage();
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      }
    }
  };

  const cardVariants: any = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="min-h-full p-6 relative overflow-hidden bg-[#050505] text-white flex flex-col">
      {/* Background Animated Orbs */}
      <motion.div 
        animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-20%] w-[80%] h-[50%] blur-[100px] pointer-events-none rounded-full"
        style={{ backgroundColor: coach.primaryColor }}
      />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="z-10 max-w-md w-full mx-auto flex-1 flex flex-col pt-4">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 group"
          >
            {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" /> : <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />}
          </button>
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h2 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg mb-1">
              {t('packages.title')}
            </h2>
            <p className="text-gray-400 text-sm font-medium">{t('packages.subtitle')}</p>
          </motion.div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6 flex-1 pb-10"
        >
          {coach.packages.map((pkg, idx) => {
            const isMain = idx === 0;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "relative overflow-hidden rounded-3xl p-[1px] transition-all duration-300",
                  isMain ? "shadow-2xl" : "shadow-lg opacity-90 hover:opacity-100"
                )}
                style={{
                  boxShadow: isMain ? `0 20px 40px -15px ${coach.primaryColor}30` : 'none'
                }}
              >
                {/* Border Gradient (for main package) */}
                {isMain ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent z-0" style={{ backgroundImage: `linear-gradient(to bottom right, ${coach.primaryColor}, transparent)` }} />
                ) : (
                  <div className="absolute inset-0 bg-white/10 z-0" />
                )}

                <div className="relative z-10 bg-[#0a0a0a]/95 backdrop-blur-xl h-full rounded-[23px] p-6 flex flex-col border border-white/5">
                  
                  {/* Subtle Glow inside the card */}
                  {isMain && (
                    <div 
                      className="absolute top-0 right-0 w-32 h-32 blur-[50px] opacity-20 pointer-events-none rounded-full" 
                      style={{ backgroundColor: coach.primaryColor }} 
                    />
                  )}

                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {isMain && <Crown className="w-5 h-5" style={{ color: coach.primaryColor }} />}
                        <h3 className="text-xl font-black text-white tracking-tight">{pkg.name}</h3>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold" style={{ color: coach.primaryColor }}>
                          {isNaN(Number(String(pkg.price).replace(/,/g, ''))) 
                            ? pkg.price 
                            : Number(String(pkg.price).replace(/,/g, '')).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 font-bold tracking-wider">IQD</span>
                        <span className="text-xs text-gray-600 font-medium mr-1">/ {t('packages.month') || 'شهر'}</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {pkg.features.map((feature, i) => feature.trim() && (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                        <div className="mt-0.5 rounded-full p-0.5" style={{ backgroundColor: `${coach.primaryColor}20` }}>
                          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: coach.primaryColor }} />
                        </div>
                        <span className="leading-snug font-medium">{feature}</span>
                      </li>
                    ))}
                    
                    {pkg.hasChat && (
                      <li className="flex items-start gap-3 text-sm text-gray-200">
                        <div className="mt-0.5 rounded-full p-0.5" style={{ backgroundColor: `${coach.primaryColor}20` }}>
                          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: coach.primaryColor }} />
                        </div>
                        <span className="leading-snug font-medium">
                          {t('packages.chat_support', { days: pkg.chatDays }).replace('{days}', pkg.chatDays.toString())}
                          <span className="text-gray-500 block text-xs mt-1">{t('packages.chat_hours', { hours: pkg.chatHours }).replace('{hours}', pkg.chatHours.toString())}</span>
                        </span>
                      </li>
                    )}
                  </ul>

                  <button
                    onClick={() => onSelectPackage(pkg)}
                    className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center transition-all group/btn overflow-hidden"
                    style={{ 
                      backgroundColor: isMain ? coach.primaryColor : 'rgba(255,255,255,0.1)',
                      color: isMain ? '#000' : '#fff',
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {t('packages.start')}
                      {dir === 'rtl' ? <ArrowLeft className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" /> : <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />}
                    </span>
                    {isMain && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] skew-x-12" />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
