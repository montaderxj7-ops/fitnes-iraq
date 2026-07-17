'use client';

import { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search, Plus, X, Apple } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addFoodItem } from '@/actions/nutrition';
import { calculateMacrosAction } from '@/actions/ai';
import toast from 'react-hot-toast';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients?: string | null;
  mediaUrl?: string | null;
}

interface FoodLibraryProps {
  foodItems: FoodItem[];
  onAddFood: (food: FoodItem) => void;
}

function DraggableFood({ food }: { food: FoodItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lib-food-${food.id}`,
    data: { type: 'FoodLibraryItem', food }
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
        "p-3 rounded-xl bg-black/40 border border-white/10 hover:border-blue-500/50 transition-all cursor-grab active:cursor-grabbing flex items-center gap-3",
        isDragging && "opacity-50 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-50 relative"
      )}
    >
      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
        <Apple className="w-6 h-6 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-white truncate">{food.name}</h4>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-md">
            {food.calories} سعرة
          </span>
          <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded-md">
            P: {food.protein}g
          </span>
          <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-md">
            C: {food.carbs}g
          </span>
          <span className="text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md">
            F: {food.fats}g
          </span>
        </div>
        {food.ingredients && (
          <p className="text-[10px] text-gray-500 mt-1 truncate">{food.ingredients}</p>
        )}
      </div>
    </div>
  );
}

export function FoodLibrary({ foodItems, onAddFood }: FoodLibraryProps) {
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  interface ManualIngredient {
    id: string;
    name: string;
    amount: string;
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  }

  const [ingredients, setIngredients] = useState<ManualIngredient[]>([
    { id: Math.random().toString(), name: '', amount: '100', calories: '', protein: '', carbs: '', fats: '' }
  ]);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [libraryAmount, setLibraryAmount] = useState('100');

  const totalCalories = ingredients.reduce((acc, curr) => acc + (parseFloat(curr.calories) || 0), 0).toFixed(1).replace(/\.0$/, '');
  const totalProtein = ingredients.reduce((acc, curr) => acc + (parseFloat(curr.protein) || 0), 0).toFixed(1).replace(/\.0$/, '');
  const totalCarbs = ingredients.reduce((acc, curr) => acc + (parseFloat(curr.carbs) || 0), 0).toFixed(1).replace(/\.0$/, '');
  const totalFats = ingredients.reduce((acc, curr) => acc + (parseFloat(curr.fats) || 0), 0).toFixed(1).replace(/\.0$/, '');

  const updateIng = (id: string, field: keyof ManualIngredient, value: string) => {
    setIngredients(prev => prev.map(ing => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  const addBlankIng = () => {
    setIngredients(prev => [...prev, { id: Math.random().toString(), name: '', amount: '100', calories: '', protein: '', carbs: '', fats: '' }]);
  };

  const removeIng = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const handleAddFromLibrary = () => {
    const food = foodItems.find(f => f.id === selectedFoodId);
    if (food) {
      const ratio = (parseFloat(libraryAmount) || 100) / 100;
      setIngredients(prev => [...prev, {
        id: Math.random().toString(),
        name: food.name,
        amount: libraryAmount,
        calories: (food.calories * ratio).toFixed(1).replace(/\.0$/, ''),
        protein: (food.protein * ratio).toFixed(1).replace(/\.0$/, ''),
        carbs: (food.carbs * ratio).toFixed(1).replace(/\.0$/, ''),
        fats: (food.fats * ratio).toFixed(1).replace(/\.0$/, '')
      }]);
      setSelectedFoodId('');
      setLibraryAmount('100');
    }
  };
  const [isCalculatingAI, setIsCalculatingAI] = useState(false);

  const handleCalculateAI = async () => {
    const validIngredients = ingredients.filter(i => i.name.trim() !== '' && parseFloat(i.amount) > 0);
    if (validIngredients.length === 0) {
      toast.error('يرجى إضافة مكونات بكميات صالحة أولاً');
      return;
    }
    
    setIsCalculatingAI(true);
    const loadingToast = toast.loading('جاري حساب الماكروز بالذكاء الاصطناعي...');
    
    const res = await calculateMacrosAction(validIngredients.map(i => ({
      name: i.name,
      amount: parseFloat(i.amount) || 0
    })));

    if (res.success && res.macros) {
      setIngredients(prev => prev.map(ing => {
        const index = validIngredients.findIndex(v => v.id === ing.id);
        if (index !== -1 && res.macros[index]) {
          const aiMacro = res.macros[index];
          return {
            ...ing,
            calories: (aiMacro.calories || 0).toString(),
            protein: (aiMacro.protein || 0).toString(),
            carbs: (aiMacro.carbs || 0).toString(),
            fats: (aiMacro.fats || 0).toString()
          };
        }
        return ing;
      }));
      toast.success('تم الحساب بنجاح!', { id: loadingToast });
    } else {
      toast.error(res.error || 'فشل في حساب الماكروز', { id: loadingToast });
    }
    
    setIsCalculatingAI(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    setIsSubmitting(true);
    const res = await addFoodItem({
      name: newName,
      calories: parseFloat(totalCalories) || 0,
      protein: parseFloat(totalProtein) || 0,
      carbs: parseFloat(totalCarbs) || 0,
      fats: parseFloat(totalFats) || 0,
      ingredients: ingredients.filter(i => i.name.trim() !== '').map(i => `${i.amount}g ${i.name}`).join(' + '),
    });
    if (res.success && res.foodItem) {
      toast.success('تمت إضافة الصنف للمكتبة بنجاح');
      onAddFood(res.foodItem);
      setIsModalOpen(false);
      setNewName('');
      setIngredients([{ id: Math.random().toString(), name: '', amount: '100', calories: '', protein: '', carbs: '', fats: '' }]);
    } else {
      toast.error('حدث خطأ أثناء إضافة الصنف');
    }
    setIsSubmitting(false);
  };

  const filteredFoods = foodItems.filter(f => f.name.includes(search));

  return (
    <div className="flex flex-col h-full bg-[#111] border border-white/5 rounded-[2rem] overflow-hidden">
      <div className="p-5 border-b border-white/5">
        <h2 className="text-xl font-bold text-white mb-4">مكتبة الأطعمة</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="w-5 h-5 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن طعام..."
            className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
        {filteredFoods.length > 0 ? (
          filteredFoods.map(f => (
            <DraggableFood key={f.id} food={f} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-10 text-sm">
            لا توجد أطعمة تطابق بحثك.
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <button 
          onClick={() => {
            setIngredients([]);
            setIsModalOpen(true);
          }}
          className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-blue-400 hover:border-blue-500/50 transition-colors flex items-center justify-center gap-2 text-sm font-bold"
        >
          <Plus className="w-4 h-4" />
          إضافة صنف للمكتبة
        </button>
      </div>

      {/* Add Food Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20 shrink-0">
              <h3 className="text-lg font-bold text-white">إضافة صنف أو بناء وجبة</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-1.5">اسم الصنف الغذائي أو الوجبة</label>
                  <input 
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: وجبة شوفان مع الموز"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>

                {/* Recipe Builder Section */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">المكونات</h4>
                    <p className="text-xs text-gray-400 mb-3">يمكنك إدخال المكونات يدوياً أو استيرادها من المكتبة</p>
                    
                    <div className="space-y-3">
                      {ingredients.map((ing) => (
                         <div key={ing.id} className="p-3 bg-black/40 border border-white/10 rounded-xl relative group">
                           {ingredients.length > 1 && (
                             <button type="button" onClick={() => removeIng(ing.id)} className="absolute top-2 left-2 text-red-500 hover:text-red-400"><X className="w-4 h-4"/></button>
                           )}
                           <div className="grid grid-cols-3 gap-2 mt-2 md:mt-0">
                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-gray-400 mb-1">اسم المكون</label>
                                <input value={ing.name} onChange={(e) => updateIng(ing.id, 'name', e.target.value)} placeholder="مثال: صدر دجاج" className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500/50" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 mb-1">الكمية (g)</label>
                                <input type="number" min="0" step="0.1" value={ing.amount} onChange={(e) => updateIng(ing.id, 'amount', e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500/50" />
                              </div>
                           </div>
                         </div>
                      ))}
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 mt-4">
                      <button type="button" onClick={addBlankIng} className="flex-1 py-2 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/50 transition-colors text-xs font-bold">+ إضافة مكون يدوياً</button>
                      
                      <div className="flex-1 flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
                        <select 
                          value={selectedFoodId}
                          onChange={(e) => setSelectedFoodId(e.target.value)}
                          className="flex-1 bg-transparent text-white text-xs focus:outline-none px-1"
                        >
                          <option value="" className="text-black">استيراد من المكتبة...</option>
                          {foodItems.map(f => (
                            <option key={f.id} value={f.id} className="text-black">{f.name}</option>
                          ))}
                        </select>
                        <input 
                          type="number"
                          min="1"
                          placeholder="الكمية(g)"
                          value={libraryAmount}
                          onChange={(e) => setLibraryAmount(e.target.value)}
                          className="w-16 bg-black/50 border border-white/10 rounded-lg px-2 text-white text-xs focus:outline-none text-center"
                        />
                        <button 
                          type="button"
                          onClick={handleAddFromLibrary}
                          disabled={!selectedFoodId}
                          className="bg-blue-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-blue-600 disabled:opacity-50"
                        >
                          إدراج
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button 
                    type="button" 
                    onClick={handleCalculateAI}
                    disabled={isCalculatingAI}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50"
                  >
                    <span className="text-xl">✨</span>
                    {isCalculatingAI ? 'جاري الحساب...' : 'حساب الماكروز بالذكاء الاصطناعي'}
                  </button>
                </div>

                {/* Totals */}
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                  <h4 className="text-sm font-bold text-blue-400 mb-3 text-center">إجمالي الماكروز للوجبة أو الصنف</h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <span className="block text-lg md:text-xl font-black text-white">{totalCalories}</span>
                      <span className="text-[10px] text-gray-400">سعرة</span>
                    </div>
                    <div>
                      <span className="block text-lg md:text-xl font-black text-white">{totalProtein}</span>
                      <span className="text-[10px] text-gray-400">بروتين</span>
                    </div>
                    <div>
                      <span className="block text-lg md:text-xl font-black text-white">{totalCarbs}</span>
                      <span className="text-[10px] text-gray-400">كارب</span>
                    </div>
                    <div>
                      <span className="block text-lg md:text-xl font-black text-white">{totalFats}</span>
                      <span className="text-[10px] text-gray-400">دهون</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddSubmit}
                disabled={isSubmitting || !newName}
                className="flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ الوجبة/الصنف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
