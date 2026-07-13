"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck, SmartphoneNfc, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { SparklesComp as Sparkles } from "@/components/ui/sparkles";
import { Suspense } from "react";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const plan = searchParams.get("plan") || "الباقة الاحترافية";
  const billing = searchParams.get("billing") || "monthly";
  
  const price = plan === "الباقة الاحترافية" ? (billing === "yearly" ? 200 : 50) : (billing === "yearly" ? 100 : 25);
  
  const [selectedMethod, setSelectedMethod] = useState<"card" | "zain" | "fib" | null>(null);
  const [zainPhone, setZainPhone] = useState("");
  
  // Card states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

  // FIB states
  const [fibAccount, setFibAccount] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePayment = () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/builder");
      }, 2000);
    }, 2500);
  };

  // --- Animations ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 25 } }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden" dir="rtl">
        {/* Success Background Orbs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <motion.div 
             initial={{ scale: 0, opacity: 0 }} 
             animate={{ scale: 1.5, opacity: 0.1 }} 
             transition={{ duration: 1.5, ease: "easeOut" }} 
             className="w-[600px] h-[600px] bg-neon rounded-full blur-[100px]" 
           />
        </div>
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-center relative z-10"
        >
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-32 h-32 mx-auto bg-gradient-to-tr from-neon/20 to-neon/5 border border-neon/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(214,248,84,0.4)] backdrop-blur-xl"
          >
            <CheckCircle2 className="w-16 h-16 text-neon" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="text-5xl font-black text-white mb-4 tracking-tight"
          >
            تم الدفع بنجاح!
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-gray-400 text-xl font-medium"
          >
            مرحباً بك في منصتك. جاري توجيهك لإعداد تطبيقك...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] pt-8 pb-20 px-4 md:px-8 relative overflow-hidden" dir="rtl">
      {/* Premium Background Layer */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <Sparkles density={800} className="absolute inset-0 h-full w-full opacity-50" color="#FFFFFF" direction="top" speed={1.2} />
      </div>

      <div className="absolute left-1/2 top-[-300px] w-full h-full flex justify-center pointer-events-none opacity-20 -translate-x-1/2">
          <div className="h-[1000px] w-[1400px] rounded-full" style={{ background: "radial-gradient(circle at 50% 50%, var(--color-neon) 0%, transparent 50%)" }} />
      </div>

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay"
        style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '100px 100px', maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)' }}
      />

      <div className="max-w-6xl mx-auto relative z-10 pt-4">
        <motion.button 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all mb-12 hover:gap-3 group"
        >
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          <span className="font-medium">العودة للباقات</span>
        </motion.button>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Right Column - Payment Methods */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl font-black text-white mb-3 tracking-tight flex items-center gap-3">
                إتمام الدفع <ShieldCheck className="w-8 h-8 text-neon" />
              </h1>
              <p className="text-gray-400 text-lg">اختر طريقة الدفع المناسبة، جميع معاملاتك مشفرة وآمنة بنسبة 100%.</p>
            </motion.div>

            <motion.div variants={containerVariants} className="space-y-5">
              
              {/* Zain Cash Card */}
              <motion.button
                layout
                variants={itemVariants}
                onClick={() => setSelectedMethod("zain")}
                className={cn(
                  "relative w-full flex flex-col text-right p-6 rounded-[28px] transition-all duration-500 overflow-hidden group outline-none",
                  selectedMethod === "zain" 
                    ? "bg-white/10 shadow-[0_20px_40px_-15px_rgba(214,248,84,0.15)] -translate-y-1 scale-[1.01]" 
                    : "bg-white/[0.02] hover:bg-white/[0.04] hover:-translate-y-0.5"
                )}
              >
                {/* Active Gradient Border */}
                {selectedMethod === "zain" && (
                  <motion.div layoutId="activeBorder" className="absolute inset-0 rounded-[28px] border-2 border-neon/50 pointer-events-none" />
                )}
                {!selectedMethod && <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />}

                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="flex items-center gap-5">
                    <div className={cn("flex -space-x-3 space-x-reverse transition-all duration-500", selectedMethod === "zain" ? "scale-110" : "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100")}>
                      {/* Zain Logo */}
                      <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center shadow-lg relative z-20 overflow-hidden p-1.5 border border-gray-100">
                        <img src="https://www.google.com/s2/favicons?sz=128&domain_url=zaincash.iq" alt="Zain" className="w-full h-full object-contain" />
                      </div>
                      {/* Asiacell Logo */}
                      <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center shadow-lg relative z-10 overflow-hidden p-1.5 border border-gray-100">
                        <img src="https://www.google.com/s2/favicons?sz=128&domain_url=asiacell.com" alt="Asiacell" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div>
                      <h3 className={cn("font-black text-xl transition-colors", selectedMethod === "zain" ? "text-white" : "text-gray-200")}>Zain Cash / AsiaHawala</h3>
                      <p className="text-sm text-gray-500 mt-1">المحافظ الإلكترونية المحلية</p>
                    </div>
                  </div>
                  <div className={cn("w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500", selectedMethod === "zain" ? "border-neon bg-neon/10" : "border-white/20")}>
                    <motion.div initial={false} animate={{ scale: selectedMethod === "zain" ? 1 : 0 }} className="w-3.5 h-3.5 rounded-full bg-neon" />
                  </div>
                </div>

                <AnimatePresence>
                  {selectedMethod === "zain" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden w-full relative z-10"
                    >
                      <div className="pt-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">رقم الهاتف المرتبط بالمحفظة</label>
                        <input 
                          type="tel" 
                          placeholder="07XX XXX XXXX"
                          value={zainPhone}
                          onChange={(e) => setZainPhone(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-neon focus:bg-white/5 focus:ring-4 focus:ring-neon/10 transition-all outline-none text-lg tracking-wider"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Bank Cards */}
              <motion.button
                layout
                variants={itemVariants}
                onClick={() => setSelectedMethod("card")}
                className={cn(
                  "relative w-full flex flex-col text-right p-6 rounded-[28px] transition-all duration-500 overflow-hidden group outline-none",
                  selectedMethod === "card" 
                    ? "bg-white/10 shadow-[0_20px_40px_-15px_rgba(214,248,84,0.15)] -translate-y-1 scale-[1.01]" 
                    : "bg-white/[0.02] hover:bg-white/[0.04] hover:-translate-y-0.5"
                )}
              >
                {selectedMethod === "card" && <motion.div layoutId="activeBorder" className="absolute inset-0 rounded-[28px] border-2 border-neon/50 pointer-events-none" />}
                {!selectedMethod && <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />}
                
                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="flex items-center gap-5">
                    <div className={cn("flex -space-x-3 space-x-reverse transition-all duration-500", selectedMethod === "card" ? "scale-110" : "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100")}>
                      {/* Mastercard */}
                      <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center shadow-lg relative z-20 overflow-hidden p-1.5 border border-gray-100">
                        <img src="https://www.google.com/s2/favicons?sz=128&domain_url=mastercard.com" alt="Mastercard" className="w-full h-full object-contain" />
                      </div>
                      {/* Visa */}
                      <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center shadow-lg relative z-10 overflow-hidden p-1.5 border border-gray-100">
                        <img src="https://www.google.com/s2/favicons?sz=128&domain_url=visa.com" alt="Visa" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div>
                      <h3 className={cn("font-black text-xl transition-colors", selectedMethod === "card" ? "text-white" : "text-gray-200")}>البطاقات المصرفية</h3>
                      <p className="text-sm text-gray-500 mt-1">MasterCard / Visa</p>
                    </div>
                  </div>
                  <div className={cn("w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500", selectedMethod === "card" ? "border-neon bg-neon/10" : "border-white/20")}>
                    <motion.div initial={false} animate={{ scale: selectedMethod === "card" ? 1 : 0 }} className="w-3.5 h-3.5 rounded-full bg-neon" />
                  </div>
                </div>
                
                <AnimatePresence>
                  {selectedMethod === "card" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden w-full relative z-10"
                    >
                      <div className="pt-6 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">الاسم على البطاقة</label>
                          <input 
                            type="text" 
                            placeholder="الاسم الكامل"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-neon focus:bg-white/5 focus:ring-4 focus:ring-neon/10 transition-all outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">رقم البطاقة</label>
                          <input 
                            type="text" 
                            placeholder="XXXX XXXX XXXX XXXX"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-neon focus:bg-white/5 focus:ring-4 focus:ring-neon/10 transition-all outline-none tracking-widest text-left direction-ltr"
                            dir="ltr"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">تاريخ الانتهاء</label>
                            <input 
                              type="text" 
                              placeholder="MM/YY"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-neon focus:bg-white/5 focus:ring-4 focus:ring-neon/10 transition-all outline-none text-center"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">رمز الأمان (CVC)</label>
                            <input 
                              type="text" 
                              placeholder="123"
                              value={cardCVC}
                              onChange={(e) => setCardCVC(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-neon focus:bg-white/5 focus:ring-4 focus:ring-neon/10 transition-all outline-none text-center tracking-widest"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Digital Banks (FIB) */}
              <motion.button
                layout
                variants={itemVariants}
                onClick={() => setSelectedMethod("fib")}
                className={cn(
                  "relative w-full flex flex-col text-right p-6 rounded-[28px] transition-all duration-500 overflow-hidden group outline-none",
                  selectedMethod === "fib" 
                    ? "bg-white/10 shadow-[0_20px_40px_-15px_rgba(214,248,84,0.15)] -translate-y-1 scale-[1.01]" 
                    : "bg-white/[0.02] hover:bg-white/[0.04] hover:-translate-y-0.5"
                )}
              >
                {selectedMethod === "fib" && <motion.div layoutId="activeBorder" className="absolute inset-0 rounded-[28px] border-2 border-neon/50 pointer-events-none" />}
                {!selectedMethod && <div className="absolute inset-0 rounded-[28px] border border-white/5 pointer-events-none" />}

                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="flex items-center gap-5">
                    <div className={cn("transition-all duration-500", selectedMethod === "fib" ? "scale-110" : "grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100")}>
                      {/* FIB Logo */}
                      <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center shadow-lg relative z-20 overflow-hidden p-1.5 border border-gray-100">
                        <img src="https://www.google.com/s2/favicons?sz=128&domain_url=fib.iq" alt="FIB" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <div>
                      <h3 className={cn("font-black text-xl transition-colors", selectedMethod === "fib" ? "text-white" : "text-gray-200")}>البنوك الرقمية</h3>
                      <p className="text-sm text-gray-500 mt-1">First Iraqi Bank (FIB)</p>
                    </div>
                  </div>
                  <div className={cn("w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500", selectedMethod === "fib" ? "border-neon bg-neon/10" : "border-white/20")}>
                    <motion.div initial={false} animate={{ scale: selectedMethod === "fib" ? 1 : 0 }} className="w-3.5 h-3.5 rounded-full bg-neon" />
                  </div>
                </div>

                <AnimatePresence>
                  {selectedMethod === "fib" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden w-full relative z-10"
                    >
                      <div className="pt-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">رقم الحساب أو الهاتف المرتبط بـ FIB</label>
                        <input 
                          type="text" 
                          placeholder="رقم الحساب أو الهاتف"
                          value={fibAccount}
                          onChange={(e) => setFibAccount(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-neon focus:bg-white/5 focus:ring-4 focus:ring-neon/10 transition-all outline-none text-lg tracking-wider"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

            </motion.div>
          </div>

          {/* Left Column - Order Summary */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              variants={itemVariants}
              className="sticky top-12 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 lg:p-10 shadow-[0_0_60px_rgba(0,0,0,0.5)] mt-8 lg:mt-0 overflow-hidden"
            >
              {/* Subtle glass glare */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon/5 blur-[80px] rounded-full pointer-events-none" />

              <h2 className="text-2xl font-black text-white mb-8 relative z-10 flex items-center gap-3">
                ملخص الطلب
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-gray-300">فاتورة رقم #9924</span>
              </h2>
              
              <div className="relative z-10 bg-[#0a0a0a]/80 backdrop-blur-md rounded-3xl p-6 mb-6 border border-white/5 shadow-inner">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-black text-white text-xl mb-2">{plan}</h3>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-neon/10 text-neon text-xs font-bold border border-neon/20">
                        {billing === "yearly" ? "اشتراك سنوي" : "اشتراك شهري"}
                      </span>
                    </div>
                  </div>
                  <div className="text-left bg-white/5 py-2 px-4 rounded-2xl border border-white/5">
                    <div className="flex items-baseline gap-1 text-white font-black text-3xl">
                      <span className="text-xl opacity-60">$</span>
                      <NumberFlow value={price} />
                      <span className="text-sm text-gray-500 font-normal mr-1">/ {billing === "yearly" ? "سنة" : "شهر"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-white/5 pt-6 mt-2">
                  <ul className="space-y-4">
                    {[
                      "تطبيق مخصص باسمك وهويتك",
                      plan === "الباقة الاحترافية" ? "إدارة عدد لا محدود من المتدربين بذكاء" : "إدارة حتى 50 متدرب بكفاءة",
                      "بوابة دفع محلية لاستقبال أموالك بسهولة"
                    ].map((feature, i) => (
                      <motion.li 
                        key={i} 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (i * 0.1) }}
                        className="flex items-start gap-3 text-sm text-gray-300"
                      >
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-neon/20 flex items-center justify-center shrink-0 border border-neon/20 shadow-[0_0_10px_rgba(214,248,84,0.2)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-neon" />
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>



              <div className="relative z-10 flex justify-between items-end mb-8 px-2">
                <div className="flex flex-col">
                  <span className="text-gray-400 font-medium text-sm mb-1">الإجمالي المستحق</span>
                  <span className="text-xs text-gray-600">شامل الضرائب والرسوم</span>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-baseline gap-1 text-neon font-black text-4xl">
                    <span className="text-2xl opacity-80">$</span>
                    <NumberFlow value={price} />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
                className={cn(
                  "relative z-10 w-full py-5 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 transition-all duration-500 overflow-hidden group",
                  !selectedMethod 
                    ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5" 
                    : isProcessing 
                      ? "bg-neon text-black cursor-wait shadow-[0_0_40px_rgba(214,248,84,0.4)] scale-[0.98]"
                      : "bg-neon text-black hover:bg-[#c4e649] shadow-[0_0_30px_rgba(214,248,84,0.3)] hover:shadow-[0_0_50px_rgba(214,248,84,0.5)] hover:-translate-y-1"
                )}
              >
                {/* Shine effect on button hover */}
                {selectedMethod && !isProcessing && (
                  <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-in-out" />
                )}

                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    جاري المعالجة الآمنة...
                  </>
                ) : (
                  <>تأكيد الدفع</>
                )}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>مدفوعات مشفرة وآمنة بنسبة 100% بتقنية SSL</span>
              </div>

              <AnimatePresence>
                {isProcessing && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-center text-neon/80 text-sm mt-5 font-medium animate-pulse relative z-10"
                  >
                    يرجى عدم إغلاق هذه الصفحة أو الرجوع للخلف
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-10 h-10 text-neon animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
