import React, { useContext } from 'react';
import { Home, Compass, Plus, MessageCircle, User, LogIn } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { NotificationContext } from '../../context/NotificationContext';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

const BottomNav = () => {
  const { unreadCount } = useContext(NotificationContext);
  const { user } = useContext(AuthContext); // Get the current user status
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#050505]/95 backdrop-blur-2xl border-t border-white/5 h-20 flex items-center justify-around px-4 z-[100]">
      
      {/* 🏛️ Academy Home */}
      <Link 
        to="/" 
        className={`flex flex-col items-center transition-all duration-300 ${
          isActive('/') ? 'text-yellow-500 scale-110' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
        <span className="text-[9px] font-black uppercase tracking-[1px] mt-1.5">Academy</span>
      </Link>

      {/* 🧭 Discover Knowledge */}
      <Link 
        to="/discover" 
        className={`flex flex-col items-center transition-all duration-300 ${
          isActive('/discover') ? 'text-yellow-500 scale-110' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <Compass size={22} strokeWidth={isActive('/discover') ? 2.5 : 2} />
        <span className="text-[9px] font-black uppercase tracking-[1px] mt-1.5">Explore</span>
      </Link>

      {/* 🏺 Center Upload Button */}
      <Link to="/upload" className="relative -mt-10 group">
        <div className="p-[3px] rounded-2xl bg-gradient-to-tr from-green-500 via-yellow-400 to-red-500 shadow-[0_0_25px_rgba(234,179,8,0.2)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_35px_rgba(234,179,8,0.4)] group-active:scale-95">
          <div className="bg-black w-14 h-12 rounded-xl flex items-center justify-center border border-black/50">
            <Plus size={28} className="text-white" strokeWidth={3} />
          </div>
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-1 bg-yellow-500/20 blur-md rounded-full"></div>
      </Link>

      {/* 💬 Chat / Inbox */}
      <Link 
        to="/chat" 
        className={`relative flex flex-col items-center transition-all duration-300 ${
          isActive('/chat') ? 'text-yellow-500 scale-110' : 'text-gray-500 hover:text-gray-300'
        }`}
      >
        <MessageCircle size={22} strokeWidth={isActive('/chat') ? 2.5 : 2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-[#050505]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        <span className="text-[9px] font-black uppercase tracking-[1px] mt-1.5">Inbox</span>
      </Link>

      {/* 🎓 Scholar Profile OR 🔑 Login */}
      {user ? (
        <Link 
          to="/profile" 
          className={`flex flex-col items-center transition-all duration-300 ${
            isActive('/profile') ? 'text-yellow-500 scale-110' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <User size={22} strokeWidth={isActive('/profile') ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-[1px] mt-1.5">Scholar</span>
        </Link>
      ) : (
        <Link 
          to="/login" 
          className={`flex flex-col items-center transition-all duration-300 ${
            isActive('/login') ? 'text-yellow-500 scale-110' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          <LogIn size={22} strokeWidth={isActive('/login') ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-[1px] mt-1.5">Login</span>
        </Link>
      )}
      
    </div>
  );
};

export default BottomNav;