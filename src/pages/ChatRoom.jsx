import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, MoreVertical, Video, Image } from 'lucide-react';
// 1. IMPORT YOUR CENTRALIZED CONFIG
import API, { BASE_URL } from '../api/axios'; 
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';

const ChatRoom = () => {
  const { userId } = useParams(); 
  const { user } = useContext(AuthContext); 
  const navigate = useNavigate();
  const scrollRef = useRef();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);

  // ❌ DELETE: const BASE_URL = "http://localhost:5000"; (Handled by import)

  const currentPartnerIdRef = useRef(userId);
  const myIdRef = useRef(user?._id);

  useEffect(() => {
    currentPartnerIdRef.current = userId;
    myIdRef.current = user?._id;
  }, [userId, user?._id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [msgRes, userRes] = await Promise.all([
          API.get(`/interaction/messages/${userId}`),
          API.get(`/auth/user/${userId}`)
        ]);
        setMessages(msgRes.data);
        setOtherUser(userRes.data);
      } catch (err) {
        console.error("Archive access error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    // 2. USE THE CENTRALIZED BASE_URL FOR SOCKETS
    socketRef.current = io(BASE_URL, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ ChatRoom Connected");
      socket.emit("join_chat", user._id);
    });

    socket.on("receive_message", (incomingMsg) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === incomingMsg._id)) return prev;
        const partnerId = String(currentPartnerIdRef.current);
        const meId = String(myIdRef.current);
        const senderId = String(incomingMsg.sender);

        if (senderId === partnerId || senderId === meId) {
          return [...prev, incomingMsg];
        }
        return prev;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_message");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const textToSend = newMessage.trim();
    if (!textToSend) return;
    setNewMessage("");

    try {
      const res = await API.post('/interaction/message/send', {
        receiverId: userId,
        text: textToSend
      });

      setMessages((prev) => {
        if (prev.some(m => m._id === res.data._id)) return prev;
        return [...prev, res.data];
      });
    } catch (err) {
      console.error("Transmission failed", err);
    }
  };

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-yellow-500 font-black tracking-[0.3em] uppercase text-[10px]">Opening Channel...</p>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#050505] flex flex-col text-white">
      <header className="px-6 py-10 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-yellow-500/30 overflow-hidden shadow-2xl">
              {/* 3. UPDATED AVATAR URL LOGIC */}
              <img 
                src={otherUser?.avatarUrl 
                  ? (otherUser.avatarUrl.startsWith('http') 
                    ? otherUser.avatarUrl 
                    : `${BASE_URL.replace('/api', '')}${otherUser.avatarUrl}`) 
                  : `https://ui-avatars.com/api/?name=${otherUser?.username}`} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-1">
                {otherUser?.username} <ShieldCheck size={14} className="text-blue-400" />
              </h2>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Active Connection</span>
              </div>
            </div>
          </div>
        </div>
        <Info size={20} className="text-gray-600 hover:text-yellow-500 cursor-pointer transition-colors" />
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => {
          const isMe = String(msg.sender) === String(user?._id);
          return (
            <div key={msg._id || Math.random()} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-xl ${
                isMe 
                ? 'bg-yellow-500 text-black font-semibold rounded-tr-none' 
                : 'bg-zinc-900 text-white border border-white/5 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              <div className="flex items-center gap-1 mt-1.5 px-1 opacity-40">
                <Clock size={8} />
                <span className="text-[8px] font-bold">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <footer className="p-6 bg-[#0a0a0a] border-t border-white/5 pb-10">
        <form onSubmit={handleSend} className="flex items-center gap-3 bg-zinc-900/50 border border-white/10 rounded-2xl px-4 py-1">
          <input 
            type="text" 
            placeholder="Type your message..."
            className="flex-1 bg-transparent py-3 outline-none text-sm text-white font-medium"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" disabled={!newMessage.trim()} className="bg-yellow-500 text-black p-2 rounded-xl active:scale-95 transition-transform">
            <Send size={18} fill="currentColor" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatRoom;