import React from 'react';
import { ShieldAlert, Mail, LogOut, Gavel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BannedPage = () => {
  const navigate = useNavigate();

  // Clear any remaining traces of the session
  const handleFinalLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full space-y-8 text-center">
        
        {/* --- Icon Header --- */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={48} className="text-red-500 animate-pulse" />
          </div>
        </div>

        {/* --- Message --- */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            Access <span className="text-red-500">Revoked</span>
          </h1>
          <div className="h-1 w-12 bg-red-500 mx-auto rounded-full" />
          <p className="text-white/60 text-sm leading-relaxed">
            The Scholar Academy safety system has flagged this account for a 
            <strong> Critical Violation</strong> of our educational community guidelines.
          </p>
        </div>

        {/* --- Ban Details Card --- */}
        <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 text-left space-y-6 backdrop-blur-md">
          <div className="flex items-start gap-4">
            <Gavel size={20} className="text-white/40 mt-1" />
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Status</h3>
              <p className="text-sm font-bold text-red-400">Permanently Suspended</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Mail size={20} className="text-white/40 mt-1" />
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Appeals</h3>
              <p className="text-sm text-white/80">
                If you believe this AI moderation was an error, contact 
                <span className="text-yellow-500 ml-1 underline cursor-pointer">support@academy.com</span>
              </p>
            </div>
          </div>
        </div>

        {/* --- Action --- */}
        <button
          onClick={handleFinalLogout}
          className="w-full py-5 rounded-[1.5rem] bg-white text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all duration-300"
        >
          <LogOut size={16} /> Exit Academy
        </button>

        <p className="text-[10px] text-white/20 font-medium uppercase tracking-widest">
          Ref ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default BannedPage;