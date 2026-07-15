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
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
