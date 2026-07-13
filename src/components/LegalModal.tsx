"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Scale, Handshake, CreditCard, AlertTriangle, Shield, Database, Eye, UserCheck, RefreshCcw, Clock, Mail, Info } from "lucide-react";
import { useEffect } from "react";

type LegalType = "terms" | "privacy" | "refund" | null;

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LegalType;
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const content = {
    terms: {
      title: "شروط الاستخدام",
      icon: <Scale className="w-6 h-6 text-neon" />,
      body: (
        <div className="space-y-8 text-gray-300 leading-relaxed text-sm md:text-base text-right mt-4">
          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <FileText className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">1. مقدمة</h2>
              <p>مرحباً بك في منصة Fitness Iraq. باستخدامك لمنصتنا كمدرب أو كمتدرب، فإنك توافق على الالتزام بالشروط والأحكام الموضحة في هذه الوثيقة.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <UserCheck className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">2. الحسابات والالتزامات</h2>
              <ul className="list-disc list-inside space-y-2 mt-2 text-gray-400">
                <li>يجب أن تكون المعلومات التي تقدمها عند التسجيل دقيقة وحديثة.</li>
                <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بحسابك.</li>
                <li>يُمنع استخدام المنصة لأي أغراض غير قانونية أو لتقديم محتوى ضار أو مسيء.</li>
              </ul>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <Handshake className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">3. العلاقة بين المدرب والمتدرب</h2>
              <p>المنصة توفر للمدربين أدوات لبناء تطبيقاتهم الخاصة وتقديم خدماتهم التدريبية. Fitness Iraq ليست طرفاً في الاتفاق أو الخدمة المُقدمة، ولا نتحمل أي مسؤولية طبية أو قانونية ناتجة عن التمارين أو الأنظمة الغذائية.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <CreditCard className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">4. المدفوعات والاشتراكات</h2>
              <p>الاشتراكات السنوية والشهرية تُدفع مقدماً وتخضع لسياسة الاسترجاع الخاصة بنا. نحتفظ بالحق في تعديل الأسعار مستقبلاً مع إشعار مسبق لجميع المشتركين النشطين.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <AlertTriangle className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">5. إخلاء المسؤولية</h2>
              <p>يتم تقديم الخدمات في منصتنا "كما هي". نحن لا نضمن عدم تعطل الخدمات في أوقات التحديث والصيانة، ولكننا نلتزم بتقديم أفضل مستوى ممكن من الاستقرار والأمان.</p>
            </div>
          </section>
        </div>
      )
    },
    privacy: {
      title: "سياسة الخصوصية",
      icon: <Shield className="w-6 h-6 text-neon" />,
      body: (
        <div className="space-y-8 text-gray-300 leading-relaxed text-sm md:text-base text-right mt-4">
          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <Shield className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">1. حماية بياناتك</h2>
              <p>نحن في Fitness Iraq نأخذ خصوصيتك على محمل الجد. نلتزم بحماية بياناتك الشخصية وبيانات متدربيك باستخدام أحدث بروتوكولات التشفير والأمان.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <Database className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">2. ما هي البيانات التي نجمعها؟</h2>
              <ul className="list-disc list-inside space-y-2 mt-2 text-gray-400">
                <li>المعلومات الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف).</li>
                <li>بيانات الدفع (تُعالج بأمان عبر شركائنا الماليين ولا نقوم بتخزين تفاصيل البطاقات).</li>
                <li>البيانات التي تُدخلها في التطبيق مثل الجداول وبرامج التدريب وصور التطور.</li>
              </ul>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <Eye className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">3. كيف نستخدم هذه البيانات؟</h2>
              <p>تُستخدم البيانات بشكل أساسي لتوفير خدماتنا لك وتمكين عمل تطبيقك بسلاسة. لا نقوم ببيع أو مشاركة بياناتك الشخصية مع أطراف ثالثة لأغراض تسويقية. يتم استخدامها فقط لتحسين النظام وللتواصل معك.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <UserCheck className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">4. حقوقك</h2>
              <p>لديك الحق الكامل في الوصول إلى بياناتك أو طلب تعديلها أو مسحها نهائياً من خوادمنا. يمكنك طلب ذلك من خلال التواصل مع الدعم الفني.</p>
            </div>
          </section>
        </div>
      )
    },
    refund: {
      title: "سياسة الاسترجاع",
      icon: <RefreshCcw className="w-6 h-6 text-neon" />,
      body: (
        <div className="space-y-8 text-gray-300 leading-relaxed text-sm md:text-base text-right mt-4">
          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <Info className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">1. سياسة عامة</h2>
              <p>نحن في Fitness Iraq نسعى لتقديم أفضل تجربة ممكنة. إذا لم تكن راضياً عن خدمتنا، يُرجى الاطلاع على شروط الاسترجاع أدناه.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <Clock className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">2. فترة التجربة وإلغاء الاشتراك</h2>
              <p>إذا قمت بالاشتراك في أي من الباقات المدفوعة ولم تكن مقتنعاً بالخدمة، يحق لك طلب استرداد المبلغ كاملاً خلال <strong>أول 7 أيام</strong> من تاريخ الدفع الأولي.</p>
              <p className="mt-2 text-gray-400">بعد انقضاء السبعة أيام الأولى، لا يمكننا إصدار أي استرداد مالي للمدفوعات الشهرية أو السنوية المستقطعة. ولكن يمكنك إلغاء التجديد التلقائي في أي وقت من إعدادات حسابك.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <Mail className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">3. خطوات طلب الاسترجاع</h2>
              <p>لطلب الاسترجاع ضمن فترة الـ 7 أيام، يرجى مراسلة فريق الدعم الفني على البريد الإلكتروني مع تزويدنا برقم الحساب أو البريد الإلكتروني المسجل.</p>
            </div>
          </section>

          <section className="flex gap-4 items-start">
            <div className="p-3 rounded-xl bg-neon/10 border border-neon/20 shrink-0">
              <AlertTriangle className="w-5 h-5 text-neon" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">4. المدفوعات داخل تطبيقات الكباتن</h2>
              <p>يُرجى الملاحظة أن Fitness Iraq <strong>غير مسؤولة</strong> عن أي مدفوعات تتم من قبل المتدربين داخل تطبيقات الكباتن الخاصة. سياسة الاسترجاع الخاصة بالمتدربين تُحدد بواسطة الكابتن نفسه حصراً.</p>
            </div>
          </section>
        </div>
      )
    }
  };

  const currentContent = type ? content[type] : null;

  return (
    <AnimatePresence>
      {isOpen && currentContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8" dir="rtl">
          {/* Backdrop with a subtle pulse effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          >
            {/* Animated neon glow behind modal */}
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.5, 0.3] 
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-neon/10 rounded-full blur-[120px] pointer-events-none"
            />
          </motion.div>

          {/* Modal Content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
            className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-zinc-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] group"
          >
            {/* Subtle top border gradient */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10 shrink-0 relative overflow-hidden bg-white/[0.02]">
              {/* Corner glows */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-neon/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-neon/20 to-transparent border border-neon/30 shadow-[0_0_20px_rgba(214,248,84,0.15)]">
                  {currentContent.icon}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  {currentContent.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all relative z-10 group/close"
              >
                <X className="w-5 h-5 group-hover/close:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar relative z-10">
              {currentContent.body}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 shrink-0 bg-white/[0.02] flex justify-end relative z-10">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded-xl bg-neon text-black font-bold hover:bg-[#bce63b] transition-all duration-300 shadow-[0_0_20px_rgba(214,248,84,0.3)] hover:shadow-[0_0_30px_rgba(214,248,84,0.5)] transform hover:-translate-y-0.5"
              >
                حسناً، فهمت
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
