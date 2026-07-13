"use client";
import { SparklesComp as Sparkles } from "@/components/ui/sparkles";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { VerticalCutReveal } from "@/components/ui/vertical-cut-reveal";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { Check } from "lucide-react";
import AuthModal from "@/components/AuthModal";

const plans = [
  {
    name: "الباقة الأساسية",
    description: "مثالية للمدربين المبتدئين الذين يبحثون عن انطلاقة احترافية.",
    price: 25,
    yearlyPrice: 100,
    buttonText: "اشترك الآن",
    buttonVariant: "outline" as const,
    popular: false,
    includes: [
      "ميزات الباقة الأساسية:",
      "تطبيق مخصص باسمك وشعارك",
      "إدارة حتى 50 متدرب",
      "جداول تدريبية وغذائية مخصصة",
      "استقبال المدفوعات المحلية",
    ],
  },
  {
    name: "الباقة الاحترافية",
    description: "الخيار الأفضل للمدربين المحترفين لإدارة أعداد كبيرة.",
    price: 50,
    yearlyPrice: 200,
    buttonText: "اشترك الآن",
    buttonVariant: "default" as const,
    popular: true,
    includes: [
      "ميزات الباقة الاحترافية:",
      "تطبيق مخصص باسمك وشعارك",
      "إدارة عدد لا محدود من المتدربين",
      "جداول تدريبية وغذائية مخصصة",
      "استقبال المدفوعات المحلية",
      "محادثات مجدولة وتنبيهات تلقائية",
      "دعم فني على مدار الساعة",
    ],
  }
];

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
  const [selected, setSelected] = useState("0");

  const handleSwitch = (value: string) => {
    setSelected(value);
    onSwitch(value);
  };

  return (
    <div className="flex justify-center" dir="ltr">
      <div className="relative z-10 mx-auto flex w-fit rounded-full bg-black border border-white/10 p-1 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
        {/* Left item in LTR -> Yearly (سنوي) */}
        <button
          onClick={() => handleSwitch("1")}
          className={cn(
            "relative z-10 w-fit h-12 flex-shrink-0 rounded-full sm:px-8 px-6 font-bold transition-all duration-300",
            selected === "1" ? "text-black" : "text-gray-400 hover:text-white"
          )}
        >
          {selected === "1" && (
            <motion.span
              layoutId="switch"
              className="absolute inset-0 rounded-full border border-neon bg-neon shadow-[0_0_15px_rgba(214,248,84,0.4)]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-2 flex-row-reverse">
            سنوي
          </span>
        </button>

        {/* Right item in LTR -> Monthly (شهري) */}
        <button
          onClick={() => handleSwitch("0")}
          className={cn(
            "relative z-10 w-fit h-12 rounded-full sm:px-8 px-6 font-bold transition-all duration-300",
            selected === "0" ? "text-black" : "text-gray-400 hover:text-white"
          )}
        >
          {selected === "0" && (
            <motion.span
              layoutId="switch"
              className="absolute inset-0 rounded-full border border-neon bg-neon shadow-[0_0_15px_rgba(214,248,84,0.4)]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative">شهري</span>
        </button>
      </div>
    </div>
  );
};

const revealVariants = {
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.2,
      duration: 0.6,
    },
  }),
  hidden: {
    filter: "blur(10px)",
    y: -20,
    opacity: 0,
  },
};

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const pricingRef = useRef<HTMLDivElement>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState("");

  const handleSubscribe = (planName: string) => {
    setSelectedPlanName(planName);
    setIsAuthOpen(true);
  };

  const togglePricingPeriod = (value: string) => setIsYearly(Number.parseInt(value) === 1);

  return (
    <>
    <AuthModal 
      isOpen={isAuthOpen} 
      onClose={() => setIsAuthOpen(false)} 
      plan={selectedPlanName} 
      billing={isYearly ? "yearly" : "monthly"} 
    />
    <section
      id="pricing"
      className="w-full py-20 mx-auto relative bg-transparent overflow-x-hidden border-t border-white/5"
      ref={pricingRef}
    >
      {/* Background Sparkles */}
      <TimelineContent
        animationNum={4}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      >
        <Sparkles
          density={1200}
          direction="bottom"
          speed={0.8}
          color="#D6F854"
          className="absolute inset-0 h-full w-full"
        />
      </TimelineContent>

      <TimelineContent
        animationNum={5}
        timelineRef={pricingRef}
        customVariants={revealVariants}
        className="absolute left-0 top-[-200px] w-full h-full flex justify-center pointer-events-none opacity-20"
      >
          <div
            className="h-[800px] w-[1200px] rounded-full"
            style={{
              border: "120px solid #D6F854",
              filter: "blur(100px)",
              WebkitFilter: "blur(100px)",
              opacity: 0.15
            }}
          ></div>
      </TimelineContent>

      <article className="text-center mb-20 pt-12 max-w-3xl mx-auto space-y-4 relative z-30 px-4">
        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
          <VerticalCutReveal
            splitBy="words"
            staggerDuration={0.15}
            staggerFrom="first"
            reverse={true}
            containerClassName="justify-center flex-row flex-wrap gap-x-4"
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 40,
              delay: 0,
            }}
          >
            استثمر في نجاحك
          </VerticalCutReveal>
        </h2>

        <TimelineContent
          as="p"
          animationNum={0}
          timelineRef={pricingRef}
          customVariants={revealVariants}
          className="text-gray-400 text-lg max-w-2xl mx-auto mb-10"
        >
          خطط تسعير شفافة تناسب احتياجاتك. ابدأ بتطوير عملك التدريبي اليوم.
        </TimelineContent>

        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={pricingRef}
          customVariants={revealVariants}
        >
          <PricingSwitch onSwitch={togglePricingPeriod} />
        </TimelineContent>
      </article>

      <div className="grid md:grid-cols-2 max-w-5xl gap-8 py-6 mx-auto px-4 lg:px-0 relative z-20" dir="rtl">
        {plans.map((plan, index) => (
          <TimelineContent
            key={plan.name}
            as="div"
            animationNum={2 + index}
            timelineRef={pricingRef}
            customVariants={revealVariants}
            className="h-full"
          >
            <div
              className={cn(
                "relative text-white rounded-[32px] p-[2px] transition-all duration-500 h-full group",
                plan.popular
                  ? "bg-gradient-to-b from-neon via-neon/20 to-transparent shadow-[0_25px_50px_-15px_rgba(214,248,84,0.25)] z-20 hover:-translate-y-3"
                  : "bg-gradient-to-b from-white/10 to-transparent z-10 hover:-translate-y-2 hover:shadow-2xl"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neon text-black px-6 py-1.5 rounded-full text-sm font-black shadow-[0_0_20px_rgba(214,248,84,0.5)] z-30 tracking-wide">
                  الأكثر طلباً
                </div>
              )}
              
              <div className="bg-gradient-to-b from-[#151515] to-[#0a0a0a] rounded-[30px] h-full p-8 md:p-10 flex flex-col relative overflow-hidden shadow-[inset_0_2px_20px_rgba(255,255,255,0.03)]">
                {/* Subtle inner glow for popular */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-neon/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-neon/20 transition-colors duration-500" />
                )}

                <div className="mb-8 relative z-10">
                  <h3 className="text-3xl font-black mb-3 text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-400 min-h-[40px] leading-relaxed">{plan.description}</p>
                </div>
                
                <div className="flex items-baseline justify-start gap-2 mb-10 relative z-10">
                  <span className="text-5xl font-black text-neon flex items-center">
                    <span className="text-3xl mr-1 opacity-80">$</span>
                    <NumberFlow
                      value={isYearly ? plan.yearlyPrice : plan.price}
                      className="text-5xl font-black text-neon"
                    />
                  </span>
                  <span className="text-gray-400 font-medium">/ {isYearly ? "سنة" : "شهر"}</span>
                </div>

                <div className="space-y-5 pt-8 border-t border-white/5 relative z-10 flex-grow">
                  <h4 className="font-bold text-lg mb-4 text-white">
                    {plan.includes[0]}
                  </h4>
                  <ul className="space-y-4">
                    {plan.includes.slice(1).map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-4"
                      >
                        <div className={cn(
                          "h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          plan.popular ? "bg-neon/20 border border-neon/50 text-neon" : "bg-white/5 border border-white/10 text-gray-400"
                        )}>
                           <Check className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-gray-300 font-medium leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.name)}
                  className={cn(
                    "w-full mt-10 py-5 text-xl rounded-2xl font-black transition-all duration-300 relative z-10 flex items-center justify-center gap-2 group-hover:shadow-lg",
                    plan.popular
                      ? "bg-neon hover:bg-[#c4e649] text-black shadow-[0_0_20px_rgba(214,248,84,0.3)] hover:-translate-y-1"
                      : "bg-[#222] hover:bg-[#333] border border-white/5 text-white hover:-translate-y-1"
                  )}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          </TimelineContent>
        ))}
      </div>
    </section>
    </>
  );
}
