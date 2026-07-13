import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, Lock, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AuthScreenProps {
  coach: {
    primaryColor: string;
  };
  onSuccess: (data: { name: string; email: string; password?: string }) => void;
  onBack: () => void;
}

export function AuthScreen({ coach, onSuccess, onBack }: AuthScreenProps) {
  const { t, dir } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess({ name, email, password });
    }, 1500);
  };

  const handleGoogle = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess({ name: 'المتدرب عبر جوجل', email: 'google@example.com', password: '' });
    }, 1500);
  };

  return (
    <div className="min-h-full p-6 relative bg-[#050505] text-white flex flex-col overflow-x-hidden">
      {/* Background Effect */}
      <motion.div 
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -right-40 w-96 h-96 blur-[100px] pointer-events-none rounded-full"
        style={{ backgroundColor: coach.primaryColor }}
      />
      
      <div className="z-10 max-w-md w-full mx-auto flex-1 flex flex-col pt-4">
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group shrink-0"
          >
            {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" /> : <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />}
          </button>
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <h2 className="text-3xl font-black tracking-tight text-white mb-1">{t('auth.title')}</h2>
            <p className="text-gray-400 text-sm font-medium">{t('auth.subtitle')}</p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1"
        >
          <div className="space-y-4 mb-8">
            <button 
              onClick={handleGoogle}
              className="w-full bg-white text-black py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-gray-100 transition-colors active:scale-95 shadow-lg border border-transparent"
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-base whitespace-nowrap">{t('auth.google')}</span>
            </button>
            
            <div className="flex items-center gap-4 py-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t('auth.orEmail')}</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <form onSubmit={handleContinue} className="space-y-5">
              <div className="relative group">
                <label className="text-xs font-bold text-gray-400 mb-2 block px-1">{t('auth.fullName')}</label>
                <div dir={dir} className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden focus-within:border-transparent transition-all" style={{ '--tw-ring-color': coach.primaryColor } as any}>
                  <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                    <UserPlus className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    required
                    dir={dir}
                    placeholder={t('auth.fullNamePlaceholder')} 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-transparent py-4 ${dir === 'rtl' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4 text-left'} focus:outline-none transition-all text-white text-base placeholder:text-gray-700`} 
                    style={{ WebkitBoxShadow: '0 0 0px 1000px #111 inset', WebkitTextFillColor: 'white' }}
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-transparent focus-within:ring-2 transition-all pointer-events-none" style={{ borderColor: coach.primaryColor }} />
                </div>
              </div>

              <div className="relative group">
                <label className="text-xs font-bold text-gray-400 mb-2 block px-1">{t('auth.email')}</label>
                <div dir="ltr" className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden focus-within:border-transparent transition-all" style={{ '--tw-ring-color': coach.primaryColor } as any}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="email" 
                    required
                    dir="ltr"
                    placeholder={t('auth.emailPlaceholder')} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-4 pl-12 pr-4 text-left focus:outline-none transition-all text-white text-base placeholder:text-gray-700" 
                    style={{ WebkitBoxShadow: '0 0 0px 1000px #111 inset', WebkitTextFillColor: 'white' }}
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-transparent focus-within:ring-2 transition-all pointer-events-none" style={{ borderColor: coach.primaryColor }} />
                </div>
              </div>

              <div className="relative group">
                <label className="text-xs font-bold text-gray-400 mb-2 block px-1">{t('auth.password')}</label>
                <div dir="ltr" className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden focus-within:border-transparent transition-all" style={{ '--tw-ring-color': coach.primaryColor } as any}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                  </div>
                  <input 
                    type="password" 
                    required
                    dir="ltr"
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-4 pl-12 pr-4 text-left focus:outline-none transition-all font-mono tracking-widest text-white text-base placeholder:text-gray-700 placeholder:tracking-normal" 
                    style={{ WebkitBoxShadow: '0 0 0px 1000px #111 inset', WebkitTextFillColor: 'white' }}
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-transparent focus-within:ring-2 transition-all pointer-events-none" style={{ borderColor: coach.primaryColor }} />
                </div>
              </div>

              <div className="pt-4">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={isLoading}
                  type="submit"
                  className={cn(
                    "w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group",
                    isLoading ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"
                  )}
                  style={{ 
                    backgroundColor: coach.primaryColor,
                    color: '#000',
                    boxShadow: `0 10px 30px -10px ${coach.primaryColor}80`
                  }}
                >
                  {!isLoading && (
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5" />
                        {t('auth.continue')}
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </form>
          </div>
          
          <p className="text-center text-xs text-gray-500 leading-relaxed max-w-[280px] mx-auto">
            {t('auth.terms')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
