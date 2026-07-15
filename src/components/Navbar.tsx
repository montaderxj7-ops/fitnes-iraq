"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "الرئيسية", href: "#home" },
  { name: "عن المنصة", href: "#about" },
  { name: "الكباتن", href: "#coaches" },
  { name: "الأسعار", href: "#pricing" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
        setIsMobileMenuOpen(false);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 md:px-8 transition-all duration-300">
      <nav
        className={`mx-auto max-w-6xl rounded-full transition-all duration-300 border ${
          isScrolled
            ? "bg-black/70 backdrop-blur-xl border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] py-3"
            : "bg-white/5 backdrop-blur-md border-white/10 py-4"
        }`}
      >
        <div className="flex items-center justify-between px-6">
          {/* Logo & Brand */}
          <Link href="#home" onClick={(e) => handleSmoothScroll(e, "#home")} className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative w-14 h-14 md:w-16 md:h-16 drop-shadow-[0_0_10px_rgba(214,248,84,0.2)]"
            >
              <Image
                src="/log.png"
                alt="Fitness Iraq Logo"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
            <span className="text-xl md:text-2xl font-black text-white tracking-wide transition-colors group-hover:text-neon hidden sm:block">
              Fitness <span className="text-neon group-hover:text-white transition-colors">Iraq</span>
            </span>
          </Link>

          {/* Desktop Links (Premium Animated Pill) */}
          <div 
            className="hidden md:flex items-center gap-2 relative"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {navLinks.map((link, idx) => (
              <div 
                key={link.name}
                className="relative px-6 py-2.5 cursor-pointer rounded-full"
                onMouseEnter={() => setHoveredIndex(idx)}
              >
                {hoveredIndex === idx && (
                  <motion.div
                    layoutId="navbar-hover"
                    className="absolute inset-0 bg-neon/20 border border-neon/50 rounded-full shadow-[0_0_15px_rgba(214,248,84,0.3)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <a
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className={`relative z-10 text-[15px] font-bold transition-colors duration-300 ${
                    hoveredIndex === idx ? "text-neon drop-shadow-md" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.name}
                </a>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/login"
              className="text-white hover:text-neon font-bold py-2.5 px-4 text-sm transition-colors"
            >
              دخول الكباتن
            </Link>
            <motion.button 
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSmoothScroll(e as any, "#pricing")}
              whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(214,248,84,0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-neon text-black font-bold py-2.5 px-6 rounded-full text-sm transition-all shadow-[0_0_15px_rgba(214,248,84,0.3)]"
            >
              ابدأ الآن
            </motion.button>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
            className="absolute top-24 left-4 right-4 bg-card/95 border border-white/10 rounded-3xl p-6 shadow-2xl md:hidden flex flex-col gap-4 backdrop-blur-xl"
          >
            {navLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                whileHover={{ x: -10, color: "var(--color-neon)" }}
                className="text-gray-300 hover:text-white text-lg font-medium transition-colors pb-2 border-b border-white/5 cursor-pointer block"
              >
                {link.name}
              </motion.a>
            ))}
            <Link
              href="/login"
              className="text-white hover:text-neon text-lg font-medium transition-colors pb-2 border-b border-white/5 cursor-pointer block mt-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              تسجيل دخول الكباتن
            </Link>
            <motion.button 
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleSmoothScroll(e as any, "#pricing")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-neon text-black font-bold py-3 px-6 rounded-xl mt-4 transition-colors"
            >
              ابدأ الآن
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

