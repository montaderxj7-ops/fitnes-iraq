"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Loader2, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: string;
  billing: string;
}

export default function AuthModal({ isOpen, onClose, plan, billing }: AuthModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: "", email: "", password: "" };

    if (authMode === "signup" && !formData.name.trim()) {
      newErrors.name = "يرجى إدخال اسمك الكامل للمتابعة";
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "البريد الإلكتروني مطلوب";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "يرجى إدخال بريد إلكتروني صالح";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "يرجى إدخال كلمة المرور";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      router.push(`/checkout?plan=${plan}&billing=${billing}`);
    }, 1500);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      router.push(`/checkout?plan=${plan}&billing=${billing}`);
    }, 1500);
  };

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    },
    exit: { opacity: 0 }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with strong blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isLoading ? onClose : undefined}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md pointer-events-auto"
            >
              {/* Premium Glow Effect Behind Modal */}
              <div className="absolute -inset-[1px] bg-gradient-to-b from-neon/40 to-transparent rounded-[28px] opacity-50 blur-sm pointer-events-none" />
              
              <div className="relative overflow-hidden rounded-[26px] bg-[#0a0a0a] border border-white/10 shadow-2xl">
                
                {/* Subtle top glare */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                {/* Background ambient orbs */}
                <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-neon/10 rounded-full blur-[60px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[50%] h-[50%] bg-neon/5 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative p-8">
                  {/* Close Button */}
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="absolute left-6 top-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="mb-8 text-right pr-2">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                      <h2 className="text-3xl font-black text-white mb-2 tracking-tight">أهلاً بك يا بطل.</h2>
                      <p className="text-gray-400 text-sm">أنت على بُعد خطوة واحدة من إطلاق منصتك.</p>
                    </motion.div>
                  </div>

                  <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    
                    {/* Google Button */}
                    <motion.div variants={itemVariants}>
                      <button
                        onClick={handleGoogleAuth}
                        disabled={isLoading}
                        className="group relative w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-bold transition-all hover:bg-gray-100 disabled:opacity-70 overflow-hidden"
                      >
                        {/* Hover glow for google button */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        
                        {isLoading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>المتابعة باستخدام Google</span>
                          </>
                        )}
                      </button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase tracking-widest">
                        <span className="bg-[#0a0a0a] px-4 text-gray-500 font-medium">أو بالبريد الإلكتروني</span>
                      </div>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                      {authMode === "signup" && (
                        <motion.div variants={itemVariants} className="relative group">
                          <User className={cn("absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", errors.name ? "text-red-500" : "text-gray-500 group-focus-within:text-neon")} />
                          <input
                            type="text"
                            placeholder="الاسم الكامل"
                            disabled={isLoading}
                            value={formData.name}
                            onChange={(e) => {
                              setFormData({ ...formData, name: e.target.value });
                              if (errors.name) setErrors({ ...errors, name: "" });
                            }}
                            className={cn(
                              "w-full bg-white/5 border rounded-2xl py-3.5 pr-12 pl-4 text-white placeholder:text-gray-500 focus:outline-none focus:bg-white/10 transition-all",
                              errors.name ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-white/10 focus:border-neon/50 focus:ring-4 focus:ring-neon/10"
                            )}
                          />
                          <AnimatePresence>
                            {errors.name && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5 font-medium pr-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {errors.name}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                      
                      <motion.div variants={itemVariants} className="relative group">
                        <Mail className={cn("absolute right-4 top-[25px] -translate-y-1/2 h-5 w-5 transition-colors", errors.email ? "text-red-500" : "text-gray-500 group-focus-within:text-neon")} />
                        <input
                          type="email"
                          placeholder="البريد الإلكتروني"
                          disabled={isLoading}
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: "" });
                          }}
                          className={cn(
                            "w-full bg-white/5 border rounded-2xl py-3.5 pr-12 pl-4 text-white placeholder:text-gray-500 focus:outline-none focus:bg-white/10 transition-all",
                            errors.email ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-white/10 focus:border-neon/50 focus:ring-4 focus:ring-neon/10"
                          )}
                        />
                        <AnimatePresence>
                          {errors.email && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5 font-medium pr-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.email}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div variants={itemVariants} className="relative group">
                        <Lock className={cn("absolute right-4 top-[25px] -translate-y-1/2 h-5 w-5 transition-colors pointer-events-none", errors.password ? "text-red-500" : "text-gray-500 group-focus-within:text-neon")} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="كلمة المرور"
                          disabled={isLoading}
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            if (errors.password) setErrors({ ...errors, password: "" });
                          }}
                          className={cn(
                            "w-full bg-white/5 border rounded-2xl py-3.5 pr-12 pl-12 text-white placeholder:text-gray-500 focus:outline-none focus:bg-white/10 transition-all",
                            errors.password ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" : "border-white/10 focus:border-neon/50 focus:ring-4 focus:ring-neon/10"
                          )}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-4 top-[25px] -translate-y-1/2 text-gray-500 hover:text-white transition-colors focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                        <AnimatePresence>
                          {errors.password && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5 font-medium pr-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.password}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      <motion.div variants={itemVariants} className="pt-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="w-full group bg-neon text-black font-black py-4 rounded-2xl hover:bg-[#c4e649] hover:shadow-[0_0_25px_rgba(214,248,84,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <span>{authMode === "signup" ? "إنشاء حساب" : "تسجيل الدخول"}</span>
                              <ArrowRight className="h-5 w-5 -rotate-180 group-hover:-translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </motion.div>
                    </form>

                    <motion.div variants={itemVariants} className="mt-6 text-center">
                      <button 
                        onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                        className="text-gray-400 text-sm hover:text-neon transition-colors font-medium"
                        type="button"
                      >
                        {authMode === "signup" ? "لديك حساب بالفعل؟ تسجيل الدخول" : "ليس لديك حساب؟ إنشاء حساب جديد"}
                      </button>
                    </motion.div>

                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
