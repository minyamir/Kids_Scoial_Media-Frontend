import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Repeat, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. Added for redirection
import API from '../../api/axios';
import { toast } from 'react-toastify';

const VideoActions = ({ 
  videoId, initialLikes, initialIsLiked, ownerAvatar, 
  ownerId, initialIsFollowing, onOpenComments 
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [reposted, setReposted] = useState(false);

  // 2. The Gatekeeper Logic
  const ensureAuth = (callback) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.info("Join the Academy to interact! 🎓");
      navigate('/login');
      return false;
    }
    callback();
    return true;
  };

  const handleLike = () => {
    ensureAuth(async () => {
      const newLikedStatus = !liked;
      setLiked(newLikedStatus);
      setLikesCount(prev => newLikedStatus ? prev + 1 : prev - 1);
      try {
        await API.post('/interaction/like', { videoId });
      } catch (err) {
        setLiked(!newLikedStatus);
        setLikesCount(prev => !newLikedStatus ? prev + 1 : prev - 1);
      }
    });
  };

  const handleFollow = () => {
    ensureAuth(async () => {
      try {
        await API.post('/interaction/follow', { userId: ownerId });
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? "Unfollowed" : "Following!");
      } catch (err) {
        toast.error("Action failed");
      }
    });
  };

  const handleRepost = () => {
    ensureAuth(async () => {
      try {
        await API.post('/interaction/repost', { videoId }); 
        setReposted(true);
        toast.success("Reposted! 🔄");
      } catch (err) {
        toast.error("Could not repost");
      }
    });
  };

  return (
    <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-20">
      <div className="relative mb-2">
        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-800">
          <img src={ownerAvatar || "https://ui-avatars.com/api/?name=User"} alt="owner" className="w-full h-full object-cover" />
        </div>
        <button 
          onClick={handleFollow}
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white text-white transition-colors ${isFollowing ? 'bg-green-500' : 'bg-pink-500'}`}
        >
          {isFollowing ? <UserCheck size={12} /> : <span className="text-sm font-bold leading-none">+</span>}
        </button>
      </div>

      <button onClick={handleLike} className="flex flex-col items-center">
        <Heart size={35} className={`transition-all active:scale-125 ${liked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} />
        <span className="text-xs font-bold mt-1 text-white">{likesCount}</span>
      </button>

      {/* Note: Opening comments is allowed for guests, so no ensureAuth here */}
      <button onClick={() => onOpenComments(videoId)} className="flex flex-col items-center">
        <MessageCircle size={35} className="text-white fill-white/10" />
        <span className="text-xs font-bold mt-1 text-white">Comments</span>
      </button>

      <button onClick={handleRepost} className="flex flex-col items-center">
        <Repeat size={32} className={`${reposted ? 'text-green-400' : 'text-white'}`} />
        <span className="text-xs font-bold mt-1 text-white">Repost</span>
      </button>

      <button className="flex flex-col items-center"><Share2 size={32} className="text-white" /></button>
    </div>
  );
};

export default VideoActions;