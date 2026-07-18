"use client";

import { motion } from "framer-motion";
import { Search, Clock, MessageCircle, MoreVertical, Send, CheckCircle2, AlertTriangle, PauseCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getChats, getMessages, sendMessage } from "@/actions/inbox";

// CHATS mock removed

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isPausedAll, setIsPausedAll] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchChats = async () => {
      try {
        const data = await getChats();
        setChats(data);
      } catch (e) {
        console.error("Polling error (chats):", e);
      }
    };
    
    fetchChats();
    // Only set initial selected chat once if none selected
    getChats().then(data => {
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0]);
      }
    });

    interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedChat) {
      const fetchMsgs = async () => {
        try {
          const msgs = await getMessages(selectedChat.id);
          setMessages(msgs);
        } catch (e) {
          console.error("Polling error (msgs):", e);
        }
      };
      fetchMsgs();
      interval = setInterval(fetchMsgs, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedChat]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    const content = message;
    setMessage("");
    
    // Optimistic UI update
    const tempMsg = { id: Date.now().toString(), sender: "coach", content, createdAt: new Date() };
    setMessages(prev => [...prev, tempMsg]);
    
    try {
      await sendMessage(selectedChat.id, content);
      // Refresh chats to update last message
      const updatedChats = await getChats();
      setChats(updatedChats);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredChats = chats.filter(chat => chat.status === activeTab);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="h-[calc(100vh-100px)] flex flex-col space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">الرسائل الذكية</h1>
          <p className="text-gray-400">تواصل مع مشتركي باقاتك، نظام التوقيت الآلي يتحكم بالمحادثات.</p>
        </div>
        <button 
          onClick={() => setIsPausedAll(!isPausedAll)}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg",
            isPausedAll 
              ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20" 
              : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
          )}
        >
          <PauseCircle className="w-5 h-5" />
          {isPausedAll ? "المحادثات متوقفة مؤقتاً" : "إيقاف جميع المحادثات"}
        </button>
      </div>

      {isPausedAll && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3 shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <h4 className="font-bold text-red-400">نظام الطوارئ مفعل</h4>
            <p className="text-sm text-red-400/80">لقد قمت بإيقاف جميع المحادثات مؤقتاً. المشتركون لا يمكنهم إرسال رسائل الآن وسيتم إشعارهم بذلك.</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Chat List (Sidebar) */}
        <div className="w-full lg:w-96 flex flex-col bg-[#111111]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shrink-0 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative">
          <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
          <div className="p-4 border-b border-white/10 relative z-10">
            <div className="flex bg-black/40 p-1 rounded-xl mb-4">
              <button 
                onClick={() => setActiveTab("active")}
                className={cn(
                  "flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2",
                  activeTab === "active" ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                )}
              >
                نشطة الآن
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
              </button>
              <button 
                onClick={() => setActiveTab("closed")}
                className={cn(
                  "flex-1 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2",
                  activeTab === "closed" ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                )}
              >
                مغلقة
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder="ابحث في المحادثات..."
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 transition-all text-right"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 relative z-10">
            {filteredChats.map((chat) => (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={cn(
                  "p-3 rounded-[20px] flex gap-3 cursor-pointer transition-all mb-1 border",
                  selectedChat?.id === chat.id 
                    ? "bg-[#82c91e]/10 border-[#82c91e]/30 shadow-[0_0_20px_rgba(130,201,30,0.15)]" 
                    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                )}
              >
                <div className="relative shrink-0">
                  <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#111]" />
                  {chat.status === 'active' && !isPausedAll && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111] rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-200 truncate">{chat.name}</h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-neon text-black text-[10px] font-bold flex items-center justify-center shrink-0">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden lg:flex flex-1 bg-[#111111]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] flex-col overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] pointer-events-none" />
          {/* Active Timer Indicator Overlay if Closed */}
          {selectedChat?.status === "closed" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
              <Clock className="w-16 h-16 text-red-500 mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-2">المحادثة مغلقة</h3>
              <p className="text-gray-400 max-w-md">انتهى الوقت المخصص للمحادثة مع هذا المشترك بناءً على باقته. سيتم فتح المحادثة تلقائياً في الموعد القادم المحدد في إعدادات ملفه.</p>
            </div>
          )}

          {/* Chat Header */}
          {selectedChat && (
            <div className="h-20 border-b border-white/10 flex items-center justify-between px-6 bg-black/20 shrink-0 relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <img src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${selectedChat.clientName}&background=random`} alt={selectedChat.clientName} className="w-10 h-10 rounded-full object-cover border border-white/10 shadow-sm" />
                <div>
                  <h3 className="font-bold text-white text-lg">{selectedChat.clientName}</h3>
                  <span className="text-xs text-[#82c91e] font-medium">محادثة نشطة</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {selectedChat.status === "active" && !isPausedAll && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-green-400">متاح</span>
                  </div>
                )}
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed" style={{ backgroundBlendMode: 'overlay', backgroundColor: 'rgba(10,10,10,0.5)' }}>
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-black/40 rounded-lg text-xs font-medium text-gray-500">سجل المحادثة</span>
            </div>
            
            {messages.map((msg, idx) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id || idx} className={cn("flex gap-4 relative z-10", msg.sender === "coach" ? "flex-row-reverse" : "")}>
                {msg.sender === "coach" ? (
                  <div className="w-8 h-8 rounded-[12px] bg-[#82c91e]/20 border border-[#82c91e]/40 flex items-center justify-center font-bold text-[#82c91e] shadow-[0_0_15px_rgba(130,201,30,0.2)] shrink-0">C</div>
                ) : (
                  <img src={selectedChat?.avatar || `https://ui-avatars.com/api/?name=${selectedChat?.clientName}&background=random`} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                )}
                <div className={cn(
                  "border rounded-2xl p-4 max-w-[80%]",
                  msg.sender === "coach" 
                    ? "bg-neon/10 border-neon/20 rounded-tl-none" 
                    : "bg-white/5 border-white/10 rounded-tr-none"
                )}>
                  <p className={msg.sender === "coach" ? "text-white" : "text-gray-200"}>{msg.content}</p>
                  <div className={cn("flex items-center gap-1 mt-2", msg.sender === "coach" ? "justify-end" : "justify-start")}>
                    <span className={cn("text-[10px]", msg.sender === "coach" ? "text-[#82c91e]/70" : "text-gray-500")}>
                      {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.sender === "coach" && <CheckCircle2 className="w-3 h-3 text-[#82c91e]" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
            <div className="flex items-center gap-3 relative">
              <input 
                type="text"
                value={message}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                onChange={(e) => setMessage(e.target.value)}
                disabled={selectedChat?.status === "closed" || isPausedAll}
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-black/50 border border-white/10 rounded-2xl py-4 pr-4 pl-14 text-white placeholder:text-gray-600 focus:outline-none focus:border-neon/50 transition-all text-right disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                onClick={handleSendMessage}
                disabled={!message.trim() || selectedChat?.status === "closed" || isPausedAll}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-neon text-black hover:bg-[#c4e649] disabled:bg-white/5 disabled:text-gray-600 transition-colors"
              >
                <Send className="w-5 h-5 -ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
