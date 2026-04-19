import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 1. Manually fetch profile using the token from URL 
      // We use raw axios here to avoid interceptor issues before the token is saved
      axios.get("https://kids-social-media-backend.onrender.com/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const user = res.data.user;

        // 2. The Gatekeeper Logic
        if (!user.isVerified) {
          console.log("Scholar unverified. Redirecting to OTP...");
          navigate(`/verify-otp?email=${user.email}`);
        } else {
          // 3. Save to LocalStorage and update Context
          localStorage.setItem('token', token);
          login(user, token);
          
          // 4. Mission Accomplished: Go Home
          navigate('/');
        }
      })
      .catch((err) => {
        console.error("Identity synchronization failed:", err);
        navigate('/login?error=sync_failed');
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="h-screen bg-[#020202] flex flex-col items-center justify-center">
      {/* Premium Scholar Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-pink-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <p className="text-pink-500 font-black tracking-[0.4em] uppercase text-[11px] animate-pulse">
          Synchronizing Identity
        </p>
        <p className="text-gray-600 text-[10px] italic tracking-wide">
          Securing your terminal, Scholar...
        </p>
      </div>
    </div>
  );
};

export default LoginSuccess;