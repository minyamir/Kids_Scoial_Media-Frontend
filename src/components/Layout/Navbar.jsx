import React, { useState } from 'react';
import { Search, Radio, Sparkles, X } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'; // Added for navigation

const Navbar = ({ activeTab, setTab, onSearch }) => {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleCloseSearch = () => {
    setIsSearching(false);
    setSearchQuery("");
    onSearch(""); 
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-8 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
      
      {/* 📡 Left side: Clickable Live Indicator */}
      {!isSearching && (
        <button 
    onClick={() => navigate('/live/global')}// This directs to your live list page
          className="text-white cursor-pointer group flex flex-col items-center gap-0.5 animate-in fade-in duration-500 hover:scale-105 transition-transform"
        >
          <div className="relative">
            <Radio size={22} className="group-hover:text-red-500 transition-colors" strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
          </div>
          <span className="text-[9px] font-black tracking-widest uppercase">Live</span>
        </button>
      )}

      {/* 🎓 Center: Academic Tabs */}
      {!isSearching && (
        <div className="flex gap-8 items-center animate-in fade-in zoom-in-95 duration-500">
          <button 
            onClick={() => setTab('following')}
            className={`relative text-sm font-black tracking-widest uppercase transition-all duration-300 ${
              activeTab === 'following' ? 'text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            My Circle
            {activeTab === 'following' && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>
            )}
          </button>

          <button 
            onClick={() => setTab('foryou')}
            className={`relative text-sm font-black tracking-widest uppercase transition-all duration-300 ${
              activeTab === 'foryou' ? 'text-white' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <div className="flex items-center gap-1">
              <span>Discover</span>
              <Sparkles size={12} className={activeTab === 'foryou' ? 'text-yellow-400' : 'hidden'} />
            </div>
            {activeTab === 'foryou' && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded-full"></div>
            )}
          </button>
        </div>
      )}

      {/* 🔍 Right side: Search Input */}
      <div className={`flex items-center transition-all duration-500 ${isSearching ? 'w-full' : 'w-auto'}`}>
        {isSearching ? (
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full gap-3 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 animate-in slide-in-from-right-4">
            <Search size={18} className="text-yellow-500" />
            <input 
              autoFocus
              type="text"
              placeholder="Search scholars or topics..."
              className="bg-transparent flex-1 text-white text-sm outline-none placeholder:text-white/40"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="button" onClick={handleCloseSearch}>
              <X size={18} className="text-white/60 hover:text-white" />
            </button>
          </form>
        ) : (
          <button 
            onClick={() => setIsSearching(true)}
            className="text-white p-2 hover:bg-white/10 rounded-full transition-all"
          >
            <Search size={22} strokeWidth={3} />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;