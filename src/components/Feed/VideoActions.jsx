import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Repeat, UserPlus, UserCheck } from 'lucide-react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const VideoActions = ({ 
  videoId, 
  initialLikes, 
  initialIsLiked, 
  ownerAvatar, 
  ownerId, 
  initialIsFollowing,
  onOpenComments // Function passed from Home.js to open the modal
}) => {
  const [liked, setLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [reposted, setReposted] = useState(false);

  // --- Like Logic ---
  const handleLike = async () => {
    const newLikedStatus = !liked;
    setLiked(newLikedStatus);
    setLikesCount(prev => newLikedStatus ? prev + 1 : prev - 1);

    try {
      await API.post('/interaction/like', { videoId });
    } catch (err) {
      setLiked(!newLikedStatus); // Revert on error
      setLikesCount(prev => !newLikedStatus ? prev + 1 : prev - 1);
    }
  };

  
  // --- Follow Logic ---
  const handleFollow = async () => {
    try {
      // FIX: Changed from /api/auth/follow/:id to /api/interaction/follow
      // We pass the ownerId in the request body
      const res = await API.post('/interaction/follow', { userId: ownerId });
      
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed" : "Following!");
    } catch (err) {
      console.error("Follow error:", err);
      toast.error(err.response?.data?.msg || "Action failed");
    }
  };

 // ... inside handleRepost
const handleRepost = async () => {
  try {
    //  FIX: Removed the 's' from /interactions/
    await API.post('/interaction/repost', { videoId }); 
    setReposted(true);
    toast.success("Reposted! 🔄");
  } catch (err) {
    toast.error("Could not repost");
  }
};

  return (
    <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 z-20">
      
      {/* Profile Avatar with Follow Toggle */}
      <div className="relative mb-2">
        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-800">
          <img 
            src={ownerAvatar || "https://ui-avatars.com/api/?name=User"} 
            alt="owner" 
            className="w-full h-full object-cover" 
          />
        </div>
        {/* Only show plus icon if not already following */}
        <button 
          onClick={handleFollow}
          className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full w-5 h-5 flex items-center justify-center border-2 border-white text-white transition-colors ${isFollowing ? 'bg-green-500' : 'bg-pink-500'}`}
        >
          {isFollowing ? <UserCheck size={12} /> : <span className="text-sm font-bold leading-none">+</span>}
        </button>
      </div>

      {/* Like Button */}
      <button onClick={handleLike} className="flex flex-col items-center">
        <Heart 
          size={35} 
          className={`transition-all active:scale-125 ${liked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} 
        />
        <span className="text-xs font-bold mt-1 text-white shadow-sm">{likesCount}</span>
      </button>

      {/* Comment Button - Calls parent function to open Modal */}
      <button onClick={() => onOpenComments(videoId)} className="flex flex-col items-center">
        <MessageCircle size={35} className="text-white fill-white/10" />
        <span className="text-xs font-bold mt-1 text-white shadow-sm">Comments</span>
      </button>

      {/* Repost Button */}
      <button onClick={handleRepost} className="flex flex-col items-center">
        <Repeat 
          size={32} 
          className={`transition-colors ${reposted ? 'text-green-400' : 'text-white'}`} 
        />
        <span className="text-xs font-bold mt-1 text-white shadow-sm">Repost</span>
      </button>

      {/* Share Button */}
      <button className="flex flex-col items-center">
        <Share2 size={32} className="text-white" />
        <span className="text-xs font-bold mt-1 text-white">Share</span>
      </button>

    </div>
  );
};

export default VideoActions;