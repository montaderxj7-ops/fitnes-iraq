"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, DollarSign, ArrowUpRight, CheckCircle2, Clock, Check, TrendingUp, CreditCard, ChevronLeft, Users, X, MessageCircle, ChevronDown, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getPackages, createPackage, updatePackage, deletePackage } from "@/actions/packages";
import { getPayments } from "@/actions/payments";
import { getDashboardStats } from "@/actions/dashboard";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packageToDelete, setPackageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDaysDropdownOpen, setIsDaysDropdownOpen] = useState(false);
  const [isHoursDropdownOpen, setIsHoursDropdownOpen] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [newPackage, setNewPackage] = useState({
    name: "",
    price: "",
    hasNutrition: false,
    hasChat: true,
    chatDays: "يومياً",
    chatHours: "مفتوح",
    popular: false,
    features: [] as string[]
  });

  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalRevenue: "0", pendingAmount: "0" });
  
  useEffect(() => {
    getPackages().then(data => {
      setPackages(data.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        clients: pkg.clientsCount,
        hasNutrition: pkg.hasNutrition,
        hasChat: pkg.hasChat,
        chatDays: pkg.chatDays,
        chatHours: pkg.chatHours,
        popular: pkg.popular,
        features: JSON.parse(pkg.features || "[]")
      })));
    });

    getPayments().then(res => {
      if (res.success && res.payments) {
        setPayments(res.payments);
      }
    });

    getDashboardStats().then(data => {
      // remove $ sign and formatting for raw number logic if needed, or just display
      // Here totalRevenue comes as formatted string like "$4,250,000". We can strip "$" and use it.
      const revStr = data.totalRevenue.replace('$', '');
      setStats({
        totalRevenue: revStr,
        pendingAmount: "0" // we can calculate this from pending payments if needed, but 0 is fine for now
      });
    });
  }, []);

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage.name || !newPackage.price) return;
    
    try {
      if (editingPackageId) {
        const updated = await updatePackage(editingPackageId, {
          name: newPackage.name,
          price: newPackage.price,
          hasNutrition: newPackage.hasNutrition,
          hasChat: newPackage.hasChat,
          chatDays: newPackage.chatDays,
          chatHours: newPackage.chatHours,
          popular: newPackage.popular,
          features: newPackage.features
        });

        setPackages(packages.map(pkg => pkg.id === editingPackageId ? {
          id: updated.id,
          name: updated.name,
          price: updated.price,
          clients: updated.clientsCount,
          hasNutrition: updated.hasNutrition,
          hasChat: updated.hasChat,
          chatDays: updated.chatDays,
          chatHours: updated.chatHours,
          popular: updated.popular,
          features: JSON.parse(updated.features || "[]")
        } : pkg));
      } else {
        const created = await createPackage({
          name: newPackage.name,
          price: newPackage.price,
          hasNutrition: newPackage.hasNutrition,
          hasChat: newPackage.hasChat,
          chatDays: newPackage.chatDays,
          chatHours: newPackage.chatHours,
          popular: newPackage.popular,
          features: newPackage.features
        });
        
        setPackages([
          {
            id: created.id,
            name: created.name,
            price: created.price,
            clients: created.clientsCount,
            hasNutrition: created.hasNutrition,
            hasChat: created.hasChat,
            chatDays: created.chatDays,
            chatHours: created.chatHours,
            popular: created.popular,
            features: JSON.parse(created.features || "[]")
          },
          ...packages
        ]);
      }
      
      setIsAddModalOpen(false);
      setEditingPackageId(null);
      setNewFeatureText("");
      setNewPackage({ name: "", price: "", hasNutrition: false, hasChat: true, chatDays: "يومياً", chatHours: "مفتوح", popular: false, features: [] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePackage = async (id: string) => {
    setIsDeleting(true);
    try {
      await deletePackage(id);
      setPackages(packages.filter(p => p.id !== id));
      setPackageToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (pkg: any) => {
    setNewPackage({
      name: pkg.name,
      price: pkg.price,
      hasNutrition: pkg.hasNutrition,
      hasChat: pkg.hasChat,
      chatDays: pkg.chatDays,
      chatHours: pkg.chatHours,
      popular: pkg.popular,
      features: pkg.features
    });
    setEditingPackageId(pkg.id);
    setIsAddModalOpen(true);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 min-h-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">الباقات والمالية</h1>
          <p className="text-gray-400 font-medium">إدارة باقاتك التدريبية ومتابعة الأرباح والمدفوعات بشكل لحظي.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Packages Management (Right Panel in RTL) */}
        <motion.div variants={itemVariants} className="xl:col-span-4 space-y-6">
          <div className="flex items-center justify-between bg-[#111111]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#82c91e]/10 blur-[40px] rounded-full pointer-events-none" />
            <h2 className="text-xl font-black flex items-center gap-3 text-white relative z-10">
              <div className="w-10 h-10 rounded-xl bg-[#82c91e]/10 flex items-center justify-center border border-[#82c91e]/20">
                <Package className="w-5 h-5 text-[#82c91e]" />
              </div>
              باقاتي
            </h2>
            <button 
              onClick={() => {
                setEditingPackageId(null);
                setNewPackage({ name: "", price: "", hasNutrition: false, hasChat: true, chatDays: "يومياً", chatHours: "مفتوح", popular: false, features: [] });
                setIsAddModalOpen(true);
              }}
              className="w-10 h-10 bg-[#82c91e] text-[#1a1f1a] rounded-xl flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(130,201,30,0.3)] relative z-10"
            >
              <Plus className="w-6 h-6 font-bold" />
            </button>
          </div>

          <div className="space-y-5">
            {packages.map((pkg) => (
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                key={pkg.id} 
                className="bg-[#111111]/60 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] relative overflow-hidden group hover:border-[#82c91e]/30 transition-all hover:shadow-[0_0_40px_rgba(130,201,30,0.15)]"
              >
                <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
                {pkg.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)] z-20">
                    الأكثر طلباً 🔥
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2 z-20">
                  <button onClick={() => openEditModal(pkg)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPackageToDelete(pkg.id)} className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-[#82c91e]/10 transition-colors" />
                
                <div className="mb-6 relative z-10">
                  <h3 className="text-xl font-black text-white mb-2 group-hover:text-[#82c91e] transition-colors">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white">{pkg.price}</span>
                    <span className="text-sm font-bold text-gray-500">د.ع / شهر</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 relative z-10">
                  <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                    <div className="w-6 h-6 rounded-full bg-[#82c91e]/10 flex items-center justify-center border border-[#82c91e]/20">
                      <Check className="w-3.5 h-3.5 text-[#82c91e]" />
                    </div>
                    <span>جدول تدريبي مخصص</span>
                  </div>
                  <div className={cn("flex items-center gap-3 text-sm font-medium", pkg.hasNutrition ? "text-gray-300" : "text-gray-600 opacity-50")}>
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border", pkg.hasNutrition ? "bg-[#82c91e]/10 border-[#82c91e]/20" : "bg-white/5 border-white/10")}>
                      {pkg.hasNutrition ? <Check className="w-3.5 h-3.5 text-[#82c91e]" /> : <div className="w-2 h-0.5 bg-gray-500 rounded-full" />}
                    </div>
                    <span>خطة غذائية متكاملة</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                    <div className="w-6 h-6 rounded-full bg-[#82c91e]/10 flex items-center justify-center border border-[#82c91e]/20">
                      <Check className="w-3.5 h-3.5 text-[#82c91e]" />
                    </div>
                    <span>تواصل {pkg.chatDays} أيام في الأسبوع</span>
                  </div>
                  {pkg.features?.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                      <div className="w-6 h-6 rounded-full bg-[#82c91e]/10 flex items-center justify-center border border-[#82c91e]/20">
                        <Check className="w-3.5 h-3.5 text-[#82c91e]" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">المشتركون النشطون</span>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-lg font-black text-white">{pkg.clients}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Financials & Payments (Left Panel in RTL) */}
        <motion.div variants={itemVariants} className="xl:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Total Earnings Card */}
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="bg-[#111111]/60 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#82c91e]/5 to-transparent pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#82c91e]/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-[#82c91e]/20 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#82c91e]/10 flex items-center justify-center border border-[#82c91e]/20 shadow-[0_0_15px_rgba(130,201,30,0.1)]">
                    <TrendingUp className="w-7 h-7 text-[#82c91e]" />
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 text-xs font-bold text-gray-400 border border-white/5">يوليو 2026</span>
                </div>
                <p className="text-gray-400 font-bold mb-2">أرباح هذا الشهر</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-white tracking-tight">{stats.totalRevenue}</h3>
                  <span className="text-lg font-bold text-[#82c91e]">د.ع</span>
                </div>
              </div>
            </motion.div>
            
            {/* Pending Amount Card */}
            <motion.div whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="bg-[#111111]/60 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-orange-500/20 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    <Clock className="w-7 h-7 text-orange-500" />
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <ArrowUpRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-gray-400 font-bold mb-2">مبالغ قيد المراجعة</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-4xl font-black text-white tracking-tight">{stats.pendingAmount}</h3>
                  <span className="text-lg font-bold text-orange-500">د.ع</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Payments History List */}
          <div className="bg-[#111111]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 rounded-[40px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-white/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 -translate-x-1/2" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-3 text-white">
                  <DollarSign className="w-6 h-6 text-[#82c91e]" />
                  سجل المدفوعات
                </h2>
                <p className="text-sm font-medium text-gray-400 mt-1">أحدث العمليات المالية الخاصة بمتدربيك.</p>
              </div>
              <button className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                عرض الكل
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* List Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 text-gray-500 font-bold text-sm bg-black/40 rounded-2xl mb-4 relative z-10">
              <div className="col-span-2">رقم العملية</div>
              <div className="col-span-3">المشترك</div>
              <div className="col-span-2">المبلغ (د.ع)</div>
              <div className="col-span-2 text-center">التاريخ</div>
              <div className="col-span-3 text-left">الحالة</div>
            </div>

            {/* List Items */}
            <div className="flex flex-col gap-3 relative z-10 flex-1">
              {payments.length === 0 ? (
                <div className="text-center p-8 text-gray-500 font-medium">لا توجد عمليات دفع مسجلة حتى الآن.</div>
              ) : (
                payments.map((payment) => (
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    key={payment.id}
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 lg:px-6 lg:py-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#82c91e]/40 rounded-[24px] transition-all cursor-pointer shadow-sm hover:shadow-[0_0_20px_rgba(130,201,30,0.15)] relative overflow-hidden backdrop-blur-md"
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-[#82c91e] opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Transaction ID */}
                  <div className="col-span-2 flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center border border-white/5">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="font-mono font-bold text-gray-400 group-hover:text-white transition-colors">{payment.id}</span>
                  </div>

                  {/* Client & Package */}
                  <div className="col-span-3">
                    <h4 className="font-black text-white text-lg group-hover:text-[#82c91e] transition-colors">{payment.client}</h4>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">{payment.package}</p>
                  </div>

                  {/* Amount & Method */}
                  <div className="col-span-2 flex justify-between lg:block items-center">
                    <span className="lg:hidden text-gray-500 text-sm font-bold">المبلغ:</span>
                    <div>
                      <span className="font-black text-white text-lg block">{payment.amount}</span>
                      <span className="text-[10px] font-bold text-gray-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 mt-1 inline-block uppercase tracking-wider">{payment.method}</span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 lg:text-center flex justify-between lg:block items-center">
                    <span className="lg:hidden text-gray-500 text-sm font-bold">التاريخ:</span>
                    <span className="text-gray-400 text-sm font-bold">{payment.date}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-3 flex lg:justify-end justify-between items-center">
                    <span className="lg:hidden text-gray-500 text-sm font-bold">الحالة:</span>
                    {payment.status === "completed" ? (
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#82c91e]/10 text-[#82c91e] text-sm font-black border border-[#82c91e]/20 shadow-[0_0_15px_rgba(130,201,30,0.1)]">
                        <CheckCircle2 className="w-4 h-4" /> مكتملة
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-400 text-sm font-black border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                        <Clock className="w-4 h-4" /> قيد المراجعة
                      </span>
                    )}
                  </div>
                </motion.div>
              )))}
            </div>

          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {packageToDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setPackageToDelete(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#1a1f1a] border border-red-500/20 rounded-[32px] p-8 shadow-2xl overflow-hidden text-center"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-3">حذف الباقة التدريبية</h3>
              <p className="text-gray-400 font-medium mb-8">
                هل أنت متأكد من رغبتك في حذف هذه الباقة؟ لا يمكن التراجع عن هذا الإجراء وسيتم إخفاؤها عن المتدربين.
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => !isDeleting && setPackageToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => packageToDelete && handleDeletePackage(packageToDelete)}
                  disabled={isDeleting}
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-colors shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? "جاري الحذف..." : "نعم، احذف الباقة"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Package Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#1a1f1a] border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#82c91e]/10 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-2xl font-black text-white">{editingPackageId ? "تعديل الباقة التدريبية" : "إضافة باقة جديدة"}</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddPackage} className="relative z-10 flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                  {/* العمود الأول */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">اسم الباقة</label>
                  <input 
                    type="text" 
                    required
                    value={newPackage.name}
                    onChange={e => setNewPackage({...newPackage, name: e.target.value})}
                    placeholder="مثال: الباقة الشاملة المتقدمة"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#82c91e]/50 focus:bg-black/60 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2">السعر الشهري (د.ع)</label>
                  <input 
                    type="text" 
                    required
                    value={newPackage.price}
                    onChange={e => setNewPackage({...newPackage, price: e.target.value})}
                    placeholder="مثال: 75,000"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#82c91e]/50 focus:bg-black/60 transition-all font-medium font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => setNewPackage({...newPackage, hasNutrition: !newPackage.hasNutrition})}
                    className={cn(
                      "cursor-pointer border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all text-center",
                      newPackage.hasNutrition 
                        ? "bg-[#82c91e]/10 border-[#82c91e]/30 text-[#82c91e]" 
                        : "bg-black/40 border-white/5 text-gray-500 hover:bg-white/5"
                    )}
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    <span className="text-sm font-bold">تتضمن تغذية</span>
                  </div>
                  
                  <div 
                    onClick={() => setNewPackage({...newPackage, popular: !newPackage.popular})}
                    className={cn(
                      "cursor-pointer border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all text-center",
                      newPackage.popular 
                        ? "bg-orange-500/10 border-orange-500/30 text-orange-500" 
                        : "bg-black/40 border-white/5 text-gray-500 hover:bg-white/5"
                    )}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-sm font-bold">الأكثر طلباً 🔥</span>
                  </div>
                </div>

                  </div>
                  
                  {/* العمود الثاني */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-400 mb-2">مميزات إضافية</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      value={newFeatureText}
                      onChange={e => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newFeatureText.trim()) {
                            setNewPackage({...newPackage, features: [...newPackage.features, newFeatureText.trim()]});
                            setNewFeatureText("");
                          }
                        }
                      }}
                      placeholder="اكتب الميزة واضغط Enter"
                      className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-[#82c91e]/50 focus:bg-black/60 transition-all font-medium"
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (newFeatureText.trim()) {
                          setNewPackage({...newPackage, features: [...newPackage.features, newFeatureText.trim()]});
                          setNewFeatureText("");
                        }
                      }}
                      className="px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
                    >
                      إضافة
                    </button>
                  </div>
                  {newPackage.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newPackage.features.map((f, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300">
                          {f}
                          <button type="button" onClick={() => setNewPackage({...newPackage, features: newPackage.features.filter((_, idx) => idx !== i)})} className="text-gray-500 hover:text-red-400 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 bg-white/5 border border-white/10 p-5 rounded-2xl">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setNewPackage({...newPackage, hasChat: !newPackage.hasChat})}>
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", newPackage.hasChat ? "bg-[#82c91e]/20" : "bg-black/50 border border-white/10")}>
                        <MessageCircle className={cn("w-5 h-5", newPackage.hasChat ? "text-[#82c91e]" : "text-gray-500")} />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">ميزة المحادثة</h4>
                        <p className="text-xs text-gray-400">السماح للمشتركين بالتواصل معك</p>
                      </div>
                    </div>
                    <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", newPackage.hasChat ? "bg-[#82c91e]" : "bg-white/10")}>
                      <div className={cn("w-4 h-4 rounded-full bg-white transition-transform", newPackage.hasChat ? "translate-x-0" : "-translate-x-6")} />
                    </div>
                  </div>

                  {newPackage.hasChat && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-xs font-bold text-gray-400 mb-2">أيام التواصل</label>
                        <div 
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setIsDaysDropdownOpen(!isDaysDropdownOpen);
                            setIsHoursDropdownOpen(false);
                          }}
                        >
                          <span>{newPackage.chatDays}</span>
                          <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isDaysDropdownOpen ? "rotate-180" : "")} />
                        </div>
                        
                        <AnimatePresence>
                          {isDaysDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full mt-2 w-full bg-[#111] border border-white/10 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar"
                            >
                              {["يومياً", "6 أيام في الأسبوع", "5 أيام في الأسبوع", "4 أيام في الأسبوع", "3 أيام في الأسبوع", "يومين في الأسبوع", "يوم واحد في الأسبوع", "في أيام التدريب فقط", "حسب الحاجة", "مرتين في الشهر", "مرة في الشهر"].map(option => (
                                <div 
                                  key={option}
                                  className={cn(
                                    "px-4 py-3 text-sm cursor-pointer transition-colors",
                                    newPackage.chatDays === option ? "bg-[#82c91e]/20 text-[#82c91e] font-bold" : "text-gray-300 hover:bg-white/5 hover:text-white"
                                  )}
                                  onClick={() => {
                                    setNewPackage({...newPackage, chatDays: option});
                                    setIsDaysDropdownOpen(false);
                                  }}
                                >
                                  {option}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <div className="relative">
                        <label className="block text-xs font-bold text-gray-400 mb-2">ساعات التواصل</label>
                        <div 
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm cursor-pointer flex items-center justify-between"
                          onClick={() => {
                            setIsHoursDropdownOpen(!isHoursDropdownOpen);
                            setIsDaysDropdownOpen(false);
                          }}
                        >
                          <span>{newPackage.chatHours === "مفتوح" ? "مفتوح (24 ساعة)" : newPackage.chatHours}</span>
                          <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isHoursDropdownOpen ? "rotate-180" : "")} />
                        </div>

                        <AnimatePresence>
                          {isHoursDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full mt-2 w-full bg-[#111] border border-white/10 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar"
                            >
                              {["مفتوح", "12 ساعة يومياً", "8 ساعات يومياً", "4 ساعات يومياً", "ساعتين يومياً", "ساعة واحدة يومياً", "في أوقات الدوام الرسمي", "صباحاً فقط", "مساءً فقط"].map(option => (
                                <div 
                                  key={option}
                                  className={cn(
                                    "px-4 py-3 text-sm cursor-pointer transition-colors",
                                    newPackage.chatHours === option ? "bg-[#82c91e]/20 text-[#82c91e] font-bold" : "text-gray-300 hover:bg-white/5 hover:text-white"
                                  )}
                                  onClick={() => {
                                    setNewPackage({...newPackage, chatHours: option});
                                    setIsHoursDropdownOpen(false);
                                  }}
                                >
                                  {option === "مفتوح" ? "مفتوح (24 ساعة)" : option}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#82c91e] text-[#1a1f1a] font-black text-lg hover:bg-[#94d82d] transition-colors shadow-[0_0_20px_rgba(130,201,30,0.2)]"
            >
              {editingPackageId ? "حفظ التعديلات" : "إضافة الباقة الآن"}
            </button>
          </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
