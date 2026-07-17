"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, UserPlus, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDynamicNotifications, DynamicNotification } from '@/actions/notifications';
import { useRouter } from 'next/navigation';

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<DynamicNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastReadTimestamp, setLastReadTimestamp] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Load last read timestamp from localStorage
    const savedTimestamp = localStorage.getItem('notifications_last_read');
    if (savedTimestamp) {
      setLastReadTimestamp(parseInt(savedTimestamp, 10));
    }

    const fetchNotifications = async () => {
      setIsLoading(true);
      const res = await getDynamicNotifications();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
      setIsLoading(false);
    };

    fetchNotifications();

    // Poll every 1 minute
    const interval = setInterval(fetchNotifications, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Handle click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => new Date(n.createdAt).getTime() > lastReadTimestamp).length;

  const markAllAsRead = () => {
    const now = Date.now();
    setLastReadTimestamp(now);
    localStorage.setItem('notifications_last_read', now.toString());
  };

  const handleNotificationClick = (n: DynamicNotification) => {
    // Mark as read specifically? Since we use timestamp, we just open the link
    setIsOpen(false);
    router.push(n.link);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'NEW_SUBSCRIBER': return <UserPlus className="w-5 h-5 text-green-400" />;
      case 'EXPIRING_SOON': return <Clock className="w-5 h-5 text-orange-400" />;
      case 'EXPIRED': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgForType = (type: string) => {
    switch (type) {
      case 'NEW_SUBSCRIBER': return 'bg-green-500/10 border-green-500/20';
      case 'EXPIRING_SOON': return 'bg-orange-500/10 border-orange-500/20';
      case 'EXPIRED': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 shrink-0 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all relative group shadow-inner"
      >
        <Bell className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-12' : 'group-hover:rotate-12'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-[#82c91e] text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#1a1f1a] shadow-[0_0_10px_#82c91e]">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-3 w-80 md:w-96 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            dir="rtl"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                الإشعارات
                {unreadCount > 0 && (
                  <span className="bg-[#82c91e]/20 text-[#82c91e] text-xs px-2 py-0.5 rounded-full border border-[#82c91e]/30">
                    {unreadCount} جديد
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Check className="w-3 h-3" /> تعيين كمقروءة
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#82c91e]" />
                  <span className="text-sm">جاري التحميل...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-500">
                  <Bell className="w-10 h-10 opacity-20" />
                  <span className="text-sm">لا توجد إشعارات حالياً</span>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((n) => {
                    const isUnread = new Date(n.createdAt).getTime() > lastReadTimestamp;
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-right p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex gap-4 ${isUnread ? 'bg-white/[0.02]' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getBgForType(n.type)}`}>
                          {getIconForType(n.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className={`text-sm font-bold ${isUnread ? 'text-white' : 'text-gray-300'}`}>
                              {n.title}
                            </h4>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-[#82c91e] shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed mb-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-gray-500">
                            {new Date(n.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-3 bg-black/40 border-t border-white/5 text-center">
              <button 
                onClick={() => router.push('/dashboard/clients')}
                className="text-xs text-[#82c91e] hover:text-[#9df522] font-medium"
              >
                إدارة جميع المتدربين
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
