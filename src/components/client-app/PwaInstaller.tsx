"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share, PlusSquare, Smartphone, CheckCircle2 } from "lucide-react";

export function PwaInstaller({
  coachName,
  coachLogo,
  primaryColor,
  coachSlug
}: {
  coachName?: string;
  coachLogo?: string | null;
  primaryColor?: string;
  coachSlug: string;
}) {
  const searchParams = useSearchParams();
  const shouldInstall = searchParams.get('install') === 'true';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showOverlay, setShowOverlay] = useState(shouldInstall);
  const [isIOS, setIsIOS] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // 1. Register Service Worker with isolated scope per coach
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: `/${coachSlug}` })
        .then(reg => console.log(`SW registered for scope: ${reg.scope}`))
        .catch(err => console.error('SW failed', err));
    }

    // 2. Listen for beforeinstallprompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setInstallSuccess(true);
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Just keep showing the iOS instructions
    } else {
      // Fallback if prompt isn't ready
      alert("إذا كان التطبيق مثبتاً بالفعل على جهازك، لا يمكنك تثبيته مرة أخرى. قم بفتحه من الشاشة الرئيسية! أو يرجى المحاولة من قائمة المتصفح.");
    }
  };

  if (!showOverlay) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ 
            background: `radial-gradient(circle at center, ${primaryColor || '#D6F854'} 0%, transparent 70%)` 
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative z-10 w-full max-w-sm flex flex-col items-center"
        >
          {coachLogo ? (
            <img src={coachLogo} alt={coachName} className="w-32 h-32 rounded-3xl mb-6 shadow-2xl object-cover border border-white/10" />
          ) : (
            <div className="w-32 h-32 rounded-3xl mb-6 flex items-center justify-center bg-white/5 border border-white/10">
              <Smartphone className="w-16 h-16 text-gray-400" />
            </div>
          )}

          <h1 className="text-3xl font-black text-white mb-2">{coachName}</h1>
          <p className="text-gray-400 mb-10 text-sm">
            جاري تجهيز التطبيق الخاص بك...
          </p>

          {isIOS ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full mb-8 backdrop-blur-md">
              <h3 className="font-bold text-white mb-4 text-lg">لتثبيت التطبيق على آيفون:</h3>
              <div className="flex flex-col gap-4 text-right">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                    <Share className="w-5 h-5" />
                  </div>
                  <p>1. اضغط على زر <span className="font-bold text-white">المشاركة</span> بالأسفل</p>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="bg-white/10 p-2 rounded-lg text-white">
                    <PlusSquare className="w-5 h-5" />
                  </div>
                  <p>2. اختر <span className="font-bold text-white">Add to Home Screen</span></p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <button
                onClick={handleInstallClick}
                className="w-full py-4 rounded-2xl text-[#1a1f1a] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(214,248,84,0.3)] flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor || '#D6F854' }}
              >
                <Download className="w-6 h-6" />
                تأكيد التحميل 📥
              </button>
              
              {!deferredPrompt && (
                <p className="text-xs text-gray-500 mt-2">
                  (جاري تجهيز التحميل... انتظر لحظة من فضلك)
                </p>
              )}
            </div>
          )}

          {installSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 z-50 bg-[#050505] flex flex-col items-center justify-center rounded-3xl"
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">تم التحميل بنجاح! 🎉</h3>
              <p className="text-gray-400 text-sm px-6">
                يمكنك الآن إغلاق هذه الصفحة وفتح التطبيق مباشرة من شاشة هاتفك الرئيسية.
              </p>
            </motion.div>
          )}

          {!installSuccess && (
            <button 
              onClick={() => setShowOverlay(false)}
              className="mt-8 text-sm text-gray-500 underline hover:text-white transition-colors"
            >
              تخطي وفتح عبر المتصفح
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
