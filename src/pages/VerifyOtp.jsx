import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../api/auth.api'; // Ensure resendOtp is exported from your API
import { AuthContext } from '../context/AuthContext';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60); // 60-second countdown
  const [canResend, setCanResend] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);

  const email = location.state?.email || searchParams.get('email');

  useEffect(() => {
    if (!email) navigate('/login');
  }, [email, navigate]);

  // Timer Logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await resendOtp({ email });
      setTimer(60); // Reset timer to 60s
      setCanResend(false);
      setError('');
      alert("A fresh code has been sent!");
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Verify Identity</h2>
          <p className="text-gray-400 text-sm">
            Enter the 6-digit code sent to <br />
            <span className="text-pink-500 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              maxLength="6"
              value={otp}
              placeholder="000000"
              className="w-full p-4 bg-gray-900 border border-gray-800 rounded-lg text-center text-3xl font-mono tracking-[0.75rem] focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
            />
            {error && (
              <p className="absolute -bottom-6 left-0 right-0 text-red-500 text-xs mt-2">
                {error}
              </p>
            )}
          </div>

          <button 
            disabled={loading || otp.length < 6}
            className={`w-full py-4 font-bold rounded-lg transition-all ${
              loading || otp.length < 6 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-pink-600 hover:bg-pink-700 text-white'
            }`}
          >
            {loading ? 'Processing...' : 'Authenticate Scholar'}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="pt-4">
          {canResend ? (
            <button 
              onClick={handleResend}
              className="text-pink-500 hover:text-pink-400 text-sm font-bold underline underline-offset-4 transition-colors"
            >
              Resend New Code
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Resend code in <span className="text-pink-500 font-mono">{timer}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;