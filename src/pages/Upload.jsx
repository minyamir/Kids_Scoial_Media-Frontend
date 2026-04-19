import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, Sparkles, Type } from 'lucide-react';
import { uploadVideo } from '../api/video.api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // 50MB Limit is smart for free-tier hosting like Render/Cloudinary
      if (selectedFile.size > 50 * 1024 * 1024) {
        alert("Lesson is too large! Please keep videos under 50MB.");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', description); 

    try {
      await uploadVideo(formData);
      navigate('/'); 
    } catch (err) {
      const serverMessage = err.response?.data?.msg || "Upload failed";
      
      // 🛡️ BDU Security Logic: Handle account restrictions
      if (err.response?.status === 403) {
        localStorage.removeItem("token"); 
        navigate('/banned'); 
        return;
      }

      alert(serverMessage); 
      console.error("Upload Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans">
      {/* --- Elegant Header --- */}
      <div className="flex justify-between items-center px-6 py-8 bg-gradient-to-b from-black/50 to-transparent">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <X size={24} />
        </button>
        <h2 className="text-xs font-black tracking-[0.3em] uppercase text-white/60">Contribute Knowledge</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col items-center px-6 pb-10">
        {!preview ? (
          /* --- Modern Drag & Drop Zone --- */
          <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center border border-white/10 bg-white/[0.03] rounded-[2.5rem] p-10 text-center backdrop-blur-md relative group overflow-hidden">
            <div className="absolute inset-0 bg-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <UploadIcon size={32} className="text-yellow-500" />
            </div>

            <h3 className="text-xl font-bold mb-2">Share your wisdom</h3>
            <p className="text-sm text-white/40 mb-8 max-w-[200px]">Vertical videos (9:16) work best for the academy feed.</p>
            
            <label className="bg-white text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-yellow-500 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Choose Footage
              <input type="file" accept="video/*" hidden onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          /* --- Editor View --- */
          <div className="w-full max-w-lg flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="relative aspect-[9/16] bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl max-h-[450px]">
              <video src={preview} className="w-full h-full object-cover" controls />
              <button 
                onClick={() => {setPreview(null); setFile(null);}} 
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full hover:bg-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/40 mb-2">
                  <Type size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Scholar's Caption</span>
                </div>
                <textarea
                  placeholder="Explain the context of this knowledge..."
                  className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-[1.5rem] focus:outline-none focus:border-yellow-500/50 transition-all resize-none text-sm leading-relaxed"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-[1.5rem]"
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-600 transition-all ${loading ? 'opacity-20' : 'opacity-100'}`} />
                <div className="relative py-5 font-black text-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="animate-pulse">Archiving...</span>
                  ) : (
                    <>
                      Post to Academy <Sparkles size={14} />
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;