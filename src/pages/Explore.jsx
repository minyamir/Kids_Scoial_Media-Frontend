import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation
import { Search, Flame, GraduationCap, Play, Users, Globe } from 'lucide-react';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const categories = [
    { name: "Digital Arts", color: "from-purple-600", icon: "🎨", count: "1.2k" },
    { name: "Coding", color: "from-blue-600", icon: "💻", count: "850" },
    { name: "History", color: "from-amber-600", icon: "📜", count: "430" },
    { name: "Business", color: "from-emerald-600", icon: "📈", count: "2.1k" },
    { name: "Science", color: "from-red-600", icon: "🧬", count: "920" },
    { name: "Music", color: "from-pink-600", icon: "🎵", count: "1.5k" },
  ];

  // Dummy Live Data - In a real app, you'd fetch this from your backend
  const liveStreams = [
    { id: "stream1", title: "Mastering React Patterns", host: "Henok_Dev", viewers: "2.4k", tags: "tech" },
    { id: "stream2", title: "Ethiopian History 101", host: "Scholar_Abebe", viewers: "1.1k", tags: "history" },
    { id: "stream3", title: "UI Design Principles", host: "Sara_Design", viewers: "850", tags: "arts" },
  ];

  // Simple Filter Logic
  const filteredStreams = liveStreams.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.host.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* --- SEARCH HEADER --- */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-xl z-50 p-6 border-b border-white/5">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search scholars or topics..."
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="p-6 space-y-10">
        
        {/* --- TRENDING LIVE SECTION --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Flame size={20} className="text-red-500" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-widest">Live Now</h2>
            </div>
            <button className="text-[10px] font-black text-zinc-500 uppercase">View All</button>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {filteredStreams.map((stream) => (
              <div 
                key={stream.id} 
                onClick={() => navigate(`/live/${stream.id}`)} // Navigate to the LiveRoom
                className="min-w-[280px] aspect-video bg-zinc-900 rounded-3xl relative overflow-hidden group border border-white/5 cursor-pointer"
              >
                <img 
                  src={`https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80&sig=${stream.id}`} 
                  className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                  alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-red-600 text-[8px] font-black px-2 py-0.5 rounded uppercase animate-pulse">Live</span>
                  <span className="bg-black/60 backdrop-blur-md text-[8px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                    <Users size={8} /> {stream.viewers}
                  </span>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-bold leading-tight line-clamp-2">{stream.title}</p>
                  <p className="text-[10px] text-zinc-400 mt-1 uppercase font-black">@{stream.host}</p>
                </div>
              </div>
            ))}
            {filteredStreams.length === 0 && (
              <p className="text-zinc-500 text-xs py-10">No live sessions found for "{searchQuery}"</p>
            )}
          </div>
        </section>

        {/* --- TOP CATEGORIES GRID --- */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Globe size={20} className="text-yellow-500" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest">Categories</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className={`relative h-32 rounded-3xl bg-gradient-to-br ${cat.color} p-5 flex flex-col justify-between overflow-hidden group cursor-pointer shadow-xl active:scale-95 transition-transform`}
              >
                <span className="absolute -right-2 -bottom-2 text-6xl opacity-20 group-hover:scale-120 transition-transform">{cat.icon}</span>
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tighter">{cat.name}</h3>
                  <p className="text-[9px] font-bold opacity-70 uppercase">{cat.count} Scholars</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Explore;