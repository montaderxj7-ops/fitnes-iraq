"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Loader2, User, Package as PackageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { globalSearch } from '@/actions/search';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<{ clients: any[], packages: any[] }>({ clients: [], packages: [] });
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else if (!isOpen) {
      setQuery('');
      setResults({ clients: [], packages: [] });
    }
  }, [isOpen]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsLoading(true);
        const res = await globalSearch(query);
        if (res.success) {
          setResults({
            clients: res.clients || [],
            packages: res.packages || []
          });
        }
        setIsLoading(false);
      } else {
        setResults({ clients: [], packages: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <>
      {/* Trigger Input (Replacing the static one) */}
      <div 
        className="relative flex-1 md:w-72 group cursor-text"
        onClick={() => setIsOpen(true)}
      >
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#82c91e] transition-colors pointer-events-none" />
        <input 
          type="text" 
          readOnly
          placeholder="ابحث عن متدرب أو باقة..." 
          className="w-full bg-black/40 border border-white/10 rounded-full py-3.5 pr-12 pl-14 text-white placeholder-gray-500 focus:outline-none focus:border-[#82c91e]/50 focus:bg-black/60 transition-all font-medium shadow-inner cursor-pointer"
        />
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full border border-white/5 pointer-events-none">
          <span className="text-xs font-bold text-gray-400 tracking-widest">⌘K</span>
        </div>
      </div>

      {/* Modal / Command Palette */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden"
              dir="rtl"
            >
              {/* Search Header */}
              <div className="flex items-center px-4 border-b border-white/10 relative">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-none py-5 px-4 text-white placeholder-gray-500 focus:outline-none text-lg"
                  placeholder="اكتب للبحث..."
                />
                {isLoading && (
                  <Loader2 className="w-5 h-5 text-[#82c91e] animate-spin absolute left-12" />
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results List */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {query.trim().length === 0 ? (
                  <div className="py-14 text-center text-gray-500 text-sm">
                    ابحث عن أي متدرب أو باقة في النظام
                  </div>
                ) : results.clients.length === 0 && results.packages.length === 0 && !isLoading ? (
                  <div className="py-14 text-center text-gray-500 text-sm">
                    لا توجد نتائج مطابقة لـ "{query}"
                  </div>
                ) : (
                  <div className="space-y-4 p-2">
                    {/* Clients */}
                    {results.clients.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-gray-500 px-2 mb-2 uppercase tracking-wider">
                          المتدربين
                        </div>
                        {results.clients.map((client) => (
                          <button
                            key={client.id}
                            onClick={() => handleNavigate(`/dashboard/clients/${client.id}`)}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-right group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#82c91e]/10 text-[#82c91e] flex items-center justify-center border border-[#82c91e]/20 group-hover:bg-[#82c91e] group-hover:text-black transition-colors">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-white font-medium">{client.name}</div>
                                <div className="text-xs text-gray-400">{client.package}</div>
                              </div>
                            </div>
                            {client.status === 'active' ? (
                              <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">نشط</span>
                            ) : (
                              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">غير نشط</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Packages */}
                    {results.packages.length > 0 && (
                      <div>
                        <div className="text-xs font-bold text-gray-500 px-2 mb-2 uppercase tracking-wider">
                          الباقات
                        </div>
                        {results.packages.map((pkg) => (
                          <button
                            key={pkg.id}
                            onClick={() => handleNavigate(`/dashboard/packages`)}
                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors text-right group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <PackageIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-white font-medium">{pkg.name}</div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-400 font-medium">{pkg.price}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
