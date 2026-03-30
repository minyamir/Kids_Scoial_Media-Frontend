import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getProfile } from '../api/auth.api';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      // 1. Fetch the user profile using the new token to check verification status
      getProfile(token)
        .then((res) => {
          const user = res.data.user;

          // 🚨 THE GATEKEEPER LOGIC
          // If the scholar hasn't verified their email yet, send them to OTP
          if (!user.isVerified) {
            console.log("Scholar unverified. Redirecting to OTP...");
            navigate(`/verify-otp?email=${user.email}`);
          } else {
            // 2. Scholar is verified. Update context and go home.
            login(user, token);
            navigate('/');
          }
        })
        .catch((err) => {
          console.error("Profile synchronization failed:", err);
          // Redirect to login with a specific error message
          navigate('/login?error=sync_failed');
        });
    } else {
      // No token found in URL, return to login
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