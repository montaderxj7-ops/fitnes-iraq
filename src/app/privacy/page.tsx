import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "سياسة الخصوصية | Fitness Iraq",
  description: "سياسة الخصوصية الخاصة بمنصة Fitness Iraq.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white py-24 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-neon mb-8 transition-colors">
          <ArrowRight className="w-4 h-4" />
          العودة للرئيسية
        </Link>
        
        <h1 className="text-4xl font-black mb-8 text-neon">سياسة الخصوصية</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed text-lg">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. حماية بياناتك</h2>
            <p>
              نحن في Fitness Iraq نأخذ خصوصيتك على محمل الجد. نلتزم بحماية بياناتك الشخصية وبيانات متدربيك باستخدام أحدث بروتوكولات التشفير والأمان.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. ما هي البيانات التي نجمعها؟</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>المعلومات الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف).</li>
              <li>بيانات الدفع (تُعالج بأمان عبر شركائنا الماليين ولا نقوم بتخزين تفاصيل البطاقات).</li>
              <li>البيانات التي تُدخلها في التطبيق مثل الجداول وبرامج التدريب وصور التطور.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. كيف نستخدم هذه البيانات؟</h2>
            <p>
              تُستخدم البيانات بشكل أساسي لتوفير خدماتنا لك وتمكين عمل تطبيقك بسلاسة. لا نقوم ببيع أو مشاركة بياناتك الشخصية مع أطراف ثالثة لأغراض تسويقية. يتم استخدامها فقط لتحسين النظام وللتواصل معك بخصوص التحديثات الهامة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. حقوقك</h2>
            <p>
              لديك الحق الكامل في الوصول إلى بياناتك أو طلب تعديلها أو مسحها نهائياً من خوادمنا. يمكنك طلب ذلك من خلال التواصل مع الدعم الفني.
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
