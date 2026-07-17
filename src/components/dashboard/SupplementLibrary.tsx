'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search, Plus, X, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import { addSupplementItem } from '@/actions/supplements';
import toast from 'react-hot-toast';

interface SupplementItem {
  id: string;
  name: string;
  description?: string | null;
  mediaUrl?: string | null;
}

interface SupplementLibraryProps {
  supplementItems: SupplementItem[];
  onAddSupplement: (supplement: SupplementItem) => void;
}

function DraggableSupplement({ supplement }: { supplement: SupplementItem }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lib-supp-${supplement.id}`,
    data: { type: 'SupplementLibraryItem', supplement }
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
        "p-3 rounded-xl bg-black/40 border border-white/10 hover:border-purple-500/50 transition-all cursor-grab active:cursor-grabbing flex items-center gap-3",
        isDragging && "opacity-50 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] z-50 relative"
      )}
    >
      <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
        <Pill className="w-6 h-6 text-purple-500" />
      </div>
      <div>
        <h4 className="text-white font-bold text-sm mb-1">{supplement.name}</h4>
        {supplement.description && (
          <p className="text-xs text-gray-400 truncate max-w-[150px]">{supplement.description}</p>
        )}
      </div>
    </div>
  );
}

export function SupplementLibrary({ supplementItems, onAddSupplement }: SupplementLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newSupplement, setNewSupplement] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredItems = supplementItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!newSupplement.name) {
      toast.error('يرجى إدخال اسم المكمل');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await addSupplementItem({
        name: newSupplement.name,
        description: newSupplement.description
      });
      
      if (res.success && res.supplementItem) {
        onAddSupplement(res.supplementItem);
        setIsAdding(false);
        setNewSupplement({ name: '', description: '' });
        toast.success('تمت إضافة المكمل بنجاح');
      } else {
        toast.error(res.error || 'حدث خطأ أثناء الإضافة');
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111] border-l border-white/5">
      <div className="p-4 border-b border-white/5">
        <h3 className="text-lg font-bold text-white mb-4">مكتبة المكملات</h3>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="ابحث عن مكمل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl py-2 pr-10 pl-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isAdding ? (
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-white font-bold text-sm">مكمل جديد</h4>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <input 
                type="text"
                placeholder="اسم المكمل (مثل: Whey Protein)"
                value={newSupplement.name}
                onChange={(e) => setNewSupplement({...newSupplement, name: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50"
              />
              <textarea 
                placeholder="وصف (اختياري)"
                value={newSupplement.description}
                onChange={(e) => setNewSupplement({...newSupplement, description: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500/50 min-h-[60px]"
              />
              <button 
                onClick={handleAdd}
                disabled={isSubmitting}
                className="w-full bg-purple-500 text-white rounded-lg py-2 text-sm font-bold hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'جاري الإضافة...' : 'حفظ المكمل'}
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2 text-sm font-bold mb-4"
          >
            <Plus className="w-4 h-4" />
            إضافة مكمل جديد
          </button>
        )}

        {filteredItems.map(item => (
          <DraggableSupplement key={item.id} supplement={item} />
        ))}

        {filteredItems.length === 0 && !isAdding && (
          <div className="text-center py-10 text-gray-500 text-sm">
            لا توجد مكملات تطابق بحثك
          </div>
        )}
      </div>
    </div>
  );
}
