"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Copy, Check, AlertCircle, Dumbbell, Apple } from "lucide-react";
import { cn } from "@/lib/utils";

type PlanOption = {
  id: string;
  name: string;
  client?: { name: string | null } | null;
  createdAt?: Date;
};

type ClonePlanModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (planId: string) => Promise<void>;
  fetchPlans: () => Promise<{ success: boolean; plans?: any[]; error?: string }>;
  type: "workout" | "nutrition";
};

export function ClonePlanModal({ isOpen, onClose, onSelectPlan, fetchPlans, type }: ClonePlanModalProps) {
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<PlanOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cloningId, setCloningId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    } else {
      setSearchQuery("");
      setCloningId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlans(plans);
    } else {
      const lowerQ = searchQuery.toLowerCase();
      setFilteredPlans(plans.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        (p.client?.name && p.client.name.toLowerCase().includes(lowerQ))
      ));
    }
  }, [searchQuery, plans]);

  const loadPlans = async () => {
    setIsLoading(true);
    const res = await fetchPlans();
    if (res.success && res.plans) {
      setPlans(res.plans);
      setFilteredPlans(res.plans);
    }
    setIsLoading(false);
  };

  const handleClone = async (id: string) => {
    setCloningId(id);
    await onSelectPlan(id);
    setCloningId(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1a1f1a] border border-white/10 rounded-2xl p-6 z-50 flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                <span className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  type === "workout" ? "bg-neon/10 text-neon" : "bg-purple-500/10 text-purple-400"
                )}>
                  {type === "workout" ? <Dumbbell className="w-5 h-5" /> : <Apple className="w-5 h-5" />}
                </span>
                استنساخ {type === "workout" ? "نظام تدريبي" : "نظام غذائي"}
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative mb-6 shrink-0">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="ابحث باسم الخطة أو المتدرب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white focus:border-[#82c91e]/50 focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 min-h-[200px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10 space-y-4">
                  <div className="animate-spin w-8 h-8 border-4 border-white/10 border-t-neon rounded-full" />
                  <p className="text-sm">جاري تحميل الخطط السابقة...</p>
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
                  <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium">لا توجد خطط سابقة</p>
                  <p className="text-xs mt-1 text-gray-400">
                    {searchQuery ? "جرب البحث باسم آخر" : "قم بحفظ خطط لتتمكن من استنساخها لاحقاً"}
                  </p>
                </div>
              ) : (
                filteredPlans.map(plan => (
                  <div 
                    key={plan.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-black/40 hover:border-white/20 transition-all group"
                  >
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">{plan.name}</h4>
                      {plan.client?.name && (
                        <p className="text-[10px] text-gray-400">المتدرب: {plan.client.name}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleClone(plan.id)}
                      disabled={cloningId !== null}
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                        cloningId === plan.id
                          ? "bg-neon text-black"
                          : "bg-white/5 text-gray-400 group-hover:bg-neon/10 group-hover:text-neon"
                      )}
                    >
                      {cloningId === plan.id ? (
                        <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
