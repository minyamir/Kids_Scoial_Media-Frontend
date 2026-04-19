import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// 1. IMPORT BASE_URL FROM YOUR AXIOS FILE
import API, { BASE_URL } from '../api/axios'; 
import { Users, Radio } from 'lucide-react';

const LiveFeed = () => {
  const [liveUsers, setLiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ❌ DELETE THIS LINE: const BASE_URL = "http://localhost:5000";
  // It is now handled by the import above!

  useEffect(() => {
    const fetchLive = async () => {
      try {
        // 2. USE 'API' INSTEAD OF 'axios'
        const res = await API.get('/interaction/live-users');
        setLiveUsers(res.data);
      } catch (err) {
        console.error("Error fetching live scholars:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLive();
    
    const interval = setInterval(fetchLive, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent animate-spin rounded-full" />
    </div>
  );

  return (
    <div className="p-6 pt-24 min-h-screen bg-[#050505] text-white">
      {/* Header logic remains the same */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-400 to-green-500">
            Live Stadium
          </h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
            Real-time Wisdom from Ethiopia
          </p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-white/5">
          <Users size={16} className="text-zinc-400" />
          <span className="text-sm font-black">{liveUsers.length}</span>
        </div>
      </div>

      {liveUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 opacity-30">
          <Radio size={48} className="mb-4" />
          <p className="uppercase text-xs font-black tracking-widest">No Scholars currently on stage</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {liveUsers.map(user => (
            <div 
              key={user._id}
              onClick={() => navigate(`/live/${user._id}`)}
              className="cursor-pointer group relative aspect-[3/4] bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/5 hover:border-red-500/50 transition-all duration-500"
            >
              {/* 3. UPDATED IMAGE SOURCE */}
              {/* We use BASE_URL from the import. We strip /api to reach the static uploads folder */}
              <img 
                src={user.avatarUrl 
                  ? `${BASE_URL.replace('/api', '')}${user.avatarUrl}` 
                  : `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                alt={user.username}
              />

              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full shadow-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Live</span>
              </div>

              <div className="absolute bottom-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent w-full">
                <p className="font-black text-lg tracking-tight mb-1">@{user.username}</p>
                <p className="text-[10px] text-zinc-400 uppercase font-bold truncate">
                  {user.liveStreamTitle || "Traditional Wisdom Session"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveFeed;