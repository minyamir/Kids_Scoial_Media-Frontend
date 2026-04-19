import React, { useRef, useState } from 'react';
import VideoActions from './VideoActions';
import { X, Send, Award, BookOpen, Volume2, VolumeX } from 'lucide-react'; // Added Volume icons
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const VideoPlayer = ({ video }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // New state for sound
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState([]);

  const BASE_URL = "http://localhost:5000";



  const togglePlay = () => {
    if (playing) { videoRef.current.pause(); } 
    else { videoRef.current.play(); }
    setPlaying(!playing);
  };

  const toggleMute = (e) => {
    e.stopPropagation(); // Prevent pausing when clicking mute
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const openComments = async () => {
    setShowComments(true);
    try {
      const res = await API.get(`/interaction/comments/${video._id}`);
      const fetchedComments = Array.isArray(res.data) ? res.data : (res.data.comments || []);
      setCommentsList(fetchedComments);
    } catch (err) {
      console.error("Error loading comments", err);
    }
  };

 const handleSendComment = async (e) => {
    if (e) e.stopPropagation();
    if (!commentText.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      toast.info("Sign in to share your insights! 🎓");
      navigate('/login');
      return;
    }

    try {
      const res = await API.post('/interaction/comment', { 
        videoId: video._id, 
        text: commentText 
      });
      const newComment = res.data.comment || res.data;
      setCommentsList(prev => [newComment, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };



  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
      
      <div className="relative w-full h-full max-w-screen-md flex flex-row items-stretch">
        
        {/* VIDEO COLUMN */}
        <div className="relative flex-1 h-full bg-zinc-950 overflow-hidden">
          <video
            ref={videoRef}
               src={video.videoUrl}
            className="absolute inset-0 h-full w-full object-cover md:object-contain z-0"
            loop
            onClick={togglePlay}
            playsInline 
            autoPlay 
            // REMOVED fixed muted attribute
          />

          {/* MUTE TOGGLE BUTTON (Top Right of Video) */}
          <button 
            onClick={toggleMute}
            className="absolute top-24 right-4 z-50 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* CAPTION & INFO OVERLAY */}
          <div className="absolute bottom-28 left-4 right-20 text-white z-30 pointer-events-none">
            <h3 className="font-black text-base md:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] uppercase tracking-wider mb-1">
              @{video.userId?.username || "Scholar"}
            </h3>
            <p className="text-sm md:text-base opacity-100 font-medium line-clamp-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] leading-snug">
              {video.caption}
            </p>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 pointer-events-none" />
        </div>

        {/* ACTIONS COLUMN */}
        <div className="absolute right-0 bottom-0 w-20 md:relative md:w-24 h-full flex flex-col justify-end items-center pb-28 md:pb-12 z-40">
          <VideoActions 
            videoId={video._id} 
            ownerId={video.userId?._id}
            initialLikes={video.likesCount || 0}
            initialIsLiked={video.isLiked}
            initialIsFollowing={video.isFollowing}
            ownerAvatar={video.userId?.avatarUrl || null}
            onOpenComments={openComments}
          />
        </div>

        {/* --- COMMENT DRAWER (Existing logic) --- */}
        {showComments && (
           <div className="fixed inset-0 z-[200] flex items-end justify-center">
             <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowComments(false)} />
             <div className="relative w-full max-w-[500px] bg-[#0f0f0f] rounded-t-[30px] h-[75vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
               {/* ... (rest of your comment drawer code) ... */}
               <div className="shrink-0 p-6 border-b border-white/5 bg-[#121212]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-yellow-500" />
                    <span className="text-sm font-black text-white uppercase tracking-widest">{commentsList.length} Insights</span>
                  </div>
                  <button onClick={() => setShowComments(false)} className="bg-white/5 p-2 rounded-full text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {commentsList.map((c, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-9 h-9 rounded-full bg-zinc-800 shrink-0 overflow-hidden border border-white/10 shadow-lg">
                      <img src={c.userId?.avatarUrl || `https://ui-avatars.com/api/?name=${c.userId?.username}`} alt="" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="text-[10px] font-black text-yellow-500 mb-1">@{c.userId?.username}</p>
                      <div className="bg-white/5 p-3 rounded-2xl">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="shrink-0 p-5 bg-[#0a0a0a] border-t border-white/5 pb-10">
                <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/10 rounded-2xl px-4 py-3">
                  <input 
                    type="text" 
                    className="flex-1 bg-transparent text-sm outline-none text-white" 
                    placeholder="Add insight..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <button onClick={handleSendComment} className="text-yellow-500"><Send size={18}/></button>
                </div>
              </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;