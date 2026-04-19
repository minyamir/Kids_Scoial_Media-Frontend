import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from '../components/Feed/VideoPlayer';
import BottomNav from '../components/Layout/BottomNav';
import Navbar from '../components/Layout/Navbar';
// Your centralized Axios instance
import API from '../api/axios'; 

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [feedType, setFeedType] = useState('foryou');
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // Function to fetch standard feeds
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const endpoint = feedType === 'foryou' ? '/videos/feed' : '/videos/following';
      const res = await API.get(endpoint);
      setVideos(res.data.videos || []);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Triggered by Navbar search
  const handleSearch = async (query) => {
    if (!query.trim()) {
      fetchVideos(); 
      return;
    }
    setLoading(true);
    try {
      // API instance handles the Base URL automatically
      const res = await API.get(`/videos/search?q=${encodeURIComponent(query)}`);
      setVideos(res.data.videos || []);
    } catch (err) {
      console.error("Search failed:", err);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [feedType]);

  // Intersection Observer for Auto-play logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector('video');
          if (video) {
            if (entry.isIntersecting) {
              video.play().catch(() => {
                // Handle browsers that block auto-play without user interaction
              });
            } else {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.8 } // Trigger when 80% of the video is visible
    );

    const videoCards = containerRef.current?.querySelectorAll('.video-card');
    videoCards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [videos]);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      <Navbar 
        activeTab={feedType} 
        setTab={setFeedType} 
        onSearch={handleSearch} 
      />

      <div 
        ref={containerRef}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {loading ? (
          <div className="h-full flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
               {/* Aesthetic loader for the Academy */}
               <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
               <div className="animate-pulse font-black tracking-widest text-xs uppercase text-yellow-500">Entering Academy...</div>
            </div>
          </div>
        ) : videos.length > 0 ? (
          videos.map((video) => (
            <div key={video._id} className="h-screen w-full snap-start relative video-card">
              <VideoPlayer video={video} />
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-10 text-center">
            <p className="max-w-xs leading-relaxed">
              {feedType === 'following' 
                ? "Follow scholars to see their wisdom in your feed!" 
                : "The library is empty. Try a different search term."}
            </p>
            <button 
                onClick={fetchVideos}
                className="mt-6 px-8 py-3 border border-white/10 rounded-full text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
            >
                Refresh Knowledge
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;