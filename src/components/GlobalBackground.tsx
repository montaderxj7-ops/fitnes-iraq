"use client";

import { motion } from "framer-motion";

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-[-10] w-full h-full bg-[#030303] overflow-hidden pointer-events-none">
      
      {/* Professional SaaS Grid Pattern */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
        }}
      />
      
      {/* Top Ambient Glow (Adds depth to the top of the page) */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[70vw] h-[400px] bg-neon/15 blur-[160px] rounded-full pointer-events-none mix-blend-screen" />
      
      {/* Deep Background Gradient Lights (Very subtle) */}
      <motion.div
        animate={{
          x: [-100, 100, -100],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none mix-blend-screen"
      />

      <motion.div
        animate={{
          x: [100, -100, 100],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] bg-neon/5 blur-[160px] rounded-full pointer-events-none mix-blend-screen"
      />
    </div>
  );
}

