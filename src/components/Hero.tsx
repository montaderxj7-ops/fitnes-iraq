"use client";

import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import Image from "next/image";
import { ArrowUpLeft, ArrowLeft, Flame, HeartPulse, Activity, Dumbbell } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    // Initialize glow in the center of the screen
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);
  }, [mouseX, mouseY]);

  const springX = useSpring(mouseX, { stiffness: 30, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 20 });

  // Call useMotionTemplate at the top level to follow Rules of Hooks
  const backgroundTemplate = useMotionTemplate`
    radial-gradient(
      800px circle at ${springX}px ${springY}px,
      rgba(214, 248, 84, 0.35),
      transparent 80%
    )
  `;

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <section 
      id="home" 
      onMouseMove={handleMouseMove}
      className="relative h-screen min-h-[800px] w-full overflow-hidden bg-[#050505]"
    >
      {/* Animated & Interactive Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        
        {/* Main Static Spotlight (Like the reference image, top left) */}
        <motion.div
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-[30%] -left-[10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full bg-neon/50 blur-[130px] mix-blend-screen"
        />

        {/* Interactive Mouse Glow */}
        {isMounted && (
          <motion.div
            className="absolute inset-0 z-0 mix-blend-screen"
            style={{
              background: backgroundTemplate,
            }}
          />
        )}
      </div>

      {/* Background Outline Text */}
      <div className="absolute top-[35%] md:top-[30%] left-1/2 -translate-x-1/2 w-full flex items-center justify-center pointer-events-none z-0">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1 }}
          className="text-[22vw] font-black uppercase text-transparent tracking-tighter whitespace-nowrap leading-none"
          style={{ WebkitTextStroke: '2px rgba(255,255,255,0.7)' }}
        >
          FITNESS
        </motion.h1>
      </div>

      {/* Character Image - Centered */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] md:w-[110%] lg:w-[80%] h-[95%] z-20 pointer-events-none flex justify-center items-end">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
          className="relative w-full h-full"
        >
          <Image
            src="/runer.png"
            alt="Athlete Running"
            fill
            className="object-contain object-bottom drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            style={{ mixBlendMode: 'screen' }}
            priority
          />
        </motion.div>
      </div>

      {/* Title Area (Top Left, strictly confined so it doesn't overlap runner heavily) */}
      <div className="absolute top-[18%] lg:top-[22%] left-[2%] lg:left-[5%] z-10 w-[90%] lg:w-[45%] max-w-2xl text-right flex flex-col items-end">
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl md:text-5xl lg:text-[4.5rem] font-extrabold text-white leading-[1.2] drop-shadow-2xl"
        >
          منصتك التدريبية، <br />
          هويتك الخاصة، و <br />
          <span className="text-neon">تطبيقك المستقل</span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="hidden lg:flex mt-6"
        >
          <button 
            onClick={() => document.getElementById('coaches')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 rounded-full border-2 border-zinc-700 bg-zinc-900/80 backdrop-blur-md px-6 py-3 text-sm font-bold text-white transition-all hover:border-neon hover:text-neon hover:bg-black shadow-lg"
          >
            أنا متدرب - ابحث عن كابتنك
            <ArrowLeft className="h-4 w-4" />
          </button>
        </motion.div>
      </div>

      {/* Glassmorphism Info Card (Bottom Right) */}
      <div 
        className="absolute bottom-[10%] lg:bottom-[15%] right-[5%] lg:right-[8%] z-30 w-[90%] max-w-sm"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateZ: -10, y: 30 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            rotateZ: [-3, -1, -3],
            rotateY: [-5, 5, -5],
            rotateX: [5, -5, 5],
            y: [0, -12, 0]
          }}
          transition={{ 
            opacity: { duration: 0.8, delay: 0.7 },
            scale: { duration: 0.8, delay: 0.7, type: "spring" },
            default: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Subtle Glare Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
          
          <p className="text-gray-300 text-sm md:text-base leading-relaxed text-right relative z-10">
            ابنِ علامتك التجارية، أدر متدربيك باحترافية، واستقبل مدفوعاتك محلياً. <span className="text-white font-bold drop-shadow-md">كل ما تحتاجه لنجاحك كمدرب</span> في مكان واحد.
          </p>
        </motion.div>
      </div>

      {/* CTA Button (Bottom Left) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-[10%] lg:bottom-[15%] left-[5%] lg:left-[8%] z-30"
      >
        <button 
          onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex items-center gap-4 bg-neon hover:bg-neon-hover border border-neon hover:border-neon text-black font-bold py-3.5 px-8 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(214,248,84,0.4)] hover:shadow-[0_0_40px_rgba(214,248,84,0.6)] hover:scale-105 active:scale-95"
        >
          <span className="text-lg">أنا مدرب - ابدأ ببناء تطبيقك</span>
          <div className="bg-black rounded-full p-2 text-neon transition-colors group-hover:rotate-45">
            <ArrowUpLeft size={20} strokeWidth={3} />
          </div>
        </button>
      </motion.div>

      {/* Floating Metrics Cards (Appearing in front of character z-30) */}
      <div className="absolute inset-0 pointer-events-none z-30 hidden md:block">
        
        {/* Connecting Animated Dotted Lines -> Smooth Glowing Gradient Lines */}
        <svg key="svg-lines-v4" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_12px_rgba(214,248,84,0.8)]" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(214,248,84,0)" />
              <stop offset="10%" stopColor="rgba(214,248,84,0)" />
              <stop offset="40%" stopColor="rgba(214,248,84,0.8)" />
              <stop offset="100%" stopColor="rgba(214,248,84,1)" />
            </linearGradient>
          </defs>
          
          {/* Calories Line (Forehead -> Top Right) */}
          <motion.path
            d="M 56 27 Q 65 20 78 15"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
          />
          {/* Heart Rate Line (Fist -> Inner Right) */}
          <motion.path
            d="M 62 32 Q 67 30 72 29"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          />
          {/* SpO2 Line (Elbow -> Inner Bottom) */}
          <motion.path
            d="M 45 55 Q 58 49 72 43"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.4 }}
          />
          {/* Weight Line (Knee -> Outer Bottom) */}
          <motion.path
            d="M 43 75 Q 60 66 78 57"
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.6 }}
          />
        </svg>

        {/* Calories Card - Top Right (Outer) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1, type: "spring" }}
          className="absolute top-[12%] left-[78%]"
        >
          <div className="absolute top-1/2 -left-3 w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_12px_#D6F854] -translate-y-1/2 z-10" />
          <motion.div
            dir="ltr"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0 }}
            className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-1 min-w-[140px] shadow-[0_0_30px_rgba(214,248,84,0.05)]"
          >
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <Flame size={14} className="text-neon" />
              Calories Burned
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-white tracking-wider">632</span>
              <span className="text-[10px] text-gray-500 uppercase">kcal</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Heart Rate Card - Top Right (Inner) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.2, type: "spring" }}
          className="absolute top-[26%] left-[72%]"
        >
          <div className="absolute top-1/2 -left-3 w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_12px_#D6F854] -translate-y-1/2 z-10" />
          <motion.div
            dir="ltr"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-1 min-w-[150px] shadow-[0_0_30px_rgba(214,248,84,0.05)]"
          >
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <HeartPulse size={14} className="text-pink-500" />
              Heart Rate
            </div>
            <div className="flex items-end justify-between mt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-wider">124</span>
                <span className="text-[10px] text-gray-500 uppercase">bpm</span>
              </div>
              <svg className="w-10 h-6 text-neon" viewBox="0 0 50 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 10 L10 10 L15 0 L25 20 L30 10 L50 10" />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* SpO2 Card - Bottom Right (Inner) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.4, type: "spring" }}
          className="absolute top-[40%] left-[72%]"
        >
          <div className="absolute top-1/2 -left-3 w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_12px_#D6F854] -translate-y-1/2 z-10" />
          <motion.div
            dir="ltr"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-1 min-w-[140px] shadow-[0_0_30px_rgba(214,248,84,0.05)]"
          >
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <Activity size={14} className="text-blue-400" />
              SpO2
            </div>
            <div className="flex items-end justify-between mt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-wider">98</span>
                <span className="text-[10px] text-gray-500 uppercase">%</span>
              </div>
              <svg className="w-8 h-4 text-neon" viewBox="0 0 30 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 5 Q7 0 15 5 T30 5" />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Weight Card - Bottom Right (Outer) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.6, type: "spring" }}
          className="absolute top-[54%] left-[78%]"
        >
          <div className="absolute top-1/2 -left-3 w-2.5 h-2.5 rounded-full bg-neon shadow-[0_0_12px_#D6F854] -translate-y-1/2 z-10" />
          <motion.div
            dir="ltr"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col gap-1 min-w-[140px] shadow-[0_0_30px_rgba(214,248,84,0.05)]"
          >
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <Dumbbell size={14} className="text-green-400" />
              Weight
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-white tracking-wider">72.4</span>
              <span className="text-[10px] text-gray-500 uppercase">kg</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
