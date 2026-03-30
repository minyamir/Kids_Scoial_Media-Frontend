import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth.api';
import { Microscope, TowerControl as Castle, Heart, Flame, User, Mail, Lock, ChevronRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#020202] text-white p-6 overflow-hidden">
      
      {/* 🟢🟡🔴 VIBRANT ETHIOPIAN GLOW BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-600/20 blur-[150px] rounded-full animate-pulse"></div>
      <div className="absolute top-[25%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-red-600/20 blur-[150px] rounded-full animate-pulse"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* BRANDING SECTION */}
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 mb-4 border border-yellow-500/30 rounded-full bg-yellow-500/5 backdrop-blur-md">
             <span className="text-[10px] font-bold tracking-[3px] text-yellow-500 uppercase">Ethiopian Youth Academy</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter leading-none mb-2 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            CREATE <br /> <span className="text-yellow-500 italic">FUTURE</span>
          </h1>
          <p className="text-gray-400 text-sm">Science • History • Patriotism</p>
        </div>

        {/* GLASS CARD */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-2xl shadow-black">
          
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-2xl text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* INPUT GROUP */}
            <div className="space-y-4">
              <div className="group relative">
                <User className="absolute left-4 top-4 text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Create Username"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-yellow-500/50 focus:bg-white/10 outline-none transition-all text-sm placeholder:text-gray-600"
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>

              <div className="group relative">
                <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-green-500 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="Student Email"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-green-500/50 focus:bg-white/10 outline-none transition-all text-sm placeholder:text-gray-600"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="group relative">
                <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder="Secure Password"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-red-500/50 focus:bg-white/10 outline-none transition-all text-sm placeholder:text-gray-600"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* CTA BUTTON */}
            <button 
              disabled={loading}
              className="group w-full relative overflow-hidden py-4 bg-yellow-500 rounded-2xl font-black text-black text-sm uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? 'Joining Academy...' : 'Begin Your Journey'}
                {!loading && <ChevronRight size={18} />}
              </span>
            </button>
          </form>

          <div className="mt-8 flex justify-center gap-8 border-t border-white/5 pt-8">
             <Microscope size={20} className="text-gray-600 hover:text-green-500 transition-colors cursor-help" />
             <Castle size={20} className="text-gray-600 hover:text-yellow-500 transition-colors cursor-help" />
             <Heart size={20} className="text-gray-600 hover:text-red-500 transition-colors cursor-help" />
          </div>
        </div>

        <p className="mt-8 text-center text-gray-500 text-xs">
          Already part of the community? 
          <Link to="/login" className="text-white font-bold hover:text-yellow-500 ml-2 underline underline-offset-4">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;