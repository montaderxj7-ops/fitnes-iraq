"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginCoach } from "@/actions/auth";
import { Mail, KeyRound } from "lucide-react";

export default function CoachLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const res = await loginCoach(email, password);
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "خطأ");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#82c91e]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#82c91e]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-[#82c91e]/10 border border-[#82c91e]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-8 h-8 text-[#82c91e]" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h1>
          <p className="text-gray-400 text-sm">أدخل بيانات الاعتماد للوصول إلى لوحة التحكم</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pl-3 pr-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#82c91e] transition-colors" />
              </div>
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-white focus:outline-none focus:border-[#82c91e]/50 transition-colors"
                dir="ltr"
                required
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pl-3 pr-4 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-500 group-focus-within:text-[#82c91e] transition-colors" />
              </div>
              <input 
                type="password" 
                placeholder="كلمة المرور" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-4 pr-12 text-white focus:outline-none focus:border-[#82c91e]/50 transition-colors tracking-widest font-mono"
                dir="ltr"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#82c91e] text-black font-black py-4 rounded-2xl hover:bg-[#94d82d] transition-colors shadow-[0_0_20px_rgba(130,201,30,0.2)] disabled:opacity-50 mt-4"
          >
            {isLoading ? "جاري التحقق..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
