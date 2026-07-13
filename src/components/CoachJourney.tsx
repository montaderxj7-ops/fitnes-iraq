"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Settings, CreditCard, LayoutDashboard, CheckCircle2 } from "lucide-react";

const features = [
  {
    title: "التخصيص الكامل",
    description: "تطبيقك يحمل اسمك، شعارك، وألوانك الخاصة. كن العلامة التجارية وليس مجرد مدرب.",
    icon: Settings,
    image: "/phone_brand_3d_neon.png",
  },
  {
    title: "الدفع المحلي السهل",
    description: "استقبل أموالك مباشرة عبر زين كاش، ماستر كارد، آسيا حوالة، و FIB بدون تعقيدات.",
    icon: CreditCard,
    image: "/credit_card_3d_neon.png",
  },
  {
    title: "إدارة ذكية وشاملة",
    description: "لوحة تحكم لإدارة المشتركين، الجداول الغذائية والتدريبية، ومحادثات مجدولة تلقائياً.",
    icon: LayoutDashboard,
    image: "/dashboard_3d_neon.png",
  },
];

const steps = [
  { num: "01", title: "اشترك", desc: "اختر الباقة المناسبة لك وابدأ رحلتك." },
  { num: "02", title: "خصص تطبيقك", desc: "أضف شعارك، ألوانك، ومعلوماتك الخاصة." },
  { num: "03", title: "انطلق", desc: "أطلق تطبيقك واستقبل متدربيك فوراً." },
];

export default function CoachJourney() {
  return (
    <section id="about" className="py-24 bg-transparent border-y border-white/5 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            كيف تعمل المنصة <span className="text-neon">للكباتن</span>؟
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            ثلاث خطوات بسيطة تفصلك عن امتلاك تطبيقك الخاص والبدء في تقديم تجربة تدريب احترافية لعملائك.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-24 max-w-[1400px] mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative rounded-[24px] bg-gradient-to-b from-[#555] via-[#222] to-[#050505] p-[1px] pb-[6px] group hover:-translate-y-3 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(214,248,84,0.2)] shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
            >
              {/* Inner card container */}
              <div className="relative w-full h-full bg-gradient-to-b from-[#222224] to-[#151515] rounded-[23px] flex flex-col xl:flex-row items-stretch shadow-[inset_0_2px_20px_rgba(255,255,255,0.02),inset_0_1px_1px_rgba(255,255,255,0.1)]">
                
                {/* Content Half (First in flex-row RTL = Right side) */}
                <div className="w-full xl:w-[55%] p-6 xl:p-8 flex flex-col justify-center relative text-right order-2 xl:order-1 z-10">
                  
                  {/* Top Right Icon Container */}
                  <div className="absolute top-4 right-6 h-12 w-12 rounded-[14px] bg-gradient-to-b from-[#555] to-[#111] p-[1px] shadow-lg">
                    <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] group-hover:shadow-[inset_0_2px_15px_rgba(214,248,84,0.2)] transition-all">
                      <feature.icon className="h-5 w-5 text-gray-400 group-hover:text-neon transition-colors duration-300" />
                    </div>
                  </div>

                  <div className="mt-12 xl:mt-10">
                    <h3 className="text-xl xl:text-2xl font-bold text-white mb-3 group-hover:text-neon transition-colors duration-300 drop-shadow-md">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* 3D Image Half (Second in flex-row RTL = Left side) */}
                <div className="w-full xl:w-[45%] h-[200px] xl:h-auto relative flex items-center justify-center p-4 order-1 xl:order-2 bg-gradient-to-r from-transparent to-black/10">
                   <Image 
                     src={feature.image} 
                     alt={feature.title} 
                     fill
                     className="object-contain transform scale-[1.05] group-hover:scale-[1.2] group-hover:-translate-y-2 transition-all duration-700 p-2 mix-blend-screen z-20 relative" 
                     style={{
                       maskImage: 'radial-gradient(circle, black 40%, transparent 70%)',
                       WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 70%)'
                     }}
                   />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3 Steps */}
        <div className="relative mt-32">
          {/* Connecting Line (Premium Glow) */}
          <div className="absolute top-[48px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-neon/20 to-transparent hidden md:block" />
          <div className="absolute top-[48px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-neon/40 to-transparent hidden md:block blur-sm" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6, type: "spring" }}
                className="flex flex-col items-center text-center group cursor-default"
              >
                {/* 3D Glass Number Circle */}
                <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                   {/* Outer glowing dash ring */}
                   <div className="absolute inset-0 rounded-full border border-neon/10 group-hover:border-neon/50 group-hover:rotate-180 transition-all duration-1000 border-dashed" />
                   
                   {/* Inner solid ring */}
                   <div className="absolute inset-[6px] rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#0a0a0a] border border-white/5 shadow-[inset_0_2px_15px_rgba(255,255,255,0.03),0_15px_30px_rgba(0,0,0,0.8)] group-hover:shadow-[inset_0_2px_20px_rgba(214,248,84,0.15),0_15px_30px_rgba(214,248,84,0.15)] flex items-center justify-center overflow-hidden transition-all duration-500">
                      {/* Inner glow effect */}
                      <div className="absolute bottom-0 w-full h-1/2 bg-neon/10 blur-[12px] group-hover:bg-neon/30 transition-colors duration-500" />
                      
                      {/* Number */}
                      <span className="relative text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 group-hover:from-neon group-hover:to-neon/60 transition-colors duration-500">
                        {step.num}
                      </span>
                   </div>
                </div>
                
                {/* Text Content Block */}
                <div className="bg-[#111]/60 backdrop-blur-xl px-6 py-5 rounded-2xl border border-white/5 group-hover:border-neon/30 transition-colors duration-500 shadow-2xl w-full max-w-[300px]">
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-neon transition-colors duration-500 drop-shadow-md">
                    {step.title}
                  </h4>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
