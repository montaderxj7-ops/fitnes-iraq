import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "شروط الاستخدام | Fitness Iraq",
  description: "شروط الاستخدام الخاصة بمنصة Fitness Iraq.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white py-24 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-neon mb-8 transition-colors">
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>
        
        <h1 className="text-4xl font-black mb-8 text-neon">شروط الاستخدام</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. مقدمة</h2>
            <p>
              مرحباً بك في منصة Fitness Iraq. باستخدامك لمنصتنا كمدرب أو كمتدرب، فإنك توافق على الالتزام بالشروط والأحكام الموضحة في هذه الوثيقة. إذا كنت لا توافق على أي من هذه الشروط، يُرجى التوقف عن استخدام المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. الحسابات والالتزامات</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>يجب أن تكون المعلومات التي تقدمها عند التسجيل دقيقة وحديثة.</li>
              <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بحسابك.</li>
              <li>يُمنع استخدام المنصة لأي أغراض غير قانونية أو لتقديم محتوى ضار أو مسيء.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. العلاقة بين المدرب والمتدرب</h2>
            <p>
              المنصة توفر للمدربين أدوات لبناء تطبيقاتهم الخاصة وتقديم خدماتهم التدريبية للجمهور. Fitness Iraq ليست طرفاً في الاتفاق أو الخدمة المُقدمة بين المدرب والمتدرب، ولا نتحمل أي مسؤولية طبية أو قانونية ناتجة عن التمارين أو الأنظمة الغذائية.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. المدفوعات والاشتراكات</h2>
            <p>
              الاشتراكات السنوية والشهرية تُدفع مقدماً وتخضع لسياسة الاسترجاع الخاصة بنا. نحتفظ بالحق في تعديل الأسعار مستقبلاً مع إشعار مسبق لجميع المشتركين النشطين.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. إخلاء المسؤولية</h2>
            <p>
              يتم تقديم الخدمات في منصتنا "كما هي". نحن لا نضمن عدم تعطل الخدمات في أوقات التحديث والصيانة، ولكننا نلتزم بتقديم أفضل مستوى ممكن من الاستقرار والأمان للحفاظ على سير عملك.
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
