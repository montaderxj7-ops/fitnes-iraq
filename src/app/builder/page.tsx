"use client";

import { useState } from "react";
import LeftPanel from "@/components/builder/LeftPanel";
import LiveMockup from "@/components/builder/LiveMockup";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

import { PublishModal } from "@/components/builder/PublishModal";

export interface IntakeQuestion {
  id: string;
  title: string;
  desc: string;
  type: "number" | "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
}

export interface BuilderState {
  appName: string;
  welcomeMessage: string;
  welcomeImage: string | null;
  appIcon: string | null;
  appLogo: string | null;
  primaryColor: string;
  theme: "dark" | "light" | "both";
  payments: {
    zainCash: boolean;
    zainCashNumber: string;
    zainCashName: string;
    fib: boolean;
    fibAccount: string;
    fibName: string;
    asiaHawala: boolean;
    asiaHawalaNumber: string;
    asiaHawalaName: string;
    masterCard: boolean;
    masterCardNumber: string;
    masterCardName: string;
    visaCard: boolean;
    visaCardNumber: string;
    visaCardName: string;
    card: boolean;
    cardLink: string;
  };
  firstPackage: {
    name: string;
    price: string;
    hasChat: boolean;
    chatDays: string;
    chatHours: string;
    features: string[];
  };
  intakeQuestions: IntakeQuestion[];
  dashboardHeroImage: string | null;
  dashboardHeroTopText: string;
  dashboardHeroMainText: string;
  dashboardHeroBottomText: string;
  dashboardHeroProgress: string;
}

export type MockupView = "packages" | "login" | "profile" | "intake" | "dashboard";

export default function BuilderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [mockupView, setMockupView] = useState<MockupView>("packages");
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const [builderState, setBuilderState] = useState<BuilderState>({
    appName: "",
    welcomeMessage: "",
    welcomeImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop", // A nice default fitness image
    appIcon: null,
    appLogo: null,
    primaryColor: "#D6F854", // neon default
    theme: "dark",
    payments: {
      zainCash: false,
      zainCashNumber: "",
      zainCashName: "",
      fib: false,
      fibAccount: "",
      fibName: "",
      asiaHawala: false,
      asiaHawalaNumber: "",
      asiaHawalaName: "",
      masterCard: false,
      masterCardNumber: "",
      masterCardName: "",
      visaCard: false,
      visaCardNumber: "",
      visaCardName: "",
      card: false,
      cardLink: "",
    },
    firstPackage: {
      name: "",
      price: "",
      hasChat: true,
      chatDays: "7",
      chatHours: "2",
      features: ["جدول تدريب مخصص", "نظام غذائي مرن"]
    },
    intakeQuestions: [
      { id: 'age', title: 'كم عمرك؟', desc: 'يساعدنا في تحديد الجهد المناسب لك', type: 'number', placeholder: 'مثال: 25' },
      { id: 'weight', title: 'كم وزنك الحالي؟ (كجم)', desc: 'لمعرفة السعرات الحرارية المناسبة', type: 'number', placeholder: 'مثال: 75' },
      { id: 'height', title: 'كم طولك؟ (سم)', desc: 'لحساب كتلة الجسم بشكل دقيق', type: 'number', placeholder: 'مثال: 175' },
      { id: 'goal', title: 'ما هو هدفك الأساسي؟', desc: 'سنقوم ببناء خطتك بناءً على هذا الهدف', type: 'select', options: ['خسارة الوزن وتنشيف', 'بناء كتلة عضلية', 'زيادة الوزن', 'رفع اللياقة العامة', 'الاستشفاء من إصابة'] },
      { id: 'injuries', title: 'هل تعاني من أي إصابات؟', desc: 'يرجى ذكر أي مشاكل صحية أو إصابات سابقة', type: 'textarea', placeholder: 'اكتب "لا يوجد" إذا كنت سليماً..' },
    ],
    dashboardHeroImage: "https://pngimg.com/uploads/fitness/fitness_PNG19.png",
    dashboardHeroTopText: "جاهز للتحدي؟",
    dashboardHeroMainText: "مستعد لتمرين اليوم؟",
    dashboardHeroBottomText: "نحن قريبون جداً من تحقيق الهدف!",
    dashboardHeroProgress: "90"
  });

  const handlePublish = () => {
    setIsPublishModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col lg:flex-row overflow-hidden font-sans" dir="rtl">
      
      {/* Left Controls Panel - 40% */}
      <div className="w-full lg:w-[40%] h-screen lg:overflow-y-auto border-l border-white/10 bg-[#0a0a0a] z-10 relative custom-scrollbar">
        <LeftPanel 
          state={builderState} 
          setState={setBuilderState} 
          currentStep={currentStep} 
          setCurrentStep={setCurrentStep}
          setMockupView={setMockupView}
          onPublish={handlePublish}
        />
      </div>

      {/* Right Live Mockup Panel - 60% */}
      <div className="w-full lg:w-[60%] h-screen relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a] via-[#050505] to-[#000] flex items-center justify-center p-4 lg:p-12 overflow-hidden">
        {/* Dynamic Background Glow based on primary color */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] lg:w-[40vw] lg:h-[40vw] rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: builderState.primaryColor }}
        />
        
        <LiveMockup state={builderState} currentView={mockupView} onViewChange={setMockupView} currentStep={currentStep} />
      </div>

      <PublishModal 
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        appName={builderState.appName}
        appLogo={builderState.appLogo}
        firstPackage={builderState.firstPackage}
      />
    </div>
  );
}
