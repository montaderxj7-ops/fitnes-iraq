"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, AlertCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

interface CoachLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CoachLoginModal({ isOpen, onClose }: CoachLoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      isCoach: "true",
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onClose();
      router.push("/dashboard");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-neon/10 border border-neon/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-neon" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h1>
                <p className="text-gray-400 text-sm">أدخل بيانات الاعتماد للوصول إلى لوحة التحكم</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5 relative z-10">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-bold flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pl-3 pr-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-neon transition-colors" />
                    </div>
                    <input 
                      type="email" 
                      placeholder="البريد الإلكتروني" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-white focus:outline-none focus:border-neon/50 transition-colors"
                      dir="ltr"
                      required
                    />
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 right-0 pl-3 pr-4 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-gray-500 group-focus-within:text-neon transition-colors" />
                    </div>
                    <input 
                      type="password" 
                      placeholder="كلمة المرور" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-white focus:outline-none focus:border-neon/50 transition-colors tracking-widest font-mono"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-neon text-black font-black py-4 rounded-2xl hover:bg-[#c4ed3e] transition-colors shadow-[0_0_20px_rgba(214,248,84,0.2)] disabled:opacity-50 mt-4"
                >
                  {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">أو</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 mt-4"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  المتابعة باستخدام Google
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
