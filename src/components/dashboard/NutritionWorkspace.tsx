'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Save, Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { FoodLibrary } from './FoodLibrary';
import { NutritionPlanBuilder } from './NutritionPlanBuilder';
import { saveNutritionPlan, getAllCoachNutritionPlans, getNutritionPlanById } from '@/actions/nutrition';
import { ClonePlanModal } from './ClonePlanModal';

interface NutritionWorkspaceProps {
  clientId: string;
  initialFoods: any[];
  initialPlan?: any;
  onClose: () => void;
}

export function NutritionWorkspace({ clientId, initialFoods, initialPlan, onClose }: NutritionWorkspaceProps) {
  const [foods, setFoods] = useState(initialFoods);
  const [days, setDays] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFood, setActiveFood] = useState<any | null>(null);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);

  useEffect(() => {
    if (initialPlan && initialPlan.days && initialPlan.days.length > 0) {
      const mappedDays = initialPlan.days.map((d: any) => ({
        id: d.id || uuidv4(),
        name: d.name,
        meals: d.meals.map((m: any) => ({
          id: m.id || uuidv4(),
          name: m.name,
          foods: m.foods.map((mf: any) => ({
            id: mf.id || uuidv4(),
            foodId: mf.foodId,
            name: mf.food?.name || 'صنف',
            amount: mf.amount || '100g',
            calories: mf.food?.calories || 0,
            protein: mf.food?.protein || 0,
            carbs: mf.food?.carbs || 0,
            fats: mf.food?.fats || 0,
            ingredients: mf.food?.ingredients || '',
          }))
        }))
      }));
      setDays(mappedDays);
    } else {
      setDays([
        { 
          id: uuidv4(), 
          name: 'اليوم الأول', 
          meals: [
            { id: uuidv4(), name: 'وجبة 1', foods: [] },
            { id: uuidv4(), name: 'وجبة 2', foods: [] },
            { id: uuidv4(), name: 'وجبة 3', foods: [] },
          ] 
        }
      ]);
    }
  }, [initialPlan]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: any) => {
    const { active } = event;
    if (active.data.current?.type === 'FoodLibraryItem') {
      setActiveFood(active.data.current?.food);
    } else if (active.data.current?.type === 'MealFood') {
      setActiveFood(active.data.current?.food);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveFood(null);

    if (!over) return;

    if (active.data.current?.type === 'FoodLibraryItem') {
      const food = active.data.current?.food;
      let mealId = null;
      let dayId = null;
      
      if (over.data.current?.type === 'NutritionMeal') {
        mealId = over.id;
        dayId = over.data.current?.dayId;
      } else if (over.data.current?.type === 'MealFood') {
        mealId = over.data.current?.mealId;
        dayId = over.data.current?.dayId;
      }

      if (food && mealId && dayId) {
        setDays(prevDays => prevDays.map(day => {
          if (day.id === dayId) {
            return {
              ...day,
              meals: day.meals.map((meal: any) => {
                if (meal.id === mealId) {
                  return {
                    ...meal,
                    foods: [...meal.foods, {
                      id: uuidv4(),
                      foodId: food.id,
                      name: food.name,
                      amount: '100g', // default
                      calories: food.calories,
                      protein: food.protein,
                      carbs: food.carbs,
                      fats: food.fats,
                      ingredients: food.ingredients || ''
                    }]
                  };
                }
                return meal;
              })
            };
          }
          return day;
        }));
      }
    }
  };

  const handleUpdateFood = (dayId: string, mealId: string, foodId: string, value: string) => {
    setDays(prevDays => prevDays.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          meals: day.meals.map((meal: any) => {
            if (meal.id === mealId) {
              return {
                ...meal,
                foods: meal.foods.map((f: any) => f.id === foodId ? { ...f, amount: value } : f)
              };
            }
            return meal;
          })
        };
      }
      return day;
    }));
  };

  const handleRemoveFood = (dayId: string, mealId: string, foodId: string) => {
    setDays(prevDays => prevDays.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          meals: day.meals.map((meal: any) => {
            if (meal.id === mealId) {
              return {
                ...meal,
                foods: meal.foods.filter((f: any) => f.id !== foodId)
              };
            }
            return meal;
          })
        };
      }
      return day;
    }));
  };

  const handleAddDay = () => {
    setDays([...days, { 
      id: uuidv4(), 
      name: `اليوم ${days.length + 1}`, 
      meals: [
        { id: uuidv4(), name: 'وجبة 1', foods: [] },
        { id: uuidv4(), name: 'وجبة 2', foods: [] },
        { id: uuidv4(), name: 'وجبة 3', foods: [] },
      ] 
    }]);
  };

  const handleAddMeal = (dayId: string) => {
    setDays(prevDays => prevDays.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          meals: [...day.meals, { id: uuidv4(), name: `وجبة ${day.meals.length + 1}`, foods: [] }]
        };
      }
      return day;
    }));
  };

  const handleClonePlan = async (planId: string) => {
    const res = await getNutritionPlanById(planId);
    if (res.success && res.plan) {
      const clonedDays = res.plan.days.map((d: any) => ({
        id: uuidv4(),
        name: d.name,
        meals: d.meals.map((m: any) => ({
          id: uuidv4(),
          name: m.name,
          foods: m.foods.map((mf: any) => ({
            id: uuidv4(),
            foodId: mf.foodId,
            name: mf.food?.name || 'صنف',
            amount: mf.amount || '100g',
            calories: mf.food?.calories || 0,
            protein: mf.food?.protein || 0,
            carbs: mf.food?.carbs || 0,
            fats: mf.food?.fats || 0,
          }))
        }))
      }));
      setDays(clonedDays);
      toast.success('تم استنساخ الخطة بنجاح، يمكنك التعديل عليها الآن');
    } else {
      toast.error('حدث خطأ أثناء استنساخ الخطة');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const planData = { days };
    const res = await saveNutritionPlan(clientId, planData);
    if (res.success) {
      toast.success("تم حفظ النظام الغذائي بنجاح!");
      onClose();
    } else {
      toast.error("حدث خطأ أثناء الحفظ");
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="h-16 border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-[#111]">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-white">مساحة عمل النظام الغذائي</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCloneModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-colors text-sm font-bold"
          >
            <Copy className="w-4 h-4" />
            استنساخ خطة
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-500 text-white font-black hover:bg-blue-600 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "جاري الحفظ..." : "حفظ النظام"}
          </button>
        </div>
      </div>

      {/* Workspace Area */}
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          <div className="lg:col-span-2 min-h-0">
            <NutritionPlanBuilder 
              days={days} 
              onUpdateFood={handleUpdateFood} 
              onRemoveFood={handleRemoveFood} 
              onAddDay={handleAddDay}
              onAddMeal={handleAddMeal}
            />
          </div>
          <div className="min-h-0">
            <FoodLibrary 
              foodItems={foods} 
              onAddFood={(newFood) => setFoods([newFood, ...foods])}
            />
          </div>
        </div>

        <DragOverlay>
          {activeFood ? (
            <div className="p-3 rounded-xl bg-black/80 border border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-3 w-64 rotate-3 opacity-90 backdrop-blur-sm">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{activeFood.name}</h4>
                <span className="text-[10px] text-blue-400">{activeFood.calories} kcal</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ClonePlanModal 
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        type="nutrition"
        fetchPlans={getAllCoachNutritionPlans}
        onSelectPlan={handleClonePlan}
      />
    </div>
  );
}

