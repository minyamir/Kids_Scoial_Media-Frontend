// src/hooks/useGuestGate.js
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const useGuestGate = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleAction = (callback) => {
    if (!token) {
      toast("Please sign in to join the Academy", {
        icon: '🎓',
        style: { background: '#1a1a1a', color: '#fff', borderRadius: '1rem' }
      });
      navigate('/login');
      return;
    }
    // If they have a token, run the like/comment/follow function
    callback();
  };

  return { handleAction, isGuest: !token };
};