'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MealFood {
  id: string; // unique id for this assignment
  foodId: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface NutritionMeal {
  id: string;
  name: string;
  foods: MealFood[];
}

interface NutritionDay {
  id: string;
  name: string;
  meals: NutritionMeal[];
}

interface NutritionPlanBuilderProps {
  days: NutritionDay[];
  onUpdateFood: (dayId: string, mealId: string, foodId: string, value: string) => void;
  onRemoveFood: (dayId: string, mealId: string, foodId: string) => void;
  onAddMeal: (dayId: string) => void;
  onAddDay: () => void;
}

function SortableFoodItem({ mf, dayId, mealId, onUpdate, onRemove }: { mf: MealFood, dayId: string, mealId: string, onUpdate: any, onRemove: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: mf.id,
    data: { type: 'MealFood', food: mf, dayId, mealId }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-black/30 border border-white/5 rounded-xl p-3 flex items-center gap-3 relative group",
        isDragging && "opacity-50 z-50 border-blue-500"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-white transition-colors">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0 flex items-center justify-between">
        <div className="truncate pr-2">
          <h5 className="text-sm font-bold text-white truncate">{mf.name}</h5>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-gray-400">{mf.calories} kcal</span>
            <span className="text-[10px] text-gray-500">P:{mf.protein} C:{mf.carbs} F:{mf.fats}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">الكمية</span>
            <input 
              type="text" 
              value={mf.amount}
              onChange={(e) => onUpdate(dayId, mealId, mf.id, e.target.value)}
              placeholder="مثال: 100g"
              className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-center text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>
          
          <button 
            onClick={() => onRemove(dayId, mealId, mf.id)}
            className="p-1.5 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MealDroppable({ meal, dayId, onUpdate, onRemove }: { meal: NutritionMeal, dayId: string, onUpdate: any, onRemove: any }) {
  const { setNodeRef, isOver } = useDroppable({
    id: meal.id,
    data: { type: 'NutritionMeal', mealId: meal.id, dayId }
  });

  const totalCalories = meal.foods.reduce((acc, curr) => acc + curr.calories, 0);

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "border rounded-xl p-3 transition-all duration-300 flex flex-col mb-3",
        isOver 
          ? "border-dashed border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.15)]" 
          : "border-solid border-white/10 bg-black/20"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-white">{meal.name}</h4>
        <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-1 rounded-md">{totalCalories.toFixed(0)} سعرة</span>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <SortableContext items={meal.foods.map(f => f.id)} strategy={verticalListSortingStrategy}>
          {meal.foods.map(mf => (
            <SortableFoodItem 
              key={mf.id} 
              mf={mf} 
              dayId={dayId} 
              mealId={meal.id} 
              onUpdate={onUpdate} 
              onRemove={onRemove} 
            />
          ))}
        </SortableContext>
        
        {meal.foods.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-600 border border-dashed border-white/5 rounded-lg py-4">
            اسحب الأطعمة وأفلتها في هذه الوجبة
          </div>
        )}
      </div>
    </div>
  );
}

function DayCard({ day, onUpdate, onRemove, onAddMeal }: { day: NutritionDay, onUpdate: any, onRemove: any, onAddMeal: any }) {
  const [isExpanded, setIsExpanded] = useState(true);

  let dayCalories = 0;
  let dayProtein = 0;
  let dayCarbs = 0;
  let dayFats = 0;

  day.meals.forEach(meal => {
    meal.foods.forEach(food => {
      dayCalories += food.calories;
      dayProtein += food.protein;
      dayCarbs += food.carbs;
      dayFats += food.fats;
    });
  });

  return (
    <div className="border border-white/5 rounded-2xl bg-[#111] overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
          <h3 className="text-white font-bold">{day.name}</h3>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-gray-400 bg-black/50 px-2 py-1 rounded-md">{dayCalories.toFixed(0)} kcal</span>
          <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-md">{dayProtein.toFixed(0)}g P</span>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-white/5 bg-[#0a0a0a]">
          {day.meals.map(meal => (
            <MealDroppable 
              key={meal.id} 
              meal={meal} 
              dayId={day.id} 
              onUpdate={onUpdate} 
              onRemove={onRemove} 
            />
          ))}

          <button 
            onClick={() => onAddMeal(day.id)}
            className="w-full py-3 rounded-xl border border-dashed border-white/10 text-gray-500 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-sm font-bold flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة وجبة جديدة
          </button>
        </div>
      )}
    </div>
  );
}

export function NutritionPlanBuilder({ days, onUpdateFood, onRemoveFood, onAddMeal, onAddDay }: NutritionPlanBuilderProps) {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] rounded-[2rem] overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-white/5 bg-[#111]">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">الخطة الغذائية</h2>
          <p className="text-xs text-gray-400">اسحب الأطعمة إلى الوجبات لتكوين نظام غذائي للمشترك</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="grid grid-cols-1 gap-6">
          {days.map(day => (
            <DayCard 
              key={day.id} 
              day={day} 
              onUpdate={onUpdateFood} 
              onRemove={onRemoveFood} 
              onAddMeal={onAddMeal}
            />
          ))}

          <div 
            onClick={onAddDay}
            className="border-2 border-dashed border-white/10 rounded-2xl p-4 min-h-[100px] flex flex-col items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">إضافة يوم جديد</span>
          </div>
        </div>
      </div>
    </div>
  );
}
