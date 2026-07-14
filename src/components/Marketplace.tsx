"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Download, Star } from "lucide-react";
import Link from "next/link";

// Mock data removed
export default function Marketplace({ initialCoaches = [] }: { initialCoaches?: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const allCoaches = useMemo(() => {
    // Map DB coaches to match the structure
    const dbCoachesMapped = initialCoaches.map((dbCoach) => ({
      id: dbCoach.id,
      name: dbCoach.name,
      specialty: dbCoach.specialty,
      bio: dbCoach.bio,
      instagram: dbCoach.instagram,
      image: dbCoach.image || "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop",
      logo: dbCoach.logo || "💪",
      slug: dbCoach.slug,
    }));
    return dbCoachesMapped;
  }, [initialCoaches]);

  const filteredCoaches = allCoaches.filter((coach) =>
    coach.name.includes(searchQuery) || coach.specialty.includes(searchQuery)
  );

  return (
    <section id="coaches" className="py-24 bg-transparent">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            ابحث عن <span className="text-neon">كابتنك</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
            تصفح أفضل المدربين في العراق، حمل تطبيقهم الخاص، وابدأ رحلة التغيير اليوم.
          </p>

          {/* Search Bar (Premium Animated) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto relative group mt-16 mb-16 z-20"
          >
            {/* Animated Glow Behind */}
            <div className="absolute -inset-1 bg-gradient-to-r from-neon/0 via-neon/10 to-neon/0 rounded-[35px] blur-xl group-hover:via-neon/30 group-focus-within:via-neon/50 group-focus-within:blur-2xl transition-all duration-700 opacity-50 group-hover:opacity-100"></div>
            
            {/* Main Container - Metallic Border */}
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative p-[1px] rounded-[30px] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden"
            >
              {/* Rotating Gradient Border */}
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#d6f854_40%,#d6f854_60%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-30 group-hover:opacity-80 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              
              {/* Inner Input Wrapper (Premium Glassmorphism) */}
              <div className="relative flex items-center w-full bg-black/40 backdrop-blur-2xl rounded-[29px] overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/10 p-2 transition-all duration-500 group-focus-within:bg-black/60 group-focus-within:border-white/20">
                
                {/* Search Icon Container */}
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.05 }}
                  className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group-focus-within:bg-neon/10 group-focus-within:border-neon/30 transition-all duration-500 relative overflow-hidden ml-2"
                >
                  <Search className="h-5 w-5 text-gray-300 group-focus-within:text-neon group-focus-within:drop-shadow-[0_0_8px_rgba(214,248,84,0.6)] transition-all duration-500 relative z-10" />
                </motion.div>
                
                <input
                  type="text"
                  placeholder="ابحث عن كابتن، تخصص، أو هدف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white/90 py-4 px-4 focus:outline-none placeholder-gray-400 text-lg md:text-xl font-medium transition-all peer drop-shadow-sm"
                />

                {/* Keyboard Shortcut Hint */}
                <div className="hidden md:flex items-center gap-1.5 px-4 opacity-70 peer-focus:opacity-0 transition-opacity duration-300">
                  <div className="flex items-center gap-1 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                    <kbd className="text-[12px] font-mono text-gray-300 font-medium">⌘</kbd>
                    <kbd className="text-[12px] font-mono text-gray-300 font-medium">K</kbd>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Coaches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCoaches.map((coach, index) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="relative rounded-[24px] bg-gradient-to-b from-[#444] via-[#222] to-[#050505] p-[1px] pb-[5px] group hover:-translate-y-3 transition-all duration-500 hover:shadow-[0_25px_50px_-15px_rgba(214,248,84,0.2)] shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="relative w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] rounded-[23px] overflow-hidden flex flex-col shadow-[inset_0_2px_20px_rgba(255,255,255,0.03)]">
                
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden bg-black">
                  <img
                    src={coach.image}
                    alt={coach.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  {/* Gradient Fade to Black */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/30 to-transparent"></div>
                  
                  {/* Floating Glass Icon */}
                  <div className="absolute bottom-4 right-4 bg-[#111]/70 backdrop-blur-md p-2 rounded-2xl border border-white/10 shadow-[0_10px_20px_rgba(0,0,0,0.5)] group-hover:border-neon/40 group-hover:shadow-[0_10px_20px_rgba(214,248,84,0.15)] transition-all duration-500 group-hover:-translate-y-1 flex items-center justify-center overflow-hidden w-14 h-14">
                    {coach.logo && (coach.logo.startsWith("http") || coach.logo.startsWith("data:") || coach.logo.startsWith("/")) ? (
                      <img src={coach.logo} alt="app logo" className="w-full h-full object-contain rounded-xl" />
                    ) : (
                      <span className="text-2xl">{coach.logo}</span>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 pt-2 flex-grow flex flex-col relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-neon transition-colors duration-300 drop-shadow-md">
                    {coach.name}
                  </h3>
                  <p className="text-neon text-sm font-bold mb-3">{coach.specialty}</p>
                  
                  {/* Bio */}
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">
                    {coach.bio}
                  </p>
                  
                  {/* Buttons */}
                  <div className="mt-auto flex flex-col gap-3">
                    {/* Instagram Button */}
                    <a 
                      href={coach.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 text-white py-3.5 rounded-xl font-bold transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:-translate-y-1"
                    >
                      <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                      انستغرام
                    </a>
                    
                    {/* Neon Download Button */}
                    <Link 
                      href={`/${coach.slug || 'coach-demo'}?install=true`}
                      className="w-full flex items-center justify-center gap-2 bg-neon hover:bg-[#c4e649] text-black py-3.5 rounded-xl font-black transition-all duration-300 hover:shadow-[0_0_20px_rgba(214,248,84,0.3)] hover:-translate-y-1 active:translate-y-0"
                    >
                      <Download className="h-5 w-5" />
                      تحميل التطبيق
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredCoaches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            لم يتم العثور على مدربين يطابقون بحثك.
          </div>
        )}
      </div>
    </section>
  );
}
