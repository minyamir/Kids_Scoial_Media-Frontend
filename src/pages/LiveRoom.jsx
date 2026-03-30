import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Send, X, Users, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Peer from 'simple-peer';

const LiveRoom = () => {
  const { streamerId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [comments, setComments] = useState([]);
  const [inputText, setInputText] = useState("");
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const socketRef = useRef();
  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();
  const scrollRef = useRef();

  const isHost = user?._id === streamerId;

  // --- MEDIA TOGGLE FUNCTIONS ---
  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
      setIsVideoOff(!isVideoOff);
    }
  };

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      if (isHost) {
        socketRef.current.emit("start_live", streamerId);
      } else {
        socketRef.current.emit("join_live_room", streamerId);
      }
    });

    socketRef.current.on("new_live_comment", (comment) => {
      setComments((prev) => [...prev, comment]);
    });

    return () => socketRef.current?.disconnect();
  }, [streamerId]);

  useEffect(() => {
    const startConnection = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;

        if (!isHost) {
          const peer = new Peer({ initiator: true, trickle: false, stream: mediaStream });
          setupPeerEvents(peer);
          peerRef.current = peer;
        }

        socketRef.current.on("user_joined", (data) => {
          const peer = new Peer({ initiator: false, trickle: false, stream: mediaStream });
          setupPeerEvents(peer);
          peer.signal(data.signal);
          peerRef.current = peer;
        });

        socketRef.current.on("receiving_returned_signal", (data) => {
          peerRef.current?.signal(data.signal);
        });

      } catch (err) {
        toast.error("Camera access denied");
      }
    };

    if (socketRef.current) startConnection();

    return () => {
      peerRef.current?.destroy();
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [isHost]);

  const setupPeerEvents = (peer) => {
    peer.on("signal", (signal) => {
      const event = isHost ? "returning_signal" : "sending_signal";
      socketRef.current.emit(event, { signal, streamerId, callerId: user._id });
    });

    peer.on("stream", (remoteStream) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    });
  };

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    socketRef.current.emit("send_live_comment", {
      streamerId, text: inputText, username: user.username, avatarUrl: user.avatarUrl
    });
    setInputText("");
  };

  return (
    <div className="h-screen w-full bg-black flex flex-col md:flex-row overflow-hidden text-white">
      <div className="relative flex-1 bg-zinc-900 flex items-center justify-center">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

        <div className="absolute top-24 right-6 w-32 md:w-48 aspect-video rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-50 bg-black">
          <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          {isVideoOff && (
            <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
              <VideoOff size={20} className="text-zinc-500" />
            </div>
          )}
          <div className="absolute bottom-1 left-2 bg-black/50 px-2 py-0.5 rounded text-[8px] font-bold">YOU</div>
        </div>

        {/* --- FLOATING CONTROLS --- */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-50 bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
          <button 
            onClick={toggleAudio} 
            className={`p-4 rounded-xl transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button 
            onClick={toggleVideo} 
            className={`p-4 rounded-xl transition-all ${isVideoOff ? 'bg-red-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
        </div>

        <div className="absolute top-6 left-6 flex flex-col gap-2 z-50">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">LIVE</div>
            <span className="text-xs font-black shadow-lg uppercase">
              {isHost ? "Broadcasting" : `Watching @${streamerId}`}
            </span>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-red-600 rounded-full z-50"><X size={20} /></button>
      </div>

      <div className="w-full md:w-96 h-[40vh] md:h-full bg-zinc-950 border-l border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Waterfall</h2>
          <div className="flex items-center gap-1 text-green-500"><Users size={14} /> <span className="text-xs">Active</span></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.map((msg, idx) => (
            <div key={idx} className="flex gap-3 animate-in slide-in-from-bottom-2">
              <img src={msg.avatarUrl ? `http://localhost:5000${msg.avatarUrl}` : `https://ui-avatars.com/api/?name=${msg.username}`} className="w-8 h-8 rounded-full border border-white/10" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">@{msg.username}</span>
                <p className="text-sm text-white/90">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900/80 backdrop-blur-md flex items-center gap-2">
          <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type a message..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
          <button type="submit" className="p-3 text-red-500 hover:scale-110"><Send size={20} /></button>
        </form>
      </div>
    </div>
  );
};

export default LiveRoom;