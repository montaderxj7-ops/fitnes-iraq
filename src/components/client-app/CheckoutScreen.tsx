import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, ShieldCheck, Wallet, Landmark, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CheckoutScreenProps {
  coach: {
    primaryColor: string;
    paymentMethods: {
      id: string;
      name: string;
      details: string;
    }[];
  };
  selectedPackage: {
    name: string;
    price: string;
  };
  onSuccess: (methodName: string) => void;
  onBack: () => void;
}

export function CheckoutScreen({ coach, selectedPackage, onSuccess, onBack }: CheckoutScreenProps) {
  const { t, dir } = useLanguage();
  const [step, setStep] = useState<'selection' | 'details'>('selection');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const handleNextStep = () => {
    if (!selectedPayment) return;
    setStep('details');
  };

  const handleConfirm = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      const method = paymentMethods.find(m => m.id === selectedPayment);
      onSuccess(method?.name || 'غير محدد');
    }, 2000);
  };

  const paymentMethods = coach.paymentMethods?.map(p => {
    let iconUrl = '';
    if (p.id === 'zainCash' || p.name.includes('زين')) iconUrl = 'https://www.google.com/s2/favicons?sz=64&domain_url=zaincash.iq';
    else if (p.id === 'fib' || p.name.includes('FIB')) iconUrl = 'https://www.google.com/s2/favicons?sz=64&domain_url=fib.iq';
    else if (p.id === 'asiaHawala' || p.name.includes('آسيا')) iconUrl = 'https://www.google.com/s2/favicons?sz=64&domain_url=asiacell.com';
    else if (p.id === 'masterCard' || p.name.toLowerCase().includes('master')) iconUrl = 'https://www.google.com/s2/favicons?sz=64&domain_url=mastercard.com';
    else if (p.id === 'visaCard' || p.name.toLowerCase().includes('visa')) iconUrl = 'https://www.google.com/s2/favicons?sz=64&domain_url=visa.com';

    return {
      id: p.id,
      name: p.name,
      enabled: true,
      icon: iconUrl ? (
        <img src={iconUrl} alt={p.name} className="w-6 h-6 object-contain" />
      ) : (
        <Wallet className="w-6 h-6 text-gray-700" />
      ),
      color: '#ffffff',
      type: 'wallet',
      accountName: '',
      accountNumber: p.details
    };
  }) || [];

  const selectedMethodData = paymentMethods.find(p => p.id === selectedPayment);

  return (
    <div className="min-h-full p-6 relative bg-[#050505] text-white flex flex-col overflow-x-hidden">
      {/* Background Orbs */}
      <motion.div 
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[80%] h-[40%] blur-[80px] pointer-events-none rounded-full"
        style={{ backgroundColor: coach.primaryColor }}
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="z-10 max-w-md w-full mx-auto flex-1 flex flex-col pt-4">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => step === 'details' ? setStep('selection') : onBack()}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group shrink-0"
          >
            {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" /> : <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />}
          </button>
          <motion.div
            initial={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={step}
          >
            <h2 className="text-3xl font-black tracking-tight text-white mb-1">
              {step === 'selection' ? t('checkout.title_selection') : t('checkout.title_details')}
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              {step === 'selection' ? t('checkout.subtitle_selection') : t('checkout.subtitle_details')}
            </p>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'selection' ? (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col"
            >
              <motion.div 
                className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 mb-8 shadow-xl relative overflow-hidden shrink-0"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 blur-[40px] opacity-20 rounded-full" style={{ backgroundColor: coach.primaryColor }} />

                <h3 className="text-xs text-gray-400 font-bold tracking-wider mb-2 uppercase">{t('checkout.order_summary')}</h3>
                <div className="flex justify-between items-center mb-5">
                  <span className="font-black text-xl">{selectedPackage.name}</span>
                  <span className="font-black text-2xl tracking-tight" style={{ color: coach.primaryColor }}>
                    {selectedPackage.price} <span className="text-sm font-bold text-gray-500">IQD</span>
                  </span>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />
                <div className="flex items-center gap-3 text-sm text-gray-300 bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="bg-green-500/20 p-1.5 rounded-full">
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="font-medium">{t('checkout.secure_payment')}</span>
                </div>
              </motion.div>

              <div className="space-y-3 mb-8 flex-1">
                <h3 className="text-xs text-gray-400 font-bold tracking-wider mb-3 uppercase">{t('checkout.choose_payment')}</h3>
                
                {paymentMethods.length > 0 ? paymentMethods.map((method, idx) => {
                  const isSelected = selectedPayment === method.id;
                  return (
                    <motion.button 
                      key={method.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedPayment(method.id)}
                      className={cn(
                        "w-full rounded-[20px] p-4 flex items-center justify-between transition-all duration-300 border relative overflow-hidden group",
                        isSelected ? "bg-white/10 border-white/30" : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                      style={isSelected ? { boxShadow: `0 0 20px ${coach.primaryColor}20`, borderColor: coach.primaryColor } : {}}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: coach.primaryColor }} />
                      )}
                      <div className="flex items-center gap-4 relative z-10">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shrink-0"
                          style={{ backgroundColor: method.color }}
                        >
                          {method.icon}
                        </div>
                        <span className="font-bold text-[15px]">{method.name}</span>
                      </div>
                      <div className={cn(
                        "w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center relative z-10 transition-colors",
                        isSelected ? "border-transparent" : "border-gray-500"
                      )}>
                        {isSelected && <div className="w-full h-full rounded-full" style={{ backgroundColor: coach.primaryColor }} />}
                      </div>
                    </motion.button>
                  );
                }) : (
                   <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 text-gray-400 text-sm">
                     {t('checkout.no_payment')}
                   </div>
                )}
              </div>

              <div className="mt-auto pb-6 relative z-20 shrink-0">
                <motion.button
                  whileTap={selectedPayment ? { scale: 0.96 } : {}}
                  disabled={!selectedPayment}
                  onClick={handleNextStep}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group",
                    !selectedPayment ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"
                  )}
                  style={{ 
                    backgroundColor: coach.primaryColor,
                    color: '#000',
                    boxShadow: selectedPayment ? `0 10px 30px -10px ${coach.primaryColor}80` : 'none'
                  }}
                >
                  {selectedPayment && (
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                  )}
                  <span className="relative z-10">{t('checkout.continue')}</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              {/* Payment Details Form */}
              <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 mb-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white shrink-0 p-2">
                    {selectedMethodData?.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{t('checkout.pay_with', { method: selectedMethodData?.name || '' })}</h3>
                    <p className="text-gray-400 text-sm">{t('checkout.total_amount')} <span dir="ltr">{selectedPackage.price} IQD</span></p>
                  </div>
                </div>

                {(selectedMethodData?.type === 'wallet' || selectedMethodData?.type === 'bank') ? (
                  <div className="space-y-5">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 border-dashed">
                      <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                        {t('checkout.transfer_please')} <strong className="text-white whitespace-nowrap" dir="ltr">{selectedPackage.price} IQD</strong> {selectedMethodData.type === 'wallet' ? t('checkout.to_wallet') : t('checkout.to_bank')}
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center bg-black/50 p-3 rounded-lg border border-white/5">
                          <span className="text-gray-400 text-sm">{t('checkout.account_number')}</span>
                          <span className="font-mono font-bold tracking-wider text-white select-all text-left" dir="ltr">{selectedMethodData.accountNumber || t('checkout.not_specified')}</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/50 p-3 rounded-lg border border-white/5">
                          <span className="text-gray-400 text-sm">{t('checkout.account_name')}</span>
                          <span className="font-bold text-white select-all">{selectedMethodData.accountName || t('checkout.not_specified')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className={`text-xs font-bold text-gray-400 mb-2 block uppercase ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t('checkout.full_name')}</label>
                        <input type="text" placeholder={t('checkout.full_name_placeholder')} className={`w-full bg-[#111] border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-white transition-colors ${dir === 'rtl' ? 'text-right' : 'text-left'}`} />
                      </div>
                      <div>
                        <label className={`text-xs font-bold text-gray-400 mb-2 block uppercase ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t('checkout.operation_number')}</label>
                        <input type="text" dir="ltr" placeholder={t('checkout.operation_placeholder')} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-4 text-left text-sm focus:outline-none focus:border-white transition-colors font-mono" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 mt-2">
                    <div className="relative group">
                      <label className={`text-xs font-bold text-gray-400 mb-2 block px-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t('checkout.card_number')}</label>
                      <div dir="ltr" className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden focus-within:border-transparent transition-all" style={{ '--tw-ring-color': coach.primaryColor } as any}>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <CreditCard className="w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input 
                          type="text" 
                          dir="ltr"
                          placeholder="0000 0000 0000 0000" 
                          className="w-full bg-transparent py-4 pl-12 pr-4 text-left focus:outline-none transition-all font-mono tracking-wider text-white text-base placeholder:text-gray-700" 
                          style={{ WebkitBoxShadow: '0 0 0px 1000px #111 inset', WebkitTextFillColor: 'white' }}
                        />
                        <div className="absolute inset-0 rounded-xl ring-1 ring-transparent focus-within:ring-2 transition-all pointer-events-none" style={{ borderColor: coach.primaryColor }} />
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1 relative group">
                        <label className={`text-xs font-bold text-gray-400 mb-2 block px-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t('checkout.expire_date')}</label>
                        <div dir="ltr" className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden transition-all">
                          <input 
                            type="text" 
                            dir="ltr"
                            placeholder="MM / YY" 
                            className="w-full bg-transparent px-4 py-4 text-center focus:outline-none transition-all font-mono text-white text-lg placeholder:text-gray-700" 
                            style={{ WebkitBoxShadow: '0 0 0px 1000px #111 inset', WebkitTextFillColor: 'white' }}
                          />
                          <div className="absolute inset-0 rounded-xl ring-1 ring-transparent focus-within:ring-2 transition-all pointer-events-none" style={{ borderColor: coach.primaryColor }} />
                        </div>
                      </div>
                      <div className="flex-1 relative group">
                        <label className={`text-xs font-bold text-gray-400 mb-2 block px-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t('checkout.cvv')}</label>
                        <div dir="ltr" className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden transition-all">
                          <input 
                            type="text" 
                            dir="ltr"
                            placeholder="123" 
                            maxLength={4} 
                            className="w-full bg-transparent px-4 py-4 text-center focus:outline-none transition-all font-mono text-white tracking-widest text-lg placeholder:text-gray-700" 
                            style={{ WebkitBoxShadow: '0 0 0px 1000px #111 inset', WebkitTextFillColor: 'white' }}
                          />
                          <div className="absolute inset-0 rounded-xl ring-1 ring-transparent focus-within:ring-2 transition-all pointer-events-none" style={{ borderColor: coach.primaryColor }} />
                        </div>
                      </div>
                    </div>

                    <div className="relative group">
                      <label className={`text-xs font-bold text-gray-400 mb-2 block px-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t('checkout.name_on_card')}</label>
                      <div dir="ltr" className="relative bg-[#111] border border-white/10 rounded-xl overflow-hidden transition-all">
                        <input 
                          type="text" 
                          dir="ltr"
                          placeholder="MOHAMED ALI" 
                          className="w-full bg-transparent px-4 py-4 text-left focus:outline-none transition-all text-white uppercase text-base placeholder:text-gray-700" 
                          style={{ WebkitBoxShadow: '0 0 0px 1000px #111 inset', WebkitTextFillColor: 'white' }}
                        />
                        <div className="absolute inset-0 rounded-xl ring-1 ring-transparent focus-within:ring-2 transition-all pointer-events-none" style={{ borderColor: coach.primaryColor }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-auto pb-6 relative z-20 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={isProcessing}
                  onClick={handleConfirm}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group",
                    isProcessing ? "opacity-50 cursor-not-allowed" : "hover:brightness-110"
                  )}
                  style={{ 
                    backgroundColor: coach.primaryColor,
                    color: '#000',
                    boxShadow: `0 10px 30px -10px ${coach.primaryColor}80`
                  }}
                >
                  {!isProcessing && (
                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {isProcessing ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full" />
                        <span>{t('checkout.processing')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        {t('checkout.confirm')}
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
