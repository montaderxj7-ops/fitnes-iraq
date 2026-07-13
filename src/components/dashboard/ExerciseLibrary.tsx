'use client';

import { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search, PlayCircle, Plus, X, UploadCloud, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addExercise } from '@/actions/workouts';
import toast from 'react-hot-toast';

interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  defaultSets: number;
  defaultReps: number;
  mediaUrl?: string | null;
}

interface ExerciseLibraryProps {
  exercises: Exercise[];
  onAddExercise: (ex: Exercise) => void;
}

function DraggableExercise({ exercise }: { exercise: Exercise }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lib-ex-${exercise.id}`,
    data: { exercise }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 rounded-xl bg-black/40 border border-white/10 hover:border-neon/50 transition-all cursor-grab active:cursor-grabbing flex items-center gap-3",
        isDragging && "opacity-50 border-neon shadow-[0_0_15px_rgba(214,248,84,0.3)] z-50 relative"
      )}
    >
      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        <PlayCircle className="w-6 h-6 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white truncate">{exercise.name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold text-neon bg-neon/10 px-2 py-0.5 rounded-full">
            {exercise.targetMuscle}
          </span>
          <span className="text-[10px] text-gray-500 font-medium">
            {exercise.defaultSets} × {exercise.defaultReps}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ExerciseLibrary({ exercises, onAddExercise }: ExerciseLibraryProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('الكل');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('صدر');
  const [newExMediaUrl, setNewExMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filters = ['الكل', 'صدر', 'ظهر', 'أرجل', 'أكتاف', 'ذراع', 'كارديو'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    let file: File | null = null;
    
    if ('dataTransfer' in e) {
      file = e.dataTransfer.files[0];
    } else if (e.target.files) {
      file = e.target.files[0];
    }

    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName) return;
    setIsSubmitting(true);
    const res = await addExercise({
      name: newExName,
      targetMuscle: newExMuscle,
      mediaUrl: newExMediaUrl
    });
    if (res.success && res.exercise) {
      toast.success('تمت إضافة التمرين للمكتبة بنجاح');
      onAddExercise(res.exercise);
      setIsModalOpen(false);
      setNewExName('');
      setNewExMuscle('صدر');
      setNewExMediaUrl('');
    } else {
      toast.error('حدث خطأ أثناء إضافة التمرين');
    }
    setIsSubmitting(false);
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.includes(search) || ex.targetMuscle.includes(search);
    const matchesFilter = filter === 'الكل' || ex.targetMuscle === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col h-full bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h2 className="text-xl font-bold text-white mb-4">مكتبة التمارين</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن تمرين..."
            className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:outline-none focus:border-neon/50 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors",
                filter === f ? "bg-neon text-black" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {filteredExercises.length > 0 ? (
          filteredExercises.map(ex => (
            <DraggableExercise key={ex.id} exercise={ex} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-10 text-sm">
            لا توجد تمارين تطابق بحثك.
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-neon hover:border-neon/50 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
        >
          <Plus className="w-4 h-4" />
          إضافة تمرين للمكتبة
        </button>
      </div>

      {/* Add Exercise Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
              <h3 className="text-lg font-bold text-white">إضافة تمرين جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-1.5">اسم التمرين</label>
                <input 
                  type="text"
                  required
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  placeholder="مثال: بنش برس مستوي"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-neon/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">العضلة المستهدفة</label>
                <div className="flex flex-wrap gap-2">
                  {filters.filter(f => f !== 'الكل').map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setNewExMuscle(f)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        newExMuscle === f 
                          ? "bg-neon text-black border-neon shadow-[0_0_10px_rgba(214,248,84,0.3)]" 
                          : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">الفيديو/الصورة (اختياري)</label>
                <div 
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center min-h-[120px]",
                    isDragOver ? "border-neon bg-neon/5" : "border-white/10 hover:border-white/20 bg-black/50",
                    newExMediaUrl && "border-neon/50 bg-neon/5"
                  )}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileUpload}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept="image/*,video/*" 
                  />
                  
                  {newExMediaUrl ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neon/20 flex items-center justify-center text-neon">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">تم إرفاق الملف بنجاح</p>
                        <p className="text-xs text-neon mt-0.5 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setNewExMediaUrl(''); }}>إزالة الملف</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className={cn("w-8 h-8 mb-3 transition-colors", isDragOver ? "text-neon" : "text-gray-500")} />
                      <p className="text-sm text-gray-300 font-medium">اسحب وأفلت الملف هنا أو <span className="text-neon cursor-pointer">اختر من جهازك</span></p>
                      <p className="text-xs text-gray-500 mt-1">يدعم الصور والفيديوهات القصيرة (الحد الأقصى 5MB)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-neon text-black font-black hover:bg-[#c4e649] transition-all shadow-[0_0_15px_rgba(214,248,84,0.2)] disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الإضافة...' : 'إضافة للمكتبة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
