'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SupplementPlanItem {
  id: string; // unique id for this assignment
  supplementId: string;
  name: string;
  amount: string;
  timing: string;
}

interface SupplementDay {
  id: string;
  name: string;
  items: SupplementPlanItem[];
}

interface SupplementPlanBuilderProps {
  days: SupplementDay[];
  onUpdateItem: (dayId: string, itemId: string, field: 'amount' | 'timing', value: string) => void;
  onRemoveItem: (dayId: string, itemId: string) => void;
  onAddDay: () => void;
}

function SortableSupplementItem({ item, dayId, onUpdate, onRemove }: { item: SupplementPlanItem, dayId: string, onUpdate: any, onRemove: any }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { type: 'SupplementPlanItem', item, dayId }
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
        isDragging && "opacity-50 z-50 border-purple-500"
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-white transition-colors">
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="truncate pr-2 w-[120px]">
          <h5 className="text-sm font-bold text-white truncate">{item.name}</h5>
        </div>
        
        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">الجرعة</span>
            <input 
              type="text" 
              value={item.amount}
              onChange={(e) => onUpdate(dayId, item.id, 'amount', e.target.value)}
              placeholder="مثال: 1 سكوب"
              className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-center text-xs text-white focus:border-purple-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">التوقيت</span>
            <input 
              type="text" 
              value={item.timing}
              onChange={(e) => onUpdate(dayId, item.id, 'timing', e.target.value)}
              placeholder="مثال: صباحاً"
              className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-center text-xs text-white focus:border-purple-500 outline-none"
            />
          </div>
          
          <button 
            onClick={() => onRemove(dayId, item.id)}
            className="p-1.5 text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DayDroppable({ day, onUpdate, onRemove }: { day: SupplementDay, onUpdate: any, onRemove: any }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { setNodeRef, isOver } = useDroppable({
    id: day.id,
    data: { type: 'SupplementDay', day }
  });

  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden shadow-lg transition-colors relative mb-6">
      {/* Header */}
      <div 
        className={cn(
          "p-4 flex items-center justify-between bg-black/20 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-colors",
          isOver && "bg-purple-500/10"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold text-sm">
            {day.name.replace('اليوم', '')}
          </div>
          <h4 className="text-lg font-bold text-white">{day.name}</h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-md">
            {day.items.length} مكملات
          </span>
          <div className="text-gray-400 hover:text-white p-1">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div ref={setNodeRef} className={cn("p-4 transition-colors min-h-[100px]", isOver && "bg-purple-500/5")}>
          <SortableContext items={day.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {day.items.map((item) => (
                <SortableSupplementItem 
                  key={item.id} 
                  item={item} 
                  dayId={day.id}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </SortableContext>
          
          {day.items.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center py-6 border-2 border-dashed border-white/10 rounded-xl bg-black/20 mt-2">
              <p className="text-sm text-gray-500">اسحب المكملات هنا</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function SupplementPlanBuilder({ days, onUpdateItem, onRemoveItem, onAddDay }: SupplementPlanBuilderProps) {
  return (
    <div className="max-w-4xl mx-auto pb-32 pt-6 px-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black text-white mb-2">النظام المكملاتي</h2>
        <p className="text-gray-400">اسحب المكملات من المكتبة الجانبية وأفلتها في الأيام لترتيب خطة المتدرب</p>
      </div>

      <div className="space-y-6">
        {days.map((day) => (
          <DayDroppable 
            key={day.id} 
            day={day} 
            onUpdate={onUpdateItem}
            onRemove={onRemoveItem}
          />
        ))}
      </div>

      <button 
        onClick={onAddDay}
        className="w-full mt-8 py-4 border-2 border-dashed border-purple-500/30 rounded-2xl text-purple-400 hover:text-purple-300 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2 font-bold"
      >
        <Plus className="w-5 h-5" />
        إضافة يوم جديد
      </button>
    </div>
  );
}
