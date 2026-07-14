"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Save, Lock, Mail, KeyRound, Wallet, Smartphone, Image as ImageIcon, Upload, CreditCard } from "lucide-react";
import { getSettings, updateSettings, getPaymentMethods, updatePaymentMethodsBulk } from "@/actions/settings";
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

  const [payments, setPayments] = useState<{
    zainCash: boolean; zainCashNumber: string; zainCashName: string;
    fib: boolean; fibAccount: string; fibName: string;
    asiaHawala: boolean; asiaHawalaNumber: string; asiaHawalaName: string;
    masterCard: boolean; masterCardNumber: string; masterCardName: string;
    visaCard: boolean; visaCardNumber: string; visaCardName: string;
    card: boolean; cardLink: string;
  }>({
    zainCash: false, zainCashNumber: "", zainCashName: "",
    fib: false, fibAccount: "", fibName: "",
    asiaHawala: false, asiaHawalaNumber: "", asiaHawalaName: "",
    masterCard: false, masterCardNumber: "", masterCardName: "",
    visaCard: false, visaCardNumber: "", visaCardName: "",
    card: false, cardLink: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 512;
          canvas.height = 512;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Fill background with transparent or black/white depending on preference.
            // WebAPK prefers non-transparent for some icons, but transparent is safer for general use.
            // Let's use transparent.
            ctx.clearRect(0, 0, 512, 512);

            // Calculate scaling to fit image inside 512x512 while preserving aspect ratio
            const scale = Math.min(512 / img.width, 512 / img.height);
            const x = (512 / 2) - (img.width / 2) * scale;
            const y = (512 / 2) - (img.height / 2) * scale;
            
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            const dataUrl = canvas.toDataURL('image/png');
            setSettings({ ...settings, appLogo: dataUrl });
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };  useEffect(() => {
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

      const pmRes = await getPaymentMethods();
      if (pmRes.success && pmRes.methods) {
        const pm = pmRes.methods as any[];
        const pState = { ...payments };
        pm.forEach(m => {
          if (m.name.includes('ZainCash')) { pState.zainCash = true; pState.zainCashNumber = m.details.split(' - ')[0]; pState.zainCashName = m.details.split(' - ')[1] || ""; }
          if (m.name.includes('FIB')) { pState.fib = true; pState.fibAccount = m.details.split(' - ')[0]; pState.fibName = m.details.split(' - ')[1] || ""; }
          if (m.name.includes('AsiaHawala')) { pState.asiaHawala = true; pState.asiaHawalaNumber = m.details.split(' - ')[0]; pState.asiaHawalaName = m.details.split(' - ')[1] || ""; }
          if (m.name.includes('MasterCard')) { pState.masterCard = true; pState.masterCardNumber = m.details.split(' - ')[0]; pState.masterCardName = m.details.split(' - ')[1] || ""; }
          if (m.name.includes('Visa')) { pState.visaCard = true; pState.visaCardNumber = m.details.split(' - ')[0]; pState.visaCardName = m.details.split(' - ')[1] || ""; }
          if (m.name.includes('Card') && !m.name.includes('MasterCard') && !m.name.includes('Visa')) { pState.card = true; pState.cardLink = m.details; }
        });
        setPayments(pState);
      }

      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSaveAppInfo = async () => {
    setSaving(true);
    // 1. Update Settings (App Name, Logo, Color, etc)
    const res = await updateSettings(settings);
    
    // 2. Update Payment Methods
    const pmRes = await updatePaymentMethodsBulk(payments);
    
    if (res.success && pmRes.success) {
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

        {/* App Identity Settings */}
        <motion.div variants={itemVariants} className="bg-[#111] border border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
            <div className="p-3 bg-white/5 rounded-2xl">
              <Smartphone className="w-6 h-6 text-[#82c91e]" />
            </div>
            <h2 className="text-2xl font-bold text-white">هوية التطبيق</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-300">اسم التطبيق</label>
              <input 
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({...settings, appName: e.target.value})}
                placeholder="أدخل اسم التطبيق"
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#82c91e]/50 transition-all text-right"
              />
              <p className="text-xs text-gray-500">سيظهر هذا الاسم تحت أيقونة التطبيق في شاشة هاتف المتدرب.</p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-300">أيقونة التطبيق</label>
              <div className="flex items-center gap-4">
                {settings.appLogo ? (
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden group border border-white/10">
                    <img src={settings.appLogo} alt="App Icon" className="w-full h-full object-cover" />
                    <div 
                      className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center hover:border-[#82c91e]/50 hover:bg-[#82c91e]/5 cursor-pointer transition-all"
                  >
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm text-[#82c91e] font-bold hover:underline"
                  >
                    تغيير الأيقونة
                  </button>
                  <p className="text-xs text-gray-500 mt-1">يُفضل أن تكون صورة مربعة.</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-300">اللون الأساسي للتطبيق</label>
              <div className="flex items-center gap-3">
                <input 
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                  className="w-12 h-12 rounded-xl cursor-pointer bg-black/50 border border-white/10"
                />
                <div className="text-xs text-gray-500">لون الأزرار والتفاصيل في تطبيقك.</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Gateways Settings */}
        <motion.div variants={itemVariants} className="bg-[#111] border border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
            <div className="p-3 bg-white/5 rounded-2xl">
              <Wallet className="w-6 h-6 text-[#82c91e]" />
            </div>
            <h2 className="text-2xl font-bold text-white">بوابات الدفع</h2>
          </div>
          
          <div className="space-y-4">
            {/* Zain Cash */}
            <div className={`bg-white/5 border rounded-2xl p-4 transition-colors focus-within:border-[#82c91e]/50 ${payments.zainCash ? 'border-[#82c91e]/30' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5">
                    <img src="https://www.google.com/s2/favicons?sz=64&domain_url=zaincash.iq" alt="Zain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">زين كاش</h4>
                    <p className="text-xs text-gray-500">استقبال عبر المحفظة</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={payments.zainCash} onChange={(e) => setPayments({ ...payments, zainCash: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#82c91e]"></div>
                </label>
              </div>
              {payments.zainCash && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 flex flex-col gap-3 border-t border-white/5">
                  <input type="text" placeholder="رقم المحفظة (مثال: 078XXXXXXX)" value={payments.zainCashNumber} onChange={(e) => setPayments({ ...payments, zainCashNumber: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#82c91e] transition-colors text-right" />
                  <input type="text" placeholder="الاسم الكامل المسجل في المحفظة" value={payments.zainCashName} onChange={(e) => setPayments({ ...payments, zainCashName: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#82c91e] transition-colors text-right" />
                </motion.div>
              )}
            </div>

            {/* FIB */}
            <div className={`bg-white/5 border rounded-2xl p-4 transition-colors focus-within:border-[#82c91e]/50 ${payments.fib ? 'border-[#82c91e]/30' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5">
                    <img src="https://www.google.com/s2/favicons?sz=64&domain_url=fib.iq" alt="FIB" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">البنوك الرقمية (FIB)</h4>
                    <p className="text-xs text-gray-500">حساب بنكي</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={payments.fib} onChange={(e) => setPayments({ ...payments, fib: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#82c91e]"></div>
                </label>
              </div>
              {payments.fib && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 flex flex-col gap-3 border-t border-white/5">
                  <input type="text" placeholder="رقم الحساب (IBAN)" value={payments.fibAccount} onChange={(e) => setPayments({ ...payments, fibAccount: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#82c91e] transition-colors text-right" />
                  <input type="text" placeholder="الاسم المطابق للحساب البنكي" value={payments.fibName} onChange={(e) => setPayments({ ...payments, fibName: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#82c91e] transition-colors text-right" />
                </motion.div>
              )}
            </div>

            {/* Asia Hawala */}
            <div className={`bg-white/5 border rounded-2xl p-4 transition-colors focus-within:border-[#82c91e]/50 ${payments.asiaHawala ? 'border-[#82c91e]/30' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5">
                    <img src="https://www.google.com/s2/favicons?sz=64&domain_url=asiacell.com" alt="Asia Hawala" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">آسيا حوالة</h4>
                    <p className="text-xs text-gray-500">استقبال عبر المحفظة</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={payments.asiaHawala} onChange={(e) => setPayments({ ...payments, asiaHawala: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#82c91e]"></div>
                </label>
              </div>
              {payments.asiaHawala && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 flex flex-col gap-3 border-t border-white/5">
                  <input type="text" placeholder="رقم المحفظة (مثال: 077XXXXXXX)" value={payments.asiaHawalaNumber} onChange={(e) => setPayments({ ...payments, asiaHawalaNumber: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#82c91e] transition-colors text-right" />
                  <input type="text" placeholder="الاسم الكامل المسجل في المحفظة" value={payments.asiaHawalaName} onChange={(e) => setPayments({ ...payments, asiaHawalaName: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#82c91e] transition-colors text-right" />
                </motion.div>
              )}
            </div>

            {/* MasterCard */}
            <div className={`bg-white/5 border rounded-2xl p-4 transition-colors focus-within:border-[#82c91e]/50 ${payments.masterCard ? 'border-[#82c91e]/30' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 border border-white/10">
                    <img src="https://www.google.com/s2/favicons?sz=64&domain_url=mastercard.com" alt="MasterCard" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">ماستر كارد (MasterCard)</h4>
                    <p className="text-xs text-gray-500">بوابة دفع البطاقات</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={payments.masterCard} onChange={(e) => setPayments({ ...payments, masterCard: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#82c91e]"></div>
                </label>
              </div>
              {payments.masterCard && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 flex flex-col gap-3 border-t border-white/5">
                  <input type="text" placeholder="رابط بوابة الدفع أو رقم البطاقة" value={payments.masterCardNumber} onChange={(e) => setPayments({ ...payments, masterCardNumber: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#82c91e] transition-colors text-right" />
                  <input type="text" placeholder="الاسم المطبوع على البطاقة" value={payments.masterCardName} onChange={(e) => setPayments({ ...payments, masterCardName: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#82c91e] transition-colors text-right" />
                </motion.div>
              )}
            </div>

            {/* Visa Card */}
            <div className={`bg-white/5 border rounded-2xl p-4 transition-colors focus-within:border-[#82c91e]/50 ${payments.visaCard ? 'border-[#82c91e]/30' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 border border-white/10">
                    <img src="https://www.google.com/s2/favicons?sz=64&domain_url=visa.com" alt="Visa" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">فيزا كارد (Visa)</h4>
                    <p className="text-xs text-gray-500">بوابة دفع البطاقات</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={payments.visaCard} onChange={(e) => setPayments({ ...payments, visaCard: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#82c91e]"></div>
                </label>
              </div>
              {payments.visaCard && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 flex flex-col gap-3 border-t border-white/5">
                  <input type="text" placeholder="رابط بوابة الدفع أو رقم البطاقة" value={payments.visaCardNumber} onChange={(e) => setPayments({ ...payments, visaCardNumber: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#82c91e] transition-colors text-right" />
                  <input type="text" placeholder="الاسم المطبوع على البطاقة" value={payments.visaCardName} onChange={(e) => setPayments({ ...payments, visaCardName: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#82c91e] transition-colors text-right" />
                </motion.div>
              )}
            </div>

            {/* Card Payment (Custom) */}
            <div className={`bg-white/5 border rounded-2xl p-4 transition-colors focus-within:border-[#82c91e]/50 ${payments.card ? 'border-[#82c91e]/30' : 'border-white/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">رابط دفع إلكتروني (بطاقة)</h4>
                    <p className="text-xs text-gray-500">دفع عبر Stripe أو بوابات أخرى</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={payments.card} onChange={(e) => setPayments({ ...payments, card: e.target.checked })} className="sr-only peer" />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#82c91e]"></div>
                </label>
              </div>
              {payments.card && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-3 flex flex-col gap-3 border-t border-white/5">
                  <input 
                    type="url" placeholder="ضع رابط الدفع هنا (مثال: رابط Stripe أو غيره)" 
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-[#82c91e]/50 transition-all text-left" dir="ltr"
                    value={payments.cardLink} onChange={(e) => setPayments({...payments, cardLink: e.target.value})}
                  />
                </motion.div>
              )}
            </div>
            
          </div>
        </motion.div>

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
