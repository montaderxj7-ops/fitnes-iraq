import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Mail, Lock, LogIn } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { loginClient } from '@/actions/clients';

export function LoginScreen({ coach, onSuccess, onBack }: any) {
  const { t, dir } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const res = await loginClient(coach.id, email, password);
    if (res.success && res.client) {
      onSuccess({
        id: res.client.id,
        name: res.client.name,
        email: res.client.email || email,
        package: res.client.package,
        intakeData: {
          age: res.client.age?.toString() || '',
          weight: res.client.weight?.toString() || '',
          height: res.client.height?.toString() || '',
          goal: res.client.goal || '',
          injuries: res.client.injuries || '',
        }
      });
    } else {
      setError(res.error || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full p-6 relative bg-[#050505] text-white flex flex-col overflow-x-hidden">
      <div className="z-10 max-w-md w-full mx-auto flex-1 flex flex-col pt-4">
        <div className="flex flex-col mb-10">
          <button 
            onClick={onBack}
            className="w-10 h-10 mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group shrink-0"
            style={{ alignSelf: dir === 'rtl' ? 'flex-start' : 'flex-end' }}
          >
            {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" /> : <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />}
          </button>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={dir === 'rtl' ? 'text-right' : 'text-left'}
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">تسجيل الدخول</h2>
            <p className="text-gray-400 text-sm sm:text-base font-medium">مرحباً بعودتك، اكمل تدريبك!</p>
          </motion.div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <div className="relative group">
            <label className="text-xs font-bold text-gray-400 mb-2 block px-1 group-focus-within:text-gray-300 transition-colors">البريد الإلكتروني</label>
            <div dir="ltr" className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all group-focus-within:bg-white/10 group-focus-within:border-white/20 group-focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
              </div>
              <input 
                type="email" 
                required
                dir="ltr"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-4 pl-12 pr-4 text-left focus:outline-none transition-all text-white text-[16px] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0A0A0A_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]" 
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-focus-within:ring-2 pointer-events-none transition-all" style={{ borderColor: coach.primaryColor }} />
            </div>
          </div>

          <div className="relative group">
            <label className="text-xs font-bold text-gray-400 mb-2 block px-1 group-focus-within:text-gray-300 transition-colors">كلمة المرور</label>
            <div dir="ltr" className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all group-focus-within:bg-white/10 group-focus-within:border-white/20 group-focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05)]">
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
                className="w-full bg-transparent py-4 pl-12 pr-4 text-left focus:outline-none transition-all text-white text-[16px] font-mono tracking-widest [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0A0A0A_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]" 
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent group-focus-within:ring-2 pointer-events-none transition-all" style={{ borderColor: coach.primaryColor }} />
            </div>
          </div>

          <div className="pt-6">
            <button
              disabled={isLoading}
              type="submit"
              className="w-full h-[60px] rounded-full font-black text-[17px] flex items-center justify-between px-2 transition-transform active:scale-95 relative overflow-hidden group mb-4"
              style={{ backgroundColor: coach.primaryColor, color: '#000' }}
            >
              <div className="absolute inset-0 group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 -translate-x-full" />
              
              <span className={`px-4 relative z-10 w-full text-center`}>
                {isLoading ? 'جاري التحقق...' : 'تسجيل الدخول'}
              </span>
              
              <div className="w-[44px] h-[44px] rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 relative z-10">
                {dir === 'rtl' ? <ArrowLeft className="w-5 h-5 text-black/80" /> : <ArrowRight className="w-5 h-5 text-black/80" />}
              </div>
            </button>
            
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-gray-500 text-sm font-medium">أو الدخول بواسطة</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              type="button"
              onClick={() => alert("سيتم تفعيل الدخول عبر جوجل عند ربط مفاتيح API الخاصة بك")}
              className="w-full h-[56px] mt-2 rounded-full font-bold text-[16px] flex items-center justify-center gap-3 bg-white border border-white text-black hover:bg-gray-100 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>المتابعة باستخدام Google</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
