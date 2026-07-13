import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "سياسة الاسترجاع | Fitness Iraq",
  description: "سياسة الاسترجاع الخاصة بمنصة Fitness Iraq.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-black text-white py-24 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-neon mb-8 transition-colors">
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>
        
        <h1 className="text-4xl font-black mb-8 text-neon">سياسة الاسترجاع</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. سياسة عامة</h2>
            <p>
              نحن في Fitness Iraq نسعى لتقديم أفضل تجربة ممكنة. إذا لم تكن راضياً عن خدمتنا، يُرجى الاطلاع على شروط الاسترجاع أدناه.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. فترة التجربة وإلغاء الاشتراك</h2>
            <p>
              إذا قمت بالاشتراك في أي من الباقات المدفوعة ولم تكن مقتنعاً بالخدمة، يحق لك طلب استرداد المبلغ كاملاً خلال <strong>أول 7 أيام</strong> من تاريخ الدفع الأولي.
            </p>
            <p className="mt-2">
              بعد انقضاء السبعة أيام الأولى، لا يمكننا إصدار أي استرداد مالي للمدفوعات الشهرية أو السنوية المستقطعة. ولكن يمكنك إلغاء التجديد التلقائي في أي وقت من إعدادات حسابك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. خطوات طلب الاسترجاع</h2>
            <p>
              لطلب الاسترجاع ضمن فترة الـ 7 أيام، يرجى مراسلة فريق الدعم الفني على البريد الإلكتروني المذكور في أسفل الموقع، مع تزويدنا برقم الحساب أو البريد الإلكتروني المسجل.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. المدفوعات داخل تطبيقات الكباتن</h2>
            <p>
              يُرجى الملاحظة أن Fitness Iraq <strong>غير مسؤولة</strong> عن أي مدفوعات تتم من قبل المتدربين داخل تطبيقات الكباتن الخاصة (أو عبر التحويل المباشر للكابتن). سياسة الاسترجاع الخاصة بالمتدربين تُحدد بواسطة الكابتن نفسه حصراً.
            </p>
          </section>

          <div className="pt-8 border-t border-white/10 mt-12 text-sm text-gray-500">
            تاريخ آخر تحديث: 11 يوليو 2026
          </div>
        </div>
      </div>
    </div>
  );
}
