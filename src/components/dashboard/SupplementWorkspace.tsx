'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { Save, Copy, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { SupplementLibrary } from './SupplementLibrary';
import { SupplementPlanBuilder } from './SupplementPlanBuilder';
import { saveSupplementPlan, getAllCoachSupplementPlans, getSupplementPlanById } from '@/actions/supplements';
import { ClonePlanModal } from './ClonePlanModal';

interface SupplementWorkspaceProps {
  clientId: string;
  initialSupplements: any[];
  initialPlan?: any;
  onClose: () => void;
}

export function SupplementWorkspace({ clientId, initialSupplements, initialPlan, onClose }: SupplementWorkspaceProps) {
  const [supplements, setSupplements] = useState(initialSupplements);
  const [days, setDays] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);

  useEffect(() => {
    if (initialPlan && initialPlan.days && initialPlan.days.length > 0) {
      const mappedDays = initialPlan.days.map((d: any) => ({
        id: d.id || uuidv4(),
        name: d.name,
        items: d.items.map((item: any) => ({
          id: item.id || uuidv4(),
          supplementId: item.supplementId,
          name: item.supplement?.name || 'مكمل',
          amount: item.amount || '1 سكوب',
          timing: item.timing || 'صباحاً',
        }))
      }));
      setDays(mappedDays);
    } else {
      setDays([
        { id: uuidv4(), name: 'اليوم الأول', items: [] },
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
    if (active.data.current?.type === 'SupplementLibraryItem') {
      setActiveItem(active.data.current?.supplement);
    } else if (active.data.current?.type === 'SupplementPlanItem') {
      setActiveItem(active.data.current?.item);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    // Is dragging from library to day or an item inside a day
    if (active.data.current?.type === 'SupplementLibraryItem') {
      const supplement = active.data.current?.supplement;
      let dayId = null;
      
      if (over.data.current?.type === 'SupplementDay') {
        dayId = over.id;
      } else if (over.data.current?.type === 'SupplementPlanItem') {
        dayId = over.data.current?.dayId;
      }

      if (supplement && dayId) {
        setDays(prevDays => prevDays.map(day => {
          if (day.id === dayId) {
            return {
              ...day,
              items: [...day.items, {
                id: uuidv4(),
                supplementId: supplement.id,
                name: supplement.name,
                amount: '1 سكوب',
                timing: 'صباحاً'
              }]
            };
          }
          return day;
        }));
      }
    } else if (active.data.current?.type === 'SupplementPlanItem') {
      // Reordering not fully implemented here for simplicity, just remove and add if needed, 
      // or we just let sortable handle it if same list. 
      // Dnd-kit handles sorting via SortableContext if implemented.
    }
  };

  const handleAddDay = () => {
    setDays(prev => [
      ...prev,
      { id: uuidv4(), name: `اليوم ${prev.length + 1}`, items: [] }
    ]);
  };

  const handleUpdateItem = (dayId: string, itemId: string, field: 'amount' | 'timing', value: string) => {
    setDays(prev => prev.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          items: day.items.map((item: any) => {
            if (item.id === itemId) {
              return { ...item, [field]: value };
            }
            return item;
          })
        };
      }
      return day;
    }));
  };

  const handleRemoveItem = (dayId: string, itemId: string) => {
    setDays(prev => prev.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          items: day.items.filter((item: any) => item.id !== itemId)
        };
      }
      return day;
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await saveSupplementPlan(clientId, { days });
      if (res.success) {
        toast.success('تم حفظ خطة المكملات بنجاح!');
        onClose();
      } else {
        toast.error(res.error || 'حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloneSuccess = async (planId: string) => {
    setIsCloneModalOpen(false);
    toast.loading('جاري استنساخ الخطة...');
    
    try {
      const res = await getSupplementPlanById(planId);
      toast.dismiss();
      
      if (res.success && res.plan) {
        const clonedPlan = res.plan;
        
        const mappedDays = clonedPlan.days.map((d: any) => ({
          id: uuidv4(),
          name: d.name,
          items: d.items.map((item: any) => ({
            id: uuidv4(),
            supplementId: item.supplementId,
            name: item.supplement?.name || 'مكمل',
            amount: item.amount || '1 سكوب',
            timing: item.timing || 'صباحاً',
          }))
        }));
        
        setDays(mappedDays);
        toast.success('تم استنساخ الخطة! قم بمراجعتها ثم اضغط حفظ');
      } else {
        toast.error('حدث خطأ أثناء تحميل الخطة');
      }
    } catch (err) {
      toast.dismiss();
      toast.error('حدث خطأ غير متوقع');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 lg:p-8 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0a0a0a] w-full max-w-7xl h-full max-h-[90vh] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-black text-white">إدارة المكملات</h2>
            <button 
              onClick={() => setIsCloneModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-bold"
            >
              <Copy className="w-4 h-4" />
              استنساخ خطة سابقة
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-purple-500 text-white font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'جاري الحفظ...' : 'حفظ النظام'}
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 overflow-hidden">
            {/* Right Sidebar - Library */}
            <div className="w-80 shrink-0 hidden lg:block">
              <SupplementLibrary 
                supplementItems={supplements}
                onAddSupplement={(supp) => setSupplements([supp, ...supplements])}
              />
            </div>

            {/* Main Area - Builder */}
            <div className="flex-1 overflow-y-auto bg-black/20 custom-scrollbar">
              <SupplementPlanBuilder 
                days={days}
                onUpdateItem={handleUpdateItem}
                onRemoveItem={handleRemoveItem}
                onAddDay={handleAddDay}
              />
            </div>
          </div>

          <DragOverlay>
            {activeItem ? (
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/50 backdrop-blur-md shadow-2xl flex items-center gap-3 w-64">
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm truncate">{activeItem.name}</h4>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <ClonePlanModal 
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        type="supplement"
        fetchPlans={getAllCoachSupplementPlans}
        onSelectPlan={handleCloneSuccess}
      />
    </div>
  );
}
