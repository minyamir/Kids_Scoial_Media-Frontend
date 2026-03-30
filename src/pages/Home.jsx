import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from '../components/Feed/VideoPlayer';
import BottomNav from '../components/Layout/BottomNav';
import Navbar from '../components/Layout/Navbar';
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
      fetchVideos(); // Return to normal feed if search is empty
      return;
    }
    setLoading(true);
    try {
      const res = await API.get(`/videos/search?q=${query}`);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector('video');
          if (video) {
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.8 }
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
            <div className="animate-pulse">Loading Academy...</div>
          </div>
        ) : videos.length > 0 ? (
          videos.map((video) => (
            <div key={video._id} className="h-screen w-full snap-start relative video-card">
              <VideoPlayer video={video} />
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 p-10 text-center">
            <p>{feedType === 'following' ? "Follow scholars to see their wisdom!" : "No knowledge found matching your search."}</p>
            <button 
                onClick={fetchVideos}
                className="mt-4 text-yellow-500 text-sm font-bold uppercase tracking-widest"
            >
                Reset Feed
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;