import { useEffect } from 'react';

export const useVideoAutoPlay = (containerRef) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target.querySelector('video');
          if (video) {
            if (entry.isIntersecting) {
              video.play().catch(() => {}); // Catch prevents browser "user-gesture" errors
            } else {
              video.pause();
              video.currentTime = 0; // Reset video when scrolled away
            }
          }
        });
      },
      { threshold: 0.7 } // Trigger when 70% of the video is visible
    );

    const cards = containerRef.current?.querySelectorAll('.snap-start');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [containerRef]);
};