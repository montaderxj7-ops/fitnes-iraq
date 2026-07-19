"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, CheckCircle2, XCircle, ArrowUpRight, Clock, Users, UserPlus, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getClients } from "@/actions/clients";

// Removed mock CLIENTS

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [packageFilter, setPackageFilter] = useState<string | null>(null);
  
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getClients();
      setClients(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.includes(searchQuery) ||
      client.package.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.status.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter ? client.status === statusFilter : true;
    const matchesPackage = packageFilter ? client.package === packageFilter : true;

    return matchesSearch && matchesStatus && matchesPackage;
  });

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 min-h-full"
    >
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="bg-[#111111]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 flex items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full group-hover:bg-blue-500/20 transition-colors" />
          <div className="relative z-10">
            <p className="text-gray-400 font-medium mb-1">إجمالي المشتركين</p>
            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-sm">{clients.length}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 relative z-10 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform duration-300">
            <Users className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_currentColor]" />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="bg-[#111111]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 flex items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(130,201,30,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#82c91e]/10 blur-[40px] rounded-full group-hover:bg-[#82c91e]/20 transition-colors" />
          <div className="relative z-10">
            <p className="text-gray-400 font-medium mb-1">المشتركون النشطون</p>
            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-sm">{clients.filter(c => c.status === "active").length}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-[#82c91e]/10 flex items-center justify-center border border-[#82c91e]/20 relative z-10 shadow-[inset_0_0_10px_rgba(130,201,30,0.1)] group-hover:scale-110 transition-transform duration-300">
            <Activity className="w-6 h-6 text-[#82c91e] drop-shadow-[0_0_8px_currentColor]" />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="bg-[#111111]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 flex items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.15)] relative overflow-hidden group">
          <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full group-hover:bg-orange-500/20 transition-colors" />
          <div className="relative z-10">
            <p className="text-gray-400 font-medium mb-1">مشتركون جدد</p>
            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-sm">{clients.filter(c => {
              const diff = new Date().getTime() - new Date(c.createdAt).getTime();
              return diff < 7 * 24 * 60 * 60 * 1000;
            }).length}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 relative z-10 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)] group-hover:scale-110 transition-transform duration-300">
            <UserPlus className="w-6 h-6 text-orange-400 drop-shadow-[0_0_8px_currentColor]" />
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#111111]/80 backdrop-blur-3xl rounded-[40px] border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col min-h-[600px] overflow-hidden">
        <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
        <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/3" />
        </div>
        
        {/* Title & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 relative z-50">
          <div>
            <h1 className="text-3xl font-black text-white mb-2">إدارة المشتركين</h1>
            <p className="text-gray-400 font-medium">تحكم بجميع عملائك، خططهم، وتطورهم من مكان واحد.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#82c91e] transition-colors" />
              <input 
                type="text"
                placeholder="ابحث عن مشترك..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-full py-3.5 pr-12 pl-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#82c91e]/50 focus:bg-black/60 transition-all shadow-inner font-medium"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full border transition-all font-bold shadow-inner group",
                  isFilterOpen 
                    ? "bg-[#82c91e]/10 border-[#82c91e]/50 text-[#82c91e]" 
                    : "bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20"
                )}
              >
                <Filter className={cn("w-5 h-5 transition-colors", isFilterOpen ? "text-[#82c91e]" : "group-hover:text-[#82c91e]")} />
                تصفية
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-4 w-72 bg-[#1a1f1a]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] p-5 shadow-2xl z-[100] origin-top"
                  >
                    {/* Status Filter */}
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-gray-400 mb-3">حالة الخطة</h4>
                      <div className="flex flex-wrap gap-2">
                        {['مكتملة', 'غير مكتملة', 'بانتظار التحديث'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                              statusFilter === status 
                                ? "bg-[#82c91e]/20 border-[#82c91e]/50 text-[#82c91e]" 
                                : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Package Filter */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 mb-3">الباقة</h4>
                      <div className="flex flex-wrap gap-2">
                        {['الباقة الشاملة', 'تدريب أونلاين', 'متابعة فقط', 'تغذية فقط'].map((pkg) => (
                          <button
                            key={pkg}
                            onClick={() => setPackageFilter(packageFilter === pkg ? null : pkg)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                              packageFilter === pkg 
                                ? "bg-[#82c91e]/20 border-[#82c91e]/50 text-[#82c91e]" 
                                : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                            )}
                          >
                            {pkg}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* List Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 text-gray-500 font-bold text-sm bg-black/20 rounded-2xl mb-4 relative z-10">
          <div className="col-span-3">اسم المشترك</div>
          <div className="col-span-3 text-center">الباقة الحالية</div>
          <div className="col-span-3 text-center">تاريخ الانتهاء</div>
          <div className="col-span-2 text-center">حالة الخطة</div>
          <div className="col-span-1 text-left">إجراء</div>
        </div>

        {/* Clients List */}
        <div className="flex flex-col gap-3 relative z-10 flex-1">
          {filteredClients.map((client) => (
            <motion.div 
              key={client.id}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 lg:px-6 lg:py-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#82c91e]/40 rounded-[24px] transition-all cursor-pointer shadow-sm hover:shadow-[0_0_25px_rgba(130,201,30,0.15)] backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-1 h-full bg-[#82c91e] opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Name & Avatar */}
              <div className="col-span-3 flex items-center gap-4 relative z-10">
                <div className="relative">
                  <img src={client.image || `https://i.pravatar.cc/150?u=${client.id}`} alt={client.name} className="w-14 h-14 rounded-[16px] object-cover border border-white/10 group-hover:border-[#82c91e] transition-colors shadow-lg" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#82c91e] border-[3px] border-[#111111] rounded-full" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg group-hover:text-[#82c91e] transition-colors">{client.name}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">ID: #{client.id.padStart(4, '0')}</p>
                </div>
              </div>

              {/* Package */}
              <div className="col-span-3 lg:text-center flex justify-between lg:block items-center">
                <span className="lg:hidden text-gray-500 text-sm font-bold">الباقة:</span>
                <span className="px-4 py-2 rounded-xl bg-black/40 text-gray-300 text-sm font-bold border border-white/5 shadow-inner inline-block">
                  {client.package}
                </span>
              </div>

              {/* Expiry */}
              <div className="col-span-3 lg:text-center flex justify-between lg:block items-center">
                <span className="lg:hidden text-gray-500 text-sm font-bold">الانتهاء:</span>
                <span className="text-gray-400 text-sm font-bold flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 opacity-50" />
                  {client.expiry}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 lg:text-center flex justify-between lg:block items-center">
                <span className="lg:hidden text-gray-500 text-sm font-bold">الحالة:</span>
                <div className="inline-flex justify-center">
                  {client.status === "مكتملة" ? (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#82c91e]/10 text-[#82c91e] text-sm font-black border border-[#82c91e]/20 shadow-[0_0_15px_rgba(130,201,30,0.1)]">
                      <CheckCircle2 className="w-4 h-4" /> {client.status}
                    </span>
                  ) : client.status === "غير مكتملة" ? (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm font-black border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                      <XCircle className="w-4 h-4" /> {client.status}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-400 text-sm font-black border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                      <Clock className="w-4 h-4" /> {client.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="col-span-1 flex lg:justify-end justify-center mt-4 lg:mt-0 relative z-10">
                <Link href={`/dashboard/clients/${client.id}`} onClick={(e) => e.stopPropagation()}>
                  <button className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-[#82c91e] group-hover:text-[#1a1f1a] group-hover:border-[#82c91e] group-hover:scale-110 transition-all shadow-lg group-hover:shadow-[0_0_20px_rgba(130,201,30,0.4)]">
                    <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}

          {filteredClients.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500 bg-white/5 rounded-[24px] border border-white/5 border-dashed mt-4">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-bold text-gray-400">لا يوجد مشتركون بهذا الاسم</p>
              <p className="text-sm mt-2">حاول استخدام كلمات بحث مختلفة.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
