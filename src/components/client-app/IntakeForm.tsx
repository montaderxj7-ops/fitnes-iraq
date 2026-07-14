import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, ListChecks, Hash, Type, AlignLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IntakeQuestion } from './ClientAppFlow';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface IntakeFormProps {
  coach: {
    primaryColor: string;
    intakeQuestions: IntakeQuestion[];
  };
  onComplete: (data: any) => void;
}

export function IntakeForm({ coach, onComplete }: IntakeFormProps) {
  const { t, dir } = useLanguage();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const questions = coach.intakeQuestions || [];
  const currentQuestion = questions[step];
  const isLastStep = step === questions.length - 1;
  
  if (!currentQuestion) return null;

  // Select icon dynamically based on question type
  const getIconForType = (type: string) => {
    switch(type) {
      case 'number': return Hash;
      case 'textarea': return AlignLeft;
      case 'select': return ListChecks;
      default: return Type;
    }
  };
  
  const CurrentIcon = getIconForType(currentQuestion.type);

  const handleNext = () => {
    if (isLastStep) {
      onComplete(formData);
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  };

  return (
    <div className="min-h-full p-6 relative bg-[#050505] text-white flex flex-col overflow-x-hidden">
      {/* Background Glow */}
      <motion.div 
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] blur-[120px] pointer-events-none rounded-full"
        style={{ backgroundColor: coach.primaryColor }}
      />
      
      <div className="z-10 max-w-md w-full mx-auto flex-1 flex flex-col pt-2">
        {/* Header & Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={handlePrev}
              className={cn(
                "w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-95",
                step === 0 ? "opacity-0 pointer-events-none" : "opacity-100"
              )}
            >
              {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-gray-400" /> : <ArrowLeft className="w-5 h-5 text-gray-400" />}
            </button>
            <span className="text-sm font-bold text-gray-400">
              {t('intake.step', { current: (step + 1).toString(), total: questions.length.toString() })}
            </span>
          </div>

          <div className="flex gap-2">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden relative"
              >
                <motion.div 
                  className="absolute inset-y-0 right-0 h-full rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: i <= step ? '100%' : '0%' }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ backgroundColor: coach.primaryColor, boxShadow: `0 0 10px ${coach.primaryColor}` }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-2">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: `${coach.primaryColor}15`, color: coach.primaryColor }}
                >
                  <CurrentIcon className="w-7 h-7" />
                </div>
              </div>
              
              <div>
                <h3 className="text-3xl font-black mb-2 leading-tight text-white">{currentQuestion.title}</h3>
                <p className="text-gray-400 text-sm">{currentQuestion.desc}</p>
              </div>
              
              <div className="pt-4">
                {currentQuestion.type === 'number' && (
                  <div className="relative group">
                    <div className="relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden focus-within:border-transparent transition-all" style={{ '--tw-ring-color': coach.primaryColor } as any}>
                      <input
                        type="number"
                        value={formData[currentQuestion.id] || ''}
                        onChange={e => setFormData({ ...formData, [currentQuestion.id]: e.target.value })}
                        placeholder={currentQuestion.placeholder}
                        className="w-full bg-transparent px-6 py-5 text-2xl font-bold text-white focus:outline-none transition-all placeholder:text-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        autoFocus
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent focus-within:ring-2 transition-all pointer-events-none" style={{ borderColor: coach.primaryColor }} />
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <div className="relative group">
                    <div className="relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden focus-within:border-transparent transition-all" style={{ '--tw-ring-color': coach.primaryColor } as any}>
                      <input
                        type="text"
                        value={formData[currentQuestion.id] || ''}
                        onChange={e => setFormData({ ...formData, [currentQuestion.id]: e.target.value })}
                        placeholder={currentQuestion.placeholder}
                        className="w-full bg-transparent px-6 py-5 text-xl font-bold text-white focus:outline-none transition-all placeholder:text-gray-700"
                        autoFocus
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent focus-within:ring-2 transition-all pointer-events-none" style={{ borderColor: coach.primaryColor }} />
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'textarea' && (
                  <div className="relative group">
                    <div className="relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden focus-within:border-transparent transition-all" style={{ '--tw-ring-color': coach.primaryColor } as any}>
                      <textarea
                        value={formData[currentQuestion.id] || ''}
                        onChange={e => setFormData({ ...formData, [currentQuestion.id]: e.target.value })}
                        placeholder={currentQuestion.placeholder}
                        rows={4}
                        className="w-full bg-transparent px-6 py-5 text-lg text-white focus:outline-none transition-all placeholder:text-gray-700 resize-none"
                        autoFocus
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-transparent focus-within:ring-2 transition-all pointer-events-none" style={{ borderColor: coach.primaryColor }} />
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'select' && (
                  <div className="space-y-3">
                    {currentQuestion.options?.map(opt => {
                      const isSelected = formData[currentQuestion.id] === opt;
                      return (
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          key={opt}
                          onClick={() => {
                            setFormData({ ...formData, [currentQuestion.id]: opt });
                            setTimeout(handleNext, 400);
                          }}
                          className={cn(
                            `w-full p-5 rounded-2xl border ${dir === 'rtl' ? 'text-right' : 'text-left'} font-bold transition-all flex justify-between items-center group relative overflow-hidden`,
                            isSelected 
                              ? "bg-[#111]" 
                              : "bg-[#111] border-white/5 hover:border-white/20 hover:bg-white/5"
                          )}
                          style={{ 
                            borderColor: isSelected ? coach.primaryColor : undefined,
                            boxShadow: isSelected ? `0 4px 20px -10px ${coach.primaryColor}` : undefined
                          }}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundColor: coach.primaryColor }} />
                          )}
                          <span className="relative z-10" style={{ color: isSelected ? coach.primaryColor : '#fff' }}>{opt}</span>
                          <div 
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all relative z-10",
                              isSelected ? "border-transparent" : "border-gray-600 group-hover:border-gray-400"
                            )}
                            style={{ backgroundColor: isSelected ? coach.primaryColor : 'transparent' }}
                          >
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-black" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pt-8 pb-4">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleNext}
            disabled={!formData[currentQuestion.id] && currentQuestion.type !== 'select'}
            className={cn(
              "w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group",
              (!formData[currentQuestion.id] && currentQuestion.type !== 'select') ? "opacity-30 cursor-not-allowed bg-white/10 text-white" : "hover:brightness-110 shadow-lg text-black"
            )}
            style={{ 
              backgroundColor: (!formData[currentQuestion.id] && currentQuestion.type !== 'select') ? undefined : coach.primaryColor,
              boxShadow: (!formData[currentQuestion.id] && currentQuestion.type !== 'select') ? undefined : `0 10px 30px -10px ${coach.primaryColor}80`
            }}
          >
            {(!formData[currentQuestion.id] && currentQuestion.type !== 'select') ? null : (
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {isLastStep ? t('intake.finish') : t('intake.next')}
              {!isLastStep && (dir === 'rtl' ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />)}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
