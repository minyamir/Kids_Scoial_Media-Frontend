import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// 1. IMPORT YOUR CENTRALIZED API AND BASE_URL
import API, { BASE_URL } from '../api/axios'; 
import { login as loginApi } from '../api/auth.api';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn, Award, BookOpen } from 'lucide-react';
import IMG from '../assets/Kids.png';

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
      if (err.response?.status === 403 && msg.toLowerCase().includes('verify')) {
        navigate('/verify-otp', { state: { email: formData.email } });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. UPDATED GOOGLE LOGIN LOGIC
  const handleGoogleLogin = () => {
    // Dynamically uses the Master Switch URL
    window.location.href = `https://kids-social-media-backend.onrender.com/api/auth/google`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#020202] text-white p-4 md:p-8 overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[150px] rounded-full"></div>

      <div className="w-full max-w-7xl relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16">
        
        {/* Left Side: Branding & Image */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <div className="mb-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-red-500">
              ETHIO-Kids
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium tracking-wide">Digital Academy for Future Scholars</p>
          </div>

          <div className="w-full flex justify-center md:justify-start px-4 md:px-0">
            <img 
              src={IMG}
              alt="Ethio Kids Academy" 
              className="w-full max-w-[320px] md:max-w-[400px] h-auto object-contain drop-shadow-[0_0_25px_rgba(234,179,8,0.25)]"
            />
          </div>

          <div className="max-w-md md:max-w-xl space-y-4 pt-4 px-2 md:px-0">
            <h2 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <BookOpen size={20} className="text-yellow-500"/>
              Unlock Your Potential
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Welcome to the Ethio-Kids Digital Academy! Access your learning dashboard, connect with mentors, and explore lessons designed for the future leaders of Ethiopia.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-green-400 font-medium pt-2">
              <Award size={16} /> Certified Courses
              <Award size={16} /> STEM Focus
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 max-w-md flex flex-col items-center">
          <div className="w-full backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-2xl">
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
    </div>
  );
};

export default Login;