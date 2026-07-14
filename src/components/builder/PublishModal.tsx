"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, CheckCircle2, User, Camera, Link, Dumbbell, AlignLeft } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { publishCoachProfile } from "@/actions/coach";
import { forceLoginCoach } from "@/actions/auth";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  appName: string;
  appLogo?: string | null;
  firstPackage?: {
    name: string;
    price: string;
    hasChat: boolean;
    chatDays: string;
    chatHours: string;
    features: string[];
  };
}

export function PublishModal({ isOpen, onClose, appName, appLogo, firstPackage }: PublishModalProps) {
  const router = useRouter();
  const [coachName, setCoachName] = useState(appName || "");
  const [specialty, setSpecialty] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!coachName.trim() || !specialty.trim()) return;
    
    setIsPublishing(true);
    
    try {
      // Call the server action to save the coach profile
      const result = await publishCoachProfile({
        name: coachName,
        specialty,
        bio,
        instagram,
        image: photoUrl || undefined, // in a real app, this would upload the file to S3/Cloudinary and get a URL
        logo: appLogo || undefined,
        firstPackage: firstPackage
      });

      if (result.success) {
        setIsSuccess(true);
        // Automatically log them in so they don't see the login screen
        await forceLoginCoach();
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isPublishing && !isSuccess ? onClose : undefined}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative"
            >
              {!isSuccess && !isPublishing && (
                <button 
                  onClick={onClose}
                  className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              <div className="p-6 sm:p-8">
                {isSuccess ? (
                  <div className="flex flex-col items-center justify-center text-center py-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.5 }}
                      className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-white mb-2">تم النشر بنجاح!</h2>
                    <p className="text-gray-400">جاري توجيهك إلى لوحة التحكم الفاخرة الخاصة بك...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-black text-white mb-2">الملف الشخصي للكابتن</h2>
                      <p className="text-sm text-gray-400">قم بإضافة صورتك واسمك الاحترافي ليتم عرض تطبيقك في منصة الكباتن.</p>
                    </div>

                    <div className="space-y-6">
                      {/* Photo Upload */}
                      <div className="flex flex-col items-center">
                        <input 
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                        />
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="relative w-32 h-32 rounded-full border-2 border-dashed border-white/20 hover:border-neon/50 bg-black/50 flex flex-col items-center justify-center overflow-hidden group transition-all"
                        >
                          {photoUrl ? (
                            <>
                              <img src={photoUrl} alt="Coach Profile" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white mb-1" />
                                <span className="text-xs text-white">تغيير الصورة</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-neon transition-colors" />
                              </div>
                              <span className="text-xs text-gray-400 font-medium">اختر صورة احترافية</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Name Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1 block">اسم الكابتن الظاهر</label>
                        <div className="relative">
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <User className="w-5 h-5" />
                          </div>
                          <input 
                            type="text"
                            value={coachName}
                            onChange={(e) => setCoachName(e.target.value)}
                            placeholder="مثال: الكابتن أحمد"
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/50 transition-all text-right"
                          />
                        </div>
                      </div>

                      {/* Specialty Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1 block">التخصص</label>
                        <div className="relative">
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Dumbbell className="w-5 h-5" />
                          </div>
                          <input 
                            type="text"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                            placeholder="مثال: كمال أجسام وتغذية"
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/50 transition-all text-right"
                          />
                        </div>
                      </div>

                      {/* Instagram Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1 block">رابط الانستغرام</label>
                        <div className="relative">
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <Link className="w-5 h-5" />
                          </div>
                          <input 
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="https://instagram.com/your.username"
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/50 transition-all text-left dir-ltr"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      {/* Bio Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1 block">نبذة تعريفية قصيرة</label>
                        <div className="relative">
                          <div className="absolute right-4 top-4 text-gray-500">
                            <AlignLeft className="w-5 h-5" />
                          </div>
                          <textarea 
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="اكتب نبذة مختصرة عنك وعن خبراتك لتظهر للمتدربين..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 focus:ring-1 focus:ring-neon/50 transition-all text-right resize-none h-24"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        onClick={handlePublish}
                        disabled={!coachName.trim() || !specialty.trim() || isPublishing}
                        className={cn(
                          "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4",
                          coachName.trim() && specialty.trim() && !isPublishing
                            ? "bg-neon text-black hover:bg-[#c4e649] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(214,248,84,0.3)]"
                            : "bg-white/5 text-gray-500 cursor-not-allowed"
                        )}
                      >
                        {isPublishing ? (
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          "تأكيد ونشر التطبيق 🚀"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
