"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Save, Lock, Mail, KeyRound } from "lucide-react";
import { getSettings, updateSettings } from "@/actions/settings";
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    coachName: "كابتن برو",
    coachAvatar: "",
    appName: "Gym System",
    appLogo: "",
    primaryColor: "#D6F854",
    bio: "",
    welcomeImage: "",
    dashboardLoginEnabled: false,
    dashboardEmail: "",
    dashboardPassword: "",
    subscriptionTier: "pro"
  });




  useEffect(() => {
    async function fetchSettings() {
      const res = await getSettings();
      if (res.success && res.settings) {
        const s = res.settings as any;
        setSettings({
          coachName: s.name || "",
          coachAvatar: s.image || "",
          appName: s.appName || "",
          appLogo: s.logo || "",
          primaryColor: s.primaryColor || "#D6F854",
          bio: s.bio || "",
          welcomeImage: s.welcomeImage || "",
          dashboardLoginEnabled: s.dashboardLoginEnabled ?? false,
          dashboardEmail: s.dashboardEmail || "",
          dashboardPassword: s.dashboardPassword || "",
          subscriptionTier: s.subscriptionTier || "pro"
        });
      }

      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSaveAppInfo = async () => {
    setSaving(true);
    const res = await updateSettings(settings);
    if (res.success) {
      toast.success("تم حفظ الإعدادات بنجاح");
    } else {
      toast.error("حدث خطأ أثناء الحفظ");
    }
    setSaving(false);
  };





  if (loading) return <div className="text-white text-center py-20">جاري التحميل...</div>;
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 max-w-4xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">الإعدادات وإدارة التطبيق</h1>
          <p className="text-gray-400">تعديل إعدادات الأمان الخاصة بلوحة التحكم.</p>
        </div>
        <button 
          onClick={handleSaveAppInfo}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#82c91e] text-black font-black hover:bg-[#94d82d] transition-all shadow-[0_0_20px_rgba(130,201,30,0.2)] disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>

      <div className="space-y-6">

        {/* Security Settings */}
        <motion.div variants={itemVariants} className="bg-[#111] border border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-6 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/5 rounded-2xl">
                <Lock className="w-6 h-6 text-[#82c91e]" />
              </div>
              <h2 className="text-2xl font-bold text-white">أمان لوحة التحكم</h2>
            </div>
            <div 
              onClick={() => setSettings({...settings, dashboardLoginEnabled: !settings.dashboardLoginEnabled})}
              className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors ${settings.dashboardLoginEnabled ? 'bg-[#82c91e]' : 'bg-white/10'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${settings.dashboardLoginEnabled ? 'translate-x-0' : '-translate-x-7'}`} />
            </div>
          </div>
          
          <AnimatePresence>
            {settings.dashboardLoginEnabled && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2"
              >
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    البريد الإلكتروني لتسجيل الدخول
                  </label>
                  <input 
                    type="email"
                    value={settings.dashboardEmail}
                    onChange={(e) => setSettings({...settings, dashboardEmail: e.target.value})}
                    placeholder="coach@example.com"
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#82c91e]/50 transition-all text-left"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-gray-400" />
                    كلمة المرور
                  </label>
                  <input 
                    type="password"
                    value={settings.dashboardPassword}
                    onChange={(e) => setSettings({...settings, dashboardPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#82c91e]/50 transition-all text-left"
                    dir="ltr"
                  />
                </div>
                <div className="col-span-full">
                  <p className="text-xs text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                    تنبيه: سيطلب منك النظام تسجيل الدخول في المرة القادمة التي تفتح فيها لوحة التحكم باستخدام هذه البيانات.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>


      </div>
    </motion.div>
  );
}
