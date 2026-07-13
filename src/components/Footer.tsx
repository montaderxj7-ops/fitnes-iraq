"use client";

import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import LegalModal from "./LegalModal";

export default function Footer() {
  const [legalModalState, setLegalModalState] = useState<{isOpen: boolean, type: "terms"|"privacy"|"refund"|null}>({
    isOpen: false,
    type: null
  });

  const openLegal = (type: "terms"|"privacy"|"refund", e: React.MouseEvent) => {
    e.preventDefault();
    setLegalModalState({ isOpen: true, type });
  };

  return (
    <>
      <LegalModal 
        isOpen={legalModalState.isOpen} 
        type={legalModalState.type} 
        onClose={() => setLegalModalState(prev => ({...prev, isOpen: false}))} 
      />
      <footer className="bg-black/40 backdrop-blur-xl border-t border-white/5 pt-16 pb-8 relative z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">
              Fitness <span className="text-neon">Iraq</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              المنصة الأولى في العراق التي تمكن المدربين من بناء تطبيقاتهم الخاصة وإدارة المتدربين باحترافية، مع توفير خيارات دفع محلية.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              <li><a href="/#about" className="text-gray-400 hover:text-neon transition-colors">عن المنصة</a></li>
              <li><a href="/#pricing" className="text-gray-400 hover:text-neon transition-colors">سجل كمدرب</a></li>
              <li><a href="/#coaches" className="text-gray-400 hover:text-neon transition-colors">ابحث عن كابتن</a></li>
              <li><a href="/#pricing" className="text-gray-400 hover:text-neon transition-colors">الأسعار والباقات</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">قانوني</h4>
            <ul className="space-y-3">
              <li><button onClick={(e) => openLegal("terms", e)} className="text-gray-400 hover:text-neon transition-colors">شروط الاستخدام</button></li>
              <li><button onClick={(e) => openLegal("privacy", e)} className="text-gray-400 hover:text-neon transition-colors">سياسة الخصوصية</button></li>
              <li><button onClick={(e) => openLegal("refund", e)} className="text-gray-400 hover:text-neon transition-colors">سياسة الاسترجاع</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-neon" />
                support@fitnessiraq.com
              </li>
              <li className="text-gray-400 text-sm mt-4">
                فريق الدعم متاح على مدار الساعة لمساعدتك في أي استفسار.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Fitness Iraq. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
    </>
  );
}
