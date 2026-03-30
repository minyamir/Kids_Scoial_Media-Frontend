import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, MessageSquare, ShieldCheck, X, Clock } from 'lucide-react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { io } from 'socket.io-client';

const ChatList = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  
  const BASE_URL = "http://localhost:5000";
  const socketRef = useRef(null);

  // 1. Initial Load of Conversations
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const res = await API.get('/interaction/conversations');
        setConversations(res.data);
      } catch (err) {
        console.error("Failed to load inbox", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  // 2. Real-Time Inbox Updates
useEffect(() => {
  if (!user?._id) return;

  // 1. Assign the connection to the Ref immediately
  socketRef.current = io(BASE_URL, {
    transports: ["polling", "websocket"],
    withCredentials: true,
    reconnectionAttempts: 5,
    timeout: 10000,
  });

  // 2. Use a local variable to make the code cleaner
  const socket = socketRef.current;

  // 3. Now you can safely use listeners and emits
  socket.on("connect", () => {
    console.log("✅ ChatList Connected:", socket.id);
    socket.emit("join_chat", user._id); // Join room once connected
  });

  socket.on("update_chat_list", (updatedConv) => {
    console.log("📩 Inbox Update received:", updatedConv);
    setConversations((prev) => {
      const filtered = prev.filter((c) => c._id !== updatedConv._id);
      return [updatedConv, ...filtered];
    });
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket Error:", err.message);
  });

  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };
}, [user?._id]);
  // 3. Search Logic with Debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await API.get(`/interaction/search-scholars?username=${searchTerm}`);
          setSearchResults(res.data);
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col font-sans">
      
      {/* Header & Search Bar */}
      <header className="px-6 pt-12 pb-6 border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-black uppercase tracking-[0.2em]">Archives</h1>
          </div>
          <div className="w-8 h-8 rounded-full border border-yellow-500/50 flex items-center justify-center text-[10px] font-bold text-yellow-500">
            {conversations.length}
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search for scholars..."
            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm outline-none focus:border-yellow-500/50 focus:bg-zinc-900 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto pb-24">
        {searchTerm.length > 0 ? (
          /* --- SEARCH RESULTS --- */
          <div className="px-6 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-4">Discovery Results</h2>
            {isSearching ? (
              <div className="flex justify-center py-10"><div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : searchResults.map(scholar => (
              <div 
                key={scholar._id}
                onClick={() => navigate(`/chat/${scholar._id}`)}
                className="flex items-center gap-4 py-4 border-b border-white/5 hover:px-2 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 overflow-hidden">
                  <img src={scholar.avatarUrl ? `${BASE_URL}${scholar.avatarUrl}` : `https://ui-avatars.com/api/?name=${scholar.username}`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm uppercase flex items-center gap-2">
                    {scholar.username} <ShieldCheck size={12} className="text-blue-400" />
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Initialize Connection</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- RECENT CONVERSATIONS --- */
          <>
            <h2 className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Recent Exchanges</h2>
            {loading ? (
              <div className="flex justify-center py-20 opacity-20">
                <div className="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((chat) => (
                <div 
                  key={chat._id}
                  onClick={() => navigate(`/chat/${chat.otherUser?._id}`)}
                  className="flex items-center gap-4 px-6 py-6 hover:bg-white/[0.03] transition-all cursor-pointer border-b border-white/5 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 overflow-hidden border border-white/10 p-[2px] group-hover:border-yellow-500 transition-colors relative">
                    <img 
                      src={chat.otherUser?.avatarUrl ? (chat.otherUser.avatarUrl.startsWith('http') ? chat.otherUser.avatarUrl : `${BASE_URL}${chat.otherUser.avatarUrl}`) : `https://ui-avatars.com/api/?name=${chat.otherUser?.username}`} 
                      className="w-full h-full object-cover rounded-[14px]" 
                      alt="avatar"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-sm truncate uppercase tracking-wide group-hover:text-yellow-500 transition-colors">
                        {chat.otherUser?.username}
                      </h3>
                      <span className="text-[9px] text-gray-500 font-bold">
                        {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate font-medium">
                      {chat.lastMessage || "Beginning of archives..."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-32 opacity-20">
                <MessageSquare size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">The library is empty</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatList;