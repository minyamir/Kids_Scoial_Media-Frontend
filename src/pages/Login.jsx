import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as loginApi } from '../api/auth.api';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, ChevronRight, LogIn } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await loginApi(formData);
      login(response.data.user, response.data.token);
      navigate('/'); 
    } catch (err) {
      const msg = err.response?.data?.msg || 'Invalid email or password';
      
      // 🚨 REDIRECT TO OTP IF UNVERIFIED
      if (err.response?.status === 403 && msg.toLowerCase().includes('verify')) {
        navigate('/verify-otp', { state: { email: formData.email } });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#020202] text-white p-6 overflow-hidden">
      
      {/* 🟢🟡🔴 ETHIOPIAN GLOW BACKGROUND */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[150px] rounded-full"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* BRANDING */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-red-500">
            ETHIO-EXCELLENCE
          </h1>
          <p className="text-gray-400 text-sm mt-2 font-medium tracking-wide">Welcome Back, Scholar!</p>
        </div>

        {/* LOGIN CARD */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-2xl">
          
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-2xl text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group relative">
              <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder="Email Address"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-yellow-500/50 focus:bg-white/10 outline-none transition-all text-sm"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="group relative">
              <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-yellow-500/50 focus:bg-white/10 outline-none transition-all text-sm"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-yellow-500 rounded-2xl font-black text-black text-sm uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
            >
              {loading ? 'Entering Academy...' : 'Sign In'}
              {!loading && <LogIn size={18} />}
            </button>
          </form>

          <div className="relative flex items-center py-8">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-gray-600 text-[10px] font-bold tracking-widest">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* SOCIAL LOGIN */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 border border-white/10 rounded-2xl text-white font-bold text-sm hover:bg-white/5 transition-all active:scale-95"
          >
            <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
        </div>

        <p className="mt-8 text-center text-gray-500 text-sm">
          New to the Academy? 
          <Link to="/register" className="text-yellow-500 font-bold hover:underline ml-2">Register Here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;