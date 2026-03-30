import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // 1. IMPORT THIS
import { 
  Settings, Grid, Heart, Lock, Camera, X, 
  Microscope, TowerControl as Castle, Flame, 
  Medal, ShieldCheck, KeyRound, LogOut, Trash2, Play 
} from 'lucide-react';
import BottomNav from '../components/Layout/BottomNav';
import API from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const { user, logout, setUser } = useContext(AuthContext);
  const navigate = useNavigate(); // 2. INITIALIZE THIS
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const settingsRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    if (user) setEditData({ username: user.username || '', bio: user.bio || '' });
  }, [user]);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const res = await API.get('/videos/my-videos');
      setUserVideos(res.data);
    } catch (err) {
      console.error("Error fetching videos", err);
    } finally {
      setLoading(false);
    }
  };

const handleGoLive = async () => {
  try {
    const title = prompt("Enter Lesson Title:", "Live Scholarship Session");
    if (!title) return; // User cancelled

    const token = localStorage.getItem('token');
    
    // We send the title to the backend so it shows up in the Live Stadium (LiveFeed)
    const res = await API.post('/interaction/live-status', 
      { isLive: true, liveStreamTitle: title }, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data) {
      toast.success("Preparing your Broadcast... 🎥");
      setTimeout(() => {
        // We use the logged-in user's ID to create their unique room
        navigate(`/live/${user._id}`);
      }, 1000);
    }
  } catch (err) {
    console.error("Live Error:", err);
    toast.error("Could not reach the Stadium server.");
  }
};

  const handleDeleteVideo = async (videoId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await API.delete(`/videos/${videoId}`);
      setUserVideos(prev => prev.filter(v => v._id !== videoId));
      toast.success("Lesson deleted 🗑️");
    } catch (err) {
      toast.error("Failed to delete video");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('username', editData.username);
      data.append('bio', editData.bio);
      if (selectedFile) data.append('avatar', selectedFile);

      const res = await API.put('/auth/update-profile', data, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setIsEditing(false);
      toast.success("Profile Updated! 🇪🇹");
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const totalLikes = userVideos.reduce((acc, vid) => acc + (vid.likes?.length || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] pb-20 text-white font-sans overflow-x-hidden relative">
      <ToastContainer position="top-center" theme="dark" autoClose={2000} />
      
      {/* HEADER */}
      <div className="flex justify-between items-center p-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-[#050505]/80">
        <span className="font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
          {isEditing ? "EDIT SCHOLAR" : `@${user?.username?.toUpperCase()}`}
        </span>

        <div className="relative" ref={settingsRef}>
          {isEditing ? (
            <X className="cursor-pointer text-gray-400 hover:text-white" onClick={() => setIsEditing(false)} />
          ) : (
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
              <Settings size={22} className={showSettings ? "rotate-90 transition-all" : ""} />
            </button>
          )}

          {showSettings && (
            <div className="absolute right-0 mt-3 w-56 bg-[#0F0F0F] border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden">
              <div className="p-2 space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-all">
                  <ShieldCheck size={18} className="text-green-500" />
                  <span>Privacy Policy</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-all">
                  <KeyRound size={18} className="text-yellow-500" />
                  <span>Change Password</span>
                </button>
                <div className="h-[1px] bg-white/5 mx-2 my-1" />
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PROFILE TOP */}
      <div className="flex flex-col items-center pt-8 px-6 relative z-10">
        <div className="relative group" onClick={() => isEditing && fileInputRef.current.click()}>
          <div className="p-1 rounded-full bg-gradient-to-tr from-green-500 via-yellow-400 to-red-500 shadow-2xl">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#050505] bg-gray-900">
              <img src={previewUrl || (user?.avatarUrl ? `${BASE_URL}${user.avatarUrl}` : `https://ui-avatars.com/api/?name=${user?.username}`)} alt="profile" className="w-full h-full object-cover" />
            </div>
          </div>
          {isEditing && <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full"><Camera size={28} /></div>}
        </div>
        <input type="file" ref={fileInputRef} onChange={(e) => {
            const file = e.target.files[0];
            if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
        }} className="hidden" accept="image/*" />

        {!isEditing ? (
          <>
            <div className="flex items-center gap-2 mt-4"><h2 className="font-black text-2xl tracking-tight">{user?.username}</h2><Medal size={20} className="text-yellow-500" /></div>
            
            {/* STATS CARD */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-sm mt-8 p-4 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-sm">
              <div className="text-center"><p className="text-xl font-black">{userVideos.length}</p><p className="text-[10px] text-gray-500 uppercase tracking-widest">Lessons</p></div>
              <div className="text-center border-x border-white/10"><p className="text-xl font-black">{user?.followers?.length || 0}</p><p className="text-[10px] text-gray-500 uppercase tracking-widest">Students</p></div>
              <div className="text-center"><p className="text-xl font-black text-yellow-500">{totalLikes}</p><p className="text-[10px] text-gray-500 uppercase tracking-widest">Wisdom</p></div>
            </div>

            {/* BUTTON GROUP */}
            <div className="flex flex-col gap-3 mt-8 w-full max-w-sm">
              <button 
                onClick={() => setIsEditing(true)} 
                className="w-full py-4 border border-white/10 font-bold rounded-2xl hover:bg-white/5 transition-all text-xs tracking-widest uppercase"
              >
                Edit Scholar Profile
              </button>
              
              <button 
                onClick={handleGoLive} 
                className="w-full py-4 bg-red-600 hover:bg-red-500 font-black rounded-2xl transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(220,38,38,0.2)]"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Go Live
              </button>
            </div>

            <p className="mt-6 text-sm text-center max-w-xs text-gray-400 leading-relaxed italic px-4">"{user?.bio || "Building the future of Ethiopia through knowledge."}"</p>
          </>
        ) : (
          <div className="w-full max-w-sm mt-8 space-y-4 animate-in fade-in zoom-in duration-300">
            <input type="text" value={editData.username} onChange={(e) => setEditData({...editData, username: e.target.value})} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm outline-none focus:border-yellow-500" placeholder="Username" />
            <textarea value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} rows="3" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm outline-none focus:border-yellow-500 resize-none" placeholder="Your Academic Bio..." />
            <button onClick={handleSave} className="w-full bg-yellow-500 font-black text-black py-4 rounded-2xl hover:bg-yellow-400 active:scale-95 transition-all uppercase tracking-widest text-xs">Save Academic Profile</button>
          </div>
        )}
      </div>

      {/* VIDEO GRID SECTION */}
      {!isEditing && (
        <div className="mt-12">
          <div className="flex justify-around items-center py-4 px-10 border-t border-white/5 bg-white/2">
            <div className="flex flex-col items-center gap-1 text-green-500"><Microscope size={20} /><span className="text-[8px] font-bold uppercase tracking-widest">Science</span></div>
            <div className="flex flex-col items-center gap-1 text-yellow-500"><Castle size={20} /><span className="text-[8px] font-bold uppercase tracking-widest">History</span></div>
            <div className="flex flex-col items-center gap-1 text-red-500"><Heart size={20} /><span className="text-[8px] font-bold uppercase tracking-widest">Patriotism</span></div>
          </div>

          <div className="grid grid-cols-3 gap-1 px-1 mt-1">
            {userVideos.map((video) => (
              <div 
                key={video._id} 
                onClick={() => setActiveVideo(video)} 
                className="aspect-[3/4] bg-gray-900 overflow-hidden relative group cursor-pointer"
              >
                <video src={`${BASE_URL}${video.videoUrl}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" muted />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Play className="text-white/50" fill="currentColor" size={30} />
                </div>
                <button onClick={(e) => handleDeleteVideo(video._id, e)} className="absolute top-2 right-2 p-1.5 bg-red-600/80 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all z-20">
                  <Trash2 size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIDEO MODAL */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-4 backdrop-blur-md" onClick={() => setActiveVideo(null)}>
          <button onClick={() => setActiveVideo(null)} className="absolute top-8 right-8 p-4 bg-white/10 rounded-full z-[210]"><X size={32} /></button>
          <video src={`${BASE_URL}${activeVideo.videoUrl}`} controls autoPlay className="w-full max-w-4xl max-h-[80vh] rounded-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Profile;