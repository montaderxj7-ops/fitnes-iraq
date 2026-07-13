import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Send, Paperclip, MoreVertical, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CoachData } from './ClientAppFlow';
import { cn } from '@/lib/utils';
import { getOrCreateClientChat, sendClientMessage, getMessages } from '@/actions/inbox';

interface ClientChatProps {
  coach: CoachData;
  userData: any;
  onClose: () => void;
}

type Message = {
  id: number;
  sender: 'coach' | 'client';
  text: string;
  time: string;
  imageUrl?: string;
  videoUrl?: string;
};

export function ClientChat({ coach, userData, onClose }: ClientChatProps) {
  const { t, dir } = useLanguage();
  const isRTL = dir === 'rtl';
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    async function initChat() {
      if (!userData.id) return;
      await getOrCreateClientChat(userData.id, userData.name);
      
      const fetchMsgs = async () => {
        try {
          const msgs = await getMessages(userData.id!);
          setMessages(msgs);
        } catch (e) {
          console.error("Polling error:", e);
        }
      };
      
      fetchMsgs();
      interval = setInterval(fetchMsgs, 3000); // Poll every 3 seconds
    }
    
    initChat();
    return () => clearInterval(interval);
  }, [userData]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !userData.id) return;

    const text = inputText.trim();
    setInputText('');

    // Optimistic update
    const tempMsg = {
      id: Date.now().toString(),
      sender: 'client',
      content: text,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, tempMsg]);

    await sendClientMessage(userData.id, text);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/');

    const newMessage: Message = {
      id: Date.now(),
      sender: 'client',
      text: '', // Optional text can be added if we implement a preview screen
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: !isVideo ? fileUrl : undefined,
      videoUrl: isVideo ? fileUrl : undefined,
    };

    setMessages([...messages, newMessage]);
    
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="absolute inset-0 z-[100] bg-[#0a0a0a] flex flex-col"
    >
      {/* Header */}
      <div className="bg-[#111] border-b border-white/5 pt-12 pb-4 px-6 flex items-center justify-between shadow-md relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {isRTL ? <ArrowRight className="w-5 h-5 text-white" /> : <ArrowLeft className="w-5 h-5 text-white" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" 
                alt={userData?.name || "المتدرب"} 
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{userData?.name || "المتدرب"}</h3>
              <p className="text-[10px] text-green-500 font-medium">{t('chat.online')}</p>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
        <div className="text-center">
          <span className="bg-white/5 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full">
            {t('chat.today')}
          </span>
        </div>
        
        {messages.map((msg, idx) => {
          const isMe = msg.sender === 'client';
          const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <motion.div key={msg.id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
              <div 
                className={cn(
                  "max-w-[80%] p-3 px-4",
                  isMe 
                    ? `rounded-2xl ${isRTL ? 'rounded-tl-sm' : 'rounded-tr-sm'} text-black` 
                    : `rounded-2xl ${isRTL ? 'rounded-tr-sm' : 'rounded-tl-sm'} bg-[#1a1a1a] border border-white/5 text-gray-200`
                )}
                style={isMe ? { backgroundColor: coach.primaryColor } : {}}
              >
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Attachment" className="max-w-full rounded-xl mb-2 object-cover" />
                )}
                {msg.videoUrl && (
                  <video src={msg.videoUrl} controls className="max-w-full rounded-xl mb-2" />
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
                <p className={cn("text-[10px] mt-1.5 opacity-70", isMe ? "text-right text-black/70" : "text-left")}>
                  {time}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#111] border-t border-white/5 p-4 pb-8">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            className="hidden"
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 bg-[#1a1a1a] rounded-full border border-white/10 flex items-center px-4 h-12 relative overflow-hidden focus-within:border-white/30 transition-colors">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500 w-full"
              dir={dir}
            />
          </div>

          <button 
            type="submit"
            disabled={!inputText.trim()}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0",
              inputText.trim() 
                ? "opacity-100 scale-100 shadow-lg" 
                : "opacity-50 scale-95 cursor-not-allowed bg-white/5 text-gray-400"
            )}
            style={inputText.trim() ? { backgroundColor: coach.primaryColor, color: '#000' } : {}}
          >
            <Send className={cn("w-5 h-5", isRTL ? "-ml-1 rotate-180" : "ml-1")} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
