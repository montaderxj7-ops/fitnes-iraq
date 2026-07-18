'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, BellRing, Target, Apple, Zap, MessageCircle } from 'lucide-react';
import { getNotifications, markNotificationAsRead, savePushSubscription } from '@/actions/notifications';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { AnimatePresence, motion } from 'framer-motion';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationsBell({ userId }: { userId: string }) {
  const { dir } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    async function fetchNotifs() {
      if (userId) {
        const res = await getNotifications(userId);
        if (res.success) {
          setNotifications(res.notifications);
        }
      }
    }
    fetchNotifs();

    // Poll every 1 minute
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [userId]);

  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await markNotificationAsRead(id);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'workout': return <Target className="w-5 h-5 text-blue-400" />;
      case 'nutrition': return <Apple className="w-5 h-5 text-green-400" />;
      case 'supplement': return <Zap className="w-5 h-5 text-orange-400" />;
      case 'chat': return <MessageCircle className="w-5 h-5 text-purple-400" />;
      default: return <BellRing className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center relative hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-[#1a1a1a]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-12 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-80 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden`}
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#1a1a1a]">
              <h3 className="font-bold text-white text-sm">الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-[#82c91e]/20 text-[#82c91e] px-2 py-1 rounded-full">{unreadCount} جديد</span>
              )}
            </div>

            {/* Removed inline push permission prompt, now in Settings */}
            
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <Bell className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm">لا توجد إشعارات حالياً</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                    className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors flex gap-3 ${!n.isRead ? 'bg-white/5' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-white/10' : 'bg-white/5'}`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm mb-1 ${!n.isRead ? 'text-white font-bold' : 'text-gray-300 font-medium'}`}>{n.title}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-gray-500 mt-2">
                        {new Date(n.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <div className="w-2 h-2 rounded-full bg-[#82c91e] mt-1.5 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
