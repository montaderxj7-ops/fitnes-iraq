"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dispatch, SetStateAction, useRef, useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { BuilderState, MockupView } from "@/app/builder/page";
import { Upload, ImageIcon, CheckCircle2, PaintBucket, LayoutTemplate, CreditCard, ChevronRight, ChevronLeft, Image as LucideImage, UploadCloud, Check, Palette, Sun, Moon, Smartphone, Package, MessageCircle, ChevronDown, ListChecks, Plus, Trash2, Edit2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeftPanelProps {
  state: BuilderState;
  setState: Dispatch<SetStateAction<BuilderState>>;
  currentStep: number;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  setMockupView: Dispatch<SetStateAction<MockupView>>;
  onPublish: () => void;
}

const STEPS = [
  { id: 1, title: "الهوية البصرية", icon: LayoutTemplate, mockupView: "packages" as MockupView },
  { id: 2, title: "المظهر والألوان", icon: PaintBucket, mockupView: "packages" as MockupView },
  { id: 3, title: "الباقة الأولى", icon: CheckCircle2, mockupView: "packages" as MockupView },
  { id: 4, title: "إعدادات الدفع", icon: CreditCard, mockupView: "packages" as MockupView },
  { id: 5, title: "الاستبيان", icon: ListChecks, mockupView: "packages" as MockupView },
  { id: 6, title: "الرئيسية", icon: Smartphone, mockupView: "packages" as MockupView },
];

const PRESET_COLORS = [
  "#D6F854", // Neon Green
  "#FF3366", // Neon Pink
  "#00F0FF", // Neon Blue
  "#7B61FF", // Purple
  "#FF9900", // Orange
  "#00FF88", // Mint
];

export default function LeftPanel({ state, setState, currentStep, setCurrentStep, setMockupView, onPublish, isPublishing, publishSuccess }: LeftPanelProps) {
  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isChatDaysOpen, setIsChatDaysOpen] = useState(false);
  const [isChatHoursOpen, setIsChatHoursOpen] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const chatDaysRef = useRef<HTMLDivElement>(null);
  const chatHoursRef = useRef<HTMLDivElement>(null);
  const dashboardImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (chatDaysRef.current && !chatDaysRef.current.contains(event.target as Node)) {
        setIsChatDaysOpen(false);
      }
      if (chatHoursRef.current && !chatHoursRef.current.contains(event.target as Node)) {
        setIsChatHoursOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      setMockupView(STEPS[currentStep].mockupView);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setMockupView(STEPS[currentStep - 2].mockupView);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'appIcon' | 'appLogo' | 'welcomeImage' | 'dashboardHeroImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState({ ...state, [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Determine if publish can be enabled
  const canPublish = currentStep === 6 && state.appName.length > 2 && state.appLogo;

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Header & Stepper */}
      <div className="p-8 border-b border-white/5 sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-xl z-20">
        <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
          <span className="text-neon">بناء</span> التطبيق
        </h1>
        
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-10" />
          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 bg-[#0a0a0a] px-2">
                <button
                  onClick={() => {
                    setCurrentStep(step.id);
                    setMockupView(step.mockupView);
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    isActive ? "bg-neon text-black border-neon shadow-[0_0_15px_rgba(214,248,84,0.4)] scale-110" : 
                    isCompleted ? "bg-white/10 text-white border-white/20 hover:border-white/40" : 
                    "bg-[#111] text-gray-500 border-white/5"
                  )}
                >
                  <step.icon className="w-4 h-4" />
                </button>
                <span className={cn(
                  "text-[10px] font-bold transition-colors",
                  isActive ? "text-white" : isCompleted ? "text-gray-400" : "text-gray-600"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* STEP 1: Identity */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">الهوية البصرية</h2>
                  <p className="text-gray-400 text-sm mb-6">دعنا نختار اسماً وشعاراً لتطبيقك الخاص.</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-300">اسم التطبيق</label>
                  <input 
                    type="text" 
                    value={state.appName}
                    onChange={(e) => setState({ ...state, appName: e.target.value })}
                    placeholder="مثال: Coach Ali Fit"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon transition-colors"
                  />
                </div>

                <div className="space-y-4 mt-4">
                  <label className="block text-sm font-bold text-gray-300">رسالة الترحيب (النبذة)</label>
                  <textarea 
                    value={state.welcomeMessage}
                    onChange={(e) => setState({ ...state, welcomeMessage: e.target.value })}
                    placeholder="مثال: مرحباً بك في فريقي! أنا هنا لأساعدك في الوصول إلى هدفك وتغيير حياتك للأفضل..."
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-300">أيقونة التطبيق</label>
                    <div className="relative group cursor-pointer bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-dashed border-white/20 hover:border-neon rounded-2xl aspect-square flex flex-col items-center justify-center overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(214,248,84,0.15)] hover:-translate-y-1">
                      <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'appIcon')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {state.appIcon ? (
                        <motion.img 
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} 
                          src={state.appIcon} alt="Icon" className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="flex flex-col items-center z-0">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:bg-neon/10 group-hover:border-neon/30 transition-all duration-300 shadow-inner"
                          >
                            <UploadCloud className="w-6 h-6 text-gray-400 group-hover:text-neon transition-colors" />
                          </motion.div>
                          <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors mb-1">رفع الأيقونة</span>
                          <span className="text-[10px] text-gray-500 font-medium">PNG, JPG (Max 2MB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-300">الشعار الداخلي</label>
                    <div className="relative group cursor-pointer bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-dashed border-white/20 hover:border-neon rounded-2xl aspect-square flex flex-col items-center justify-center overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(214,248,84,0.15)] hover:-translate-y-1">
                      <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'appLogo')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                      {state.appLogo ? (
                        <motion.img 
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} 
                          src={state.appLogo} alt="Logo" className="w-2/3 object-contain" 
                        />
                      ) : (
                        <div className="flex flex-col items-center z-0">
                          <motion.div 
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:bg-neon/10 group-hover:border-neon/30 transition-all duration-300 shadow-inner"
                          >
                            <LucideImage className="w-6 h-6 text-gray-400 group-hover:text-neon transition-colors" />
                          </motion.div>
                          <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors mb-1">رفع الشعار</span>
                          <span className="text-[10px] text-gray-500 font-medium">شعار أفقي وشفاف</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-6">
                  <label className="block text-sm font-bold text-gray-300">صورة الواجهة (شاشة الترحيب)</label>
                  <div className="relative group cursor-pointer bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-dashed border-white/20 hover:border-neon rounded-2xl h-40 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 hover:shadow-[0_0_30px_rgba(214,248,84,0.15)] hover:-translate-y-1">
                    <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'welcomeImage')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    {state.welcomeImage ? (
                      <motion.img 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
                        src={state.welcomeImage} alt="Welcome" className="w-full h-full object-cover opacity-60" 
                      />
                    ) : (
                      <div className="flex flex-col items-center z-0">
                        <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:bg-neon/10 group-hover:border-neon/30 transition-all duration-300 shadow-inner"
                        >
                          <LucideImage className="w-6 h-6 text-gray-400 group-hover:text-neon transition-colors" />
                        </motion.div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors mb-1">رفع صورة الكابتن (الواجهة)</span>
                        <span className="text-[10px] text-gray-500 font-medium">صورة عمودية بجودة عالية</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Theme */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">المظهر والألوان</h2>
                  <p className="text-gray-400 text-sm mb-6">اختر اللون الرئيسي الذي يعبر عن علامتك التجارية.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-gray-300">اللون الرئيسي</label>
                    <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-md text-gray-400 border border-white/5">
                      {state.primaryColor.toUpperCase()}
                    </span>
                  </div>
                  
                  <div 
                    className="relative z-50 p-6 rounded-[28px] border border-white/5 transition-colors duration-700 shadow-inner"
                    style={{ backgroundColor: 'rgba(20, 20, 20, 0.6)' }}
                  >
                    {/* Dynamic Ambient Glow bounded by its own overflow-hidden container */}
                    <div className="absolute inset-0 overflow-hidden rounded-[28px] pointer-events-none">
                      <div 
                        className="absolute inset-0 opacity-10 blur-[80px] transition-colors duration-1000"
                        style={{ backgroundColor: state.primaryColor }}
                      />
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between gap-4">
                      {/* Presets Container */}
                      <div className="flex-1 flex gap-2 items-center bg-black/40 p-2 rounded-[20px] border border-white/5 backdrop-blur-2xl overflow-x-auto hide-scrollbar">
                        {PRESET_COLORS.map(color => {
                          const isSelected = state.primaryColor === color;
                          return (
                            <button
                              key={color}
                              onClick={() => setState({ ...state, primaryColor: color })}
                              className="relative w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center group outline-none"
                            >
                              {/* The Color Circle */}
                              <div 
                                className="absolute inset-[4px] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] z-10 transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
                                style={{ backgroundColor: color }}
                              />
                              
                              {/* Gliding Active Ring using layoutId */}
                              {isSelected && (
                                <motion.div
                                  layoutId="active-color-ring"
                                  className="absolute inset-0 rounded-full border-[2.5px] border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                  initial={false}
                                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                />
                              )}
                              
                              {/* Animated Checkmark */}
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    exit={{ scale: 0, opacity: 0, rotate: 45 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
                                    className="z-20 mix-blend-exclusion drop-shadow-md"
                                  >
                                    <Check className="w-5 h-5 text-white" strokeWidth={3.5} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </button>
                          );
                        })}
                      </div>
                      
                      <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent flex-shrink-0" />

                      {/* Custom Color Picker Button */}
                      <div className="relative group flex-shrink-0" ref={colorPickerRef}>
                        <button 
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="relative w-14 h-14 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 outline-none"
                        >
                          {/* Gliding Active Ring for Custom Color */}
                          {!PRESET_COLORS.includes(state.primaryColor) && (
                            <motion.div
                              layoutId="active-color-ring"
                              className="absolute inset-0 rounded-full border-[2.5px] border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] z-20 pointer-events-none"
                              initial={false}
                              transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                            />
                          )}

                          {!PRESET_COLORS.includes(state.primaryColor) ? (
                            <div 
                              className="absolute inset-[4px] rounded-full z-10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"
                              style={{ backgroundColor: state.primaryColor }}
                            />
                          ) : (
                            <div className="absolute inset-0 rounded-full border border-white/10 bg-[#1a1a1a]" />
                          )}
                          
                          <div className="z-20 flex items-center justify-center w-full h-full">
                            {!PRESET_COLORS.includes(state.primaryColor) ? (
                              <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }} className="mix-blend-exclusion drop-shadow-md"
                              >
                                <Check className="w-5 h-5 text-white" strokeWidth={3.5} />
                              </motion.div>
                            ) : (
                              <div className="absolute inset-[4px] bg-[conic-gradient(from_90deg,red,yellow,green,cyan,blue,magenta,red)] rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity shadow-inner">
                                <Palette className="w-5 h-5 text-white drop-shadow-xl" />
                              </div>
                            )}
                          </div>
                        </button>
                      
                      {/* React Colorful Popover */}
                      <AnimatePresence>
                        {showColorPicker && (
                          <motion.div 
                            initial={{ opacity: 0, y: 15, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 15, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="absolute left-0 top-16 z-50 p-5 bg-[#111]/95 backdrop-blur-2xl border border-white/10 rounded-[28px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] w-[280px]"
                          >
                            <style>{`
                              .custom-color-picker .react-colorful {
                                width: 100%;
                                height: 220px;
                              }
                              .custom-color-picker .react-colorful__pointer {
                                width: 28px;
                                height: 28px;
                                border: 3px solid #fff;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,0,0,0.1);
                                transition: transform 0.1s;
                              }
                              .custom-color-picker .react-colorful__pointer:active {
                                transform: scale(1.1);
                              }
                              .custom-color-picker .react-colorful__hue {
                                height: 20px;
                                border-radius: 10px;
                                margin-top: 16px;
                              }
                              .custom-color-picker .react-colorful__saturation {
                                border-radius: 16px;
                                border-bottom: none;
                              }
                            `}</style>
                            <div className="custom-color-picker">
                              <HexColorPicker 
                                color={state.primaryColor} 
                                onChange={(newColor) => setState({ ...state, primaryColor: newColor })} 
                              />
                            </div>

                            <div className="mt-5 flex items-center gap-3">
                              {/* Color Preview Swatch */}
                              <div 
                                className="w-12 h-12 rounded-[14px] border border-white/10 shadow-inner flex-shrink-0" 
                                style={{ backgroundColor: state.primaryColor }} 
                              />
                              
                              {/* Hex Input */}
                              <div className="flex-1 flex items-center bg-black/50 border border-white/10 rounded-[14px] overflow-hidden px-4 py-3 focus-within:border-neon/50 focus-within:ring-1 focus-within:ring-neon/50 transition-all">
                                <span className="text-gray-500 font-bold mr-1">#</span>
                                <input 
                                  type="text" 
                                  value={state.primaryColor.replace('#', '')}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (/^[0-9A-Fa-f]{0,6}$/.test(val)) {
                                      setState({ ...state, primaryColor: '#' + val });
                                    }
                                  }}
                                  className="w-full bg-transparent text-white font-mono text-base focus:outline-none uppercase tracking-wider"
                                  maxLength={6}
                                />
                              </div>
                            </div>

                            {/* Triangle Arrow */}
                            <div className="absolute -top-2 left-6 w-4 h-4 bg-[#111] border-t border-l border-white/10 transform rotate-45" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            )}
            {/* STEP 4: Payments */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">إعدادات الدفع</h2>
                  <p className="text-gray-400 text-sm mb-6">قم بربط بوابات الدفع لاستقبال أموالك مباشرة.</p>
                </div>

                {/* Zain Cash */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-colors focus-within:border-neon/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5">
                        <img src="https://www.google.com/s2/favicons?sz=64&domain_url=zaincash.iq" alt="Zain" />
                      </div>
                      <div>
                        <h4 className="font-bold">زين كاش</h4>
                        <p className="text-xs text-gray-500">استقبال عبر المحفظة</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={state.payments.zainCash} onChange={(e) => setState({ ...state, payments: { ...state.payments, zainCash: e.target.checked }})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon"></div>
                    </label>
                  </div>
                  {state.payments.zainCash && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 flex flex-col gap-3">
                      <input type="text" placeholder="رقم المحفظة (مثال: 078XXXXXXX)" value={state.payments.zainCashNumber} onChange={(e) => setState({ ...state, payments: { ...state.payments, zainCashNumber: e.target.value }})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors" />
                      <input type="text" placeholder="الاسم الكامل المسجل في المحفظة" value={state.payments.zainCashName} onChange={(e) => setState({ ...state, payments: { ...state.payments, zainCashName: e.target.value }})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors" />
                    </motion.div>
                  )}
                </div>

                {/* FIB */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-colors focus-within:border-neon/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5">
                        <img src="https://www.google.com/s2/favicons?sz=64&domain_url=fib.iq" alt="FIB" />
                      </div>
                      <div>
                        <h4 className="font-bold">البنوك الرقمية (FIB)</h4>
                        <p className="text-xs text-gray-500">حساب بنكي</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={state.payments.fib} onChange={(e) => setState({ ...state, payments: { ...state.payments, fib: e.target.checked }})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon"></div>
                    </label>
                  </div>
                  {state.payments.fib && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 flex flex-col gap-3">
                      <input type="text" placeholder="رقم الحساب (IBAN)" value={state.payments.fibAccount} onChange={(e) => setState({ ...state, payments: { ...state.payments, fibAccount: e.target.value }})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors" />
                      <input type="text" placeholder="الاسم المطابق للحساب البنكي" value={state.payments.fibName} onChange={(e) => setState({ ...state, payments: { ...state.payments, fibName: e.target.value }})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors" />
                    </motion.div>
                  )}
                </div>

                {/* Asia Hawala */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-colors focus-within:border-neon/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5">
                        <img src="https://www.google.com/s2/favicons?sz=64&domain_url=asiacell.com" alt="Asia Hawala" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold">آسيا حوالة</h4>
                        <p className="text-xs text-gray-500">استقبال عبر المحفظة</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={state.payments.asiaHawala} onChange={(e) => setState({ ...state, payments: { ...state.payments, asiaHawala: e.target.checked }})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon"></div>
                    </label>
                  </div>
                  {state.payments.asiaHawala && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 flex flex-col gap-3">
                      <input type="text" placeholder="رقم المحفظة (مثال: 077XXXXXXX)" value={state.payments.asiaHawalaNumber} onChange={(e) => setState({ ...state, payments: { ...state.payments, asiaHawalaNumber: e.target.value }})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors" />
                      <input type="text" placeholder="الاسم الكامل المسجل في المحفظة" value={state.payments.asiaHawalaName} onChange={(e) => setState({ ...state, payments: { ...state.payments, asiaHawalaName: e.target.value }})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors" />
                    </motion.div>
                  )}
                </div>

                {/* MasterCard */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-colors focus-within:border-neon/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 border border-white/10">
                        <img src="https://www.google.com/s2/favicons?sz=64&domain_url=mastercard.com" alt="MasterCard" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold">ماستر كارد (MasterCard)</h4>
                        <p className="text-xs text-gray-500">بوابة دفع البطاقات</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={state.payments.masterCard} onChange={(e) => setState({ ...state, payments: { ...state.payments, masterCard: e.target.checked }})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon"></div>
                    </label>
                  </div>
                  {state.payments.masterCard && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 flex flex-col gap-3">
                      <input type="text" placeholder="رابط بوابة الدفع أو رقم البطاقة" value={state.payments.masterCardNumber} onChange={(e) => setState({ ...state, payments: { ...state.payments, masterCardNumber: e.target.value }})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors" />
                      <input type="text" placeholder="الاسم المطبوع على البطاقة" value={state.payments.masterCardName} onChange={(e) => setState({ ...state, payments: { ...state.payments, masterCardName: e.target.value }})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors" />
                    </motion.div>
                  )}
                </div>

                {/* Visa Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-colors focus-within:border-neon/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 border border-white/10">
                        <img src="https://www.google.com/s2/favicons?sz=64&domain_url=visa.com" alt="Visa" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-bold">فيزا كارد (Visa)</h4>
                        <p className="text-xs text-gray-500">بوابة دفع البطاقات</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={state.payments.visaCard} onChange={(e) => setState({ ...state, payments: { ...state.payments, visaCard: e.target.checked }})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon"></div>
                    </label>
                  </div>
                  {state.payments.visaCard && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-3 flex flex-col gap-3">
                      <input type="text" placeholder="رابط بوابة الدفع أو رقم البطاقة" value={state.payments.visaCardNumber} onChange={(e) => setState({ ...state, payments: { ...state.payments, visaCardNumber: e.target.value }})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors" />
                      <input type="text" placeholder="الاسم المطبوع على البطاقة" value={state.payments.visaCardName} onChange={(e) => setState({ ...state, payments: { ...state.payments, visaCardName: e.target.value }})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon transition-colors" />
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: First Package */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h2 className="text-2xl font-black mb-2">الباقة الأولى 🏆</h2>
                  <p className="text-gray-400 text-sm">قم بصياغة أول وأهم باقة تدريبية لتكون واجهة متجرك.</p>
                </motion.div>

                <div className="space-y-6 pt-4 border-t border-white/5">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-3 relative group">
                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500 group-focus-within:text-neon transition-colors" />
                      اسم الباقة
                    </label>
                    <p className="text-xs text-gray-500/80 mb-2">الاسم الجذاب الذي سيقرأه المتدرب في الواجهة الرئيسية.</p>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={state.firstPackage.name}
                        onChange={(e) => setState({ ...state, firstPackage: { ...state.firstPackage, name: e.target.value } })}
                        placeholder="مثال: باقة التحول الشامل (3 أشهر)"
                        className="w-full bg-[#111] border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-neon transition-all duration-300 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(214,248,84,0.05)] group-hover:border-white/10"
                      />
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-3 relative group">
                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-500 group-focus-within:text-neon transition-colors" />
                      سعر الباقة (شهرياً)
                    </label>
                    <p className="text-xs text-gray-500/80 mb-2">حدد السعر الشهري لهذه الباقة بالدينار العراقي.</p>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={state.firstPackage.price ? Number(state.firstPackage.price).toLocaleString() : ""}
                        onChange={(e) => setState({ ...state, firstPackage: { ...state.firstPackage, price: e.target.value.replace(/[^0-9]/g, "") } })}
                        placeholder="50,000"
                        className="w-full bg-[#111] border border-white/5 rounded-2xl px-5 py-4 text-white text-xl font-black focus:outline-none focus:border-neon transition-all duration-300 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(214,248,84,0.05)] text-left pl-20 group-hover:border-white/10"
                        dir="ltr"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center transition-colors pointer-events-none">
                        <span className="font-black text-sm tracking-widest bg-white/5 px-3 py-2 rounded-xl text-gray-400 group-focus-within:text-neon group-focus-within:bg-neon/10 transition-colors">IQD</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-4">
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl transition-colors hover:border-white/20">
                      <div>
                        <h4 className="font-bold flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-neon" />
                          تفعيل الدردشة والمتابعة
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">السماح للمتدربين بالتواصل معك عبر التطبيق</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={state.firstPackage.hasChat} onChange={(e) => setState({ ...state, firstPackage: { ...state.firstPackage, hasChat: e.target.checked }})} className="sr-only peer" />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon"></div>
                      </label>
                    </div>

                    <AnimatePresence>
                      {state.firstPackage.hasChat && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: 'auto', opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="grid grid-cols-2 gap-4 overflow-visible"
                        >
                          {/* Days Dropdown */}
                          <div className="space-y-2 relative" ref={chatDaysRef}>
                            <label className="text-xs font-bold text-gray-400">أيام التواصل (أسبوعياً)</label>
                            <button 
                              onClick={() => { setIsChatDaysOpen(!isChatDaysOpen); setIsChatHoursOpen(false); }}
                              className={cn(
                                "w-full bg-[#111] border rounded-xl px-4 py-3 text-white text-sm font-bold flex items-center justify-between transition-all duration-300",
                                isChatDaysOpen ? "border-neon shadow-[0_0_15px_rgba(214,248,84,0.05)] bg-white/5" : "border-white/5 hover:border-white/10"
                              )}
                            >
                              <span>
                                {state.firstPackage.chatDays === "7" ? "طوال الأسبوع (7 أيام)" : 
                                 state.firstPackage.chatDays === "6" ? "6 أيام" : 
                                 state.firstPackage.chatDays === "5" ? "5 أيام" : 
                                 state.firstPackage.chatDays === "4" ? "4 أيام" : 
                                 state.firstPackage.chatDays === "3" ? "3 أيام" : 
                                 state.firstPackage.chatDays === "2" ? "يومين" : "يوم واحد"}
                              </span>
                              <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform duration-300", isChatDaysOpen && "rotate-180 text-neon")} />
                            </button>
                            
                            <AnimatePresence>
                              {isChatDaysOpen && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-1 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                                >
                                  {["7", "6", "5", "4", "3", "2", "1"].map((val) => (
                                    <button
                                      key={val}
                                      onClick={() => { setState({ ...state, firstPackage: { ...state.firstPackage, chatDays: val } }); setIsChatDaysOpen(false); }}
                                      className={cn("w-full text-right px-3 py-2.5 rounded-lg transition-colors font-medium text-xs flex items-center justify-between", state.firstPackage.chatDays === val ? "bg-neon/10 text-neon" : "text-gray-300 hover:bg-white/5 hover:text-white")}
                                    >
                                      {val === "7" ? "طوال الأسبوع (7 أيام)" : val === "2" ? "يومين" : val === "1" ? "يوم واحد" : `${val} أيام`}
                                      {state.firstPackage.chatDays === val && <CheckCircle2 className="w-3 h-3 text-neon" />}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Hours Dropdown */}
                          <div className="space-y-2 relative" ref={chatHoursRef}>
                            <label className="text-xs font-bold text-gray-400">ساعات التواصل (يومياً)</label>
                            <button 
                              onClick={() => { setIsChatHoursOpen(!isChatHoursOpen); setIsChatDaysOpen(false); }}
                              className={cn(
                                "w-full bg-[#111] border rounded-xl px-4 py-3 text-white text-sm font-bold flex items-center justify-between transition-all duration-300",
                                isChatHoursOpen ? "border-neon shadow-[0_0_15px_rgba(214,248,84,0.05)] bg-white/5" : "border-white/5 hover:border-white/10"
                              )}
                            >
                              <span>
                                {state.firstPackage.chatHours === "24" ? "مفتوح (24 ساعة)" : 
                                 state.firstPackage.chatHours === "2" ? "ساعتين" : 
                                 state.firstPackage.chatHours === "1" ? "ساعة واحدة" : `${state.firstPackage.chatHours} ساعات`}
                              </span>
                              <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform duration-300", isChatHoursOpen && "rotate-180 text-neon")} />
                            </button>
                            
                            <AnimatePresence>
                              {isChatHoursOpen && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-1 max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                                >
                                  {["24", "12", "8", "6", "4", "3", "2", "1"].map((val) => (
                                    <button
                                      key={val}
                                      onClick={() => { setState({ ...state, firstPackage: { ...state.firstPackage, chatHours: val } }); setIsChatHoursOpen(false); }}
                                      className={cn("w-full text-right px-3 py-2.5 rounded-lg transition-colors font-medium text-xs flex items-center justify-between", state.firstPackage.chatHours === val ? "bg-neon/10 text-neon" : "text-gray-300 hover:bg-white/5 hover:text-white")}
                                    >
                                      {val === "24" ? "مفتوح (24 ساعة)" : val === "2" ? "ساعتين" : val === "1" ? "ساعة واحدة" : `${val} ساعات`}
                                      {state.firstPackage.chatHours === val && <CheckCircle2 className="w-3 h-3 text-neon" />}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="space-y-3 relative group">
                    <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-gray-500 group-focus-within:text-neon transition-colors" />
                      مزايا الباقة الأساسية
                    </label>
                    <p className="text-xs text-gray-500/80 mb-2">اكتب كل ميزة في سطر جديد (اضغط Enter للسطر الجديد).</p>
                    <div className="relative">
                      <textarea 
                        value={state.firstPackage.features?.join('\n')}
                        onChange={(e) => setState({ ...state, firstPackage: { ...state.firstPackage, features: e.target.value.split('\n') } })}
                        placeholder="جدول تدريب مخصص&#10;نظام غذائي مرن&#10;متابعة يومية"
                        rows={4}
                        className="w-full bg-[#111] border border-white/5 rounded-2xl px-5 py-4 text-white font-bold focus:outline-none focus:border-neon transition-all duration-300 focus:bg-white/5 focus:shadow-[0_0_20px_rgba(214,248,84,0.05)] group-hover:border-white/10 resize-none leading-relaxed"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

            {/* STEP 5: Intake Form (الاستبيان) */}
            {currentStep === 5 && (
              <div className="space-y-6 pb-20">
                <div>
                  <h2 className="text-xl font-bold mb-2">الاستبيان (جمع المعلومات)</h2>
                  <p className="text-gray-400 text-sm mb-6">قم بتخصيص الأسئلة التي تريد طرحها على المتدرب بعد اشتراكه.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-gray-300">الأسئلة الحالية</label>
                    <button 
                      onClick={() => {
                        const newId = 'q_' + Math.random().toString(36).substr(2, 9);
                        setState({
                          ...state,
                          intakeQuestions: [
                            ...state.intakeQuestions,
                            { id: newId, title: 'سؤال جديد', desc: '', type: 'text', placeholder: '' }
                          ]
                        });
                      }}
                      className="flex items-center gap-1 text-xs font-bold text-neon hover:text-white transition-colors bg-neon/10 px-3 py-1.5 rounded-lg"
                    >
                      <Plus className="w-3 h-3" /> إضافة سؤال
                    </button>
                  </div>

                  <div className="space-y-3">
                    {state.intakeQuestions.map((q, index) => (
                      <div key={q.id} className="bg-[#111] border border-white/5 rounded-xl p-4 relative group transition-all hover:border-white/10">
                        {/* Delete Button */}
                        <button 
                          onClick={() => {
                            setState({
                              ...state,
                              intakeQuestions: state.intakeQuestions.filter(question => question.id !== q.id)
                            });
                          }}
                          className="absolute top-4 left-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-3 pr-8">
                            <div>
                              <label className="text-xs text-gray-400 font-bold mb-1 block">عنوان السؤال</label>
                              <input 
                                type="text"
                                value={q.title}
                                onChange={(e) => {
                                  const newQuestions = [...state.intakeQuestions];
                                  newQuestions[index].title = e.target.value;
                                  setState({ ...state, intakeQuestions: newQuestions });
                                }}
                                className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon transition-colors"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-400 font-bold mb-1 block">نوع الإجابة</label>
                                <select 
                                  value={q.type}
                                  onChange={(e) => {
                                    const newQuestions = [...state.intakeQuestions];
                                    newQuestions[index].type = e.target.value as any;
                                    setState({ ...state, intakeQuestions: newQuestions });
                                  }}
                                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon transition-colors appearance-none"
                                >
                                  <option value="text">نص قصير</option>
                                  <option value="number">رقم</option>
                                  <option value="textarea">نص طويل</option>
                                  <option value="select">خيارات متعددة</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="text-xs text-gray-400 font-bold mb-1 block">الوصف (اختياري)</label>
                                <input 
                                  type="text"
                                  value={q.desc || ''}
                                  onChange={(e) => {
                                    const newQuestions = [...state.intakeQuestions];
                                    newQuestions[index].desc = e.target.value;
                                    setState({ ...state, intakeQuestions: newQuestions });
                                  }}
                                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon transition-colors"
                                />
                              </div>
                            </div>

                            {q.type === 'select' && (
                              <div>
                                <label className="text-xs text-gray-400 font-bold mb-1 block">الخيارات (افصل بينها بفاصلة , )</label>
                                <input 
                                  type="text"
                                  value={q.options?.join(', ') || ''}
                                  onChange={(e) => {
                                    const newQuestions = [...state.intakeQuestions];
                                    newQuestions[index].options = e.target.value.split(',').map(o => o.trim()).filter(Boolean);
                                    setState({ ...state, intakeQuestions: newQuestions });
                                  }}
                                  placeholder="خيار 1, خيار 2, خيار 3"
                                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-neon transition-colors"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* STEP 6: Dashboard Content (الرئيسية) */}
            {currentStep === 6 && (
              <div className="space-y-6 pb-20">
                <div>
                  <h2 className="text-xl font-bold mb-2">واجهة التطبيق الرئيسية</h2>
                  <p className="text-gray-400 text-sm mb-6">قم بتخصيص البطاقة الرئيسية التي تظهر للمتدرب كل يوم.</p>
                </div>

                <div className="space-y-5">
                  {/* Dashboard Image */}
                  <div className="bg-[#111] border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-start justify-between mb-3 relative z-10">
                      <div>
                        <h3 className="text-sm font-bold text-white mb-1">صورة الرياضي</h3>
                        <p className="text-xs text-gray-500">اختر صورة مفرغة (PNG) لتظهر فوق البطاقة</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform cursor-pointer">
                        {state.dashboardHeroImage ? (
                          <img src={state.dashboardHeroImage} className="w-full h-full object-cover" alt="Hero" />
                        ) : (
                          <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-neon transition-colors" />
                        )}
                        <input type="file" ref={dashboardImageInputRef} className="hidden" accept="image/png" onChange={(e) => handleImageUpload(e, 'dashboardHeroImage')} />
                        <div onClick={() => dashboardImageInputRef.current?.click()} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Edit2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Texts */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-400 font-bold mb-1 block">النص العلوي الصغير</label>
                      <input 
                        type="text" 
                        value={state.dashboardHeroTopText} 
                        onChange={(e) => setState({ ...state, dashboardHeroTopText: e.target.value })}
                        className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-400 font-bold mb-1 block">النص الرئيسي العريض</label>
                      <input 
                        type="text" 
                        value={state.dashboardHeroMainText} 
                        onChange={(e) => setState({ ...state, dashboardHeroMainText: e.target.value })}
                        className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon transition-colors"
                      />
                    </div>
                    

                    <div>
                      <label className="text-xs text-gray-400 font-bold mb-1 block">النص السفلي</label>
                      <input 
                        type="text" 
                        value={state.dashboardHeroBottomText} 
                        onChange={(e) => setState({ ...state, dashboardHeroBottomText: e.target.value })}
                        className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-white/5 bg-[#0a0a0a] z-20 relative">
        {/* Glow behind buttons */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
        
        {currentStep < 6 ? (
          <div className="flex gap-4 relative z-10">
            <button 
              onClick={handleNext}
              className="flex-1 bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_15px_rgba(0,0,0,0)] hover:shadow-[0_10px_30px_rgba(255,255,255,0.15)] group"
            >
              التالي 
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            </button>
            {currentStep > 1 && (
              <button 
                onClick={handlePrev}
                className="w-14 h-14 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition-all duration-300 group"
              >
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <button 
              onClick={onPublish}
              disabled={!canPublish}
              className={cn(
                "w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-500 shadow-xl",
                canPublish 
                  ? "bg-neon text-black hover:bg-[#c4e649] hover:shadow-[0_0_30px_rgba(214,248,84,0.5)] hover:-translate-y-1" 
                  : "bg-white/5 text-gray-600 cursor-not-allowed"
              )}
            >
              🚀 نشر التطبيق وفتح لوحة التحكم
            </button>
            <button 
              onClick={handlePrev}
              className="text-gray-500 text-sm font-medium hover:text-white transition-colors py-2"
            >
              العودة للخطوة السابقة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
