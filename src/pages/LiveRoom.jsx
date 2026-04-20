import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Send, X, Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';
import API, { BASE_URL } from '../api/axios'; 
import { AuthContext } from '../context/AuthContext';
import Peer from 'simple-peer/simplepeer.min.js';

// Component to render individual participant video streams
const VideoComponent = ({ peer }) => {
  const ref = useRef();
  useEffect(() => {
    peer.on("stream", (stream) => {
      if (ref.current) ref.current.srcObject = stream;
    });
  }, [peer]);
  return <video playsInline autoPlay className="w-full h-full object-cover rounded-2xl border border-white/10" ref={ref} />;
};

const LiveRoom = () => {
  const { streamerId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [inputText, setInputText] = useState("");
  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState([]); 

  const socketRef = useRef();
  const myVideoRef = useRef();
  const peersRef = useRef([]); 
  const scrollRef = useRef();

  // STUN servers help bypass firewalls for Peer-to-Peer connections
  const peerConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    // 1. Initialize Socket Connection
    socketRef.current = io(BASE_URL.replace('/api', ''), { transports: ["websocket"] });

    // 2. Get User Media (Camera & Mic)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;

        // 3. Join the Stadium Room
        socketRef.current.emit("join_stadium", streamerId);

        // Receive list of existing users to initiate handshakes
        socketRef.current.on("all_users", (users) => {
          const newPeers = [];
          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, mediaStream);
            peersRef.current.push({ peerID: userID, peer });
            newPeers.push({ peerID: userID, peer });
          });
          setPeers(newPeers);
        });

        // Receive call from a new joiner
        socketRef.current.on("user_joined_stadium", (payload) => {
          const peer = addPeer(payload.signal, payload.callerId, mediaStream);
          peersRef.current.push({ peerID: payload.callerId, peer });
          setPeers((prev) => [...prev, { peerID: payload.callerId, peer }]);
        });

        // Complete the handshake
        socketRef.current.on("receiving_returned_signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          if (item) item.peer.signal(payload.signal);
        });

        // Handle user leaving
        socketRef.current.on("user_left", (id) => {
          const peerObj = peersRef.current.find(p => p.peerID === id);
          if (peerObj) peerObj.peer.destroy();
          const remainingPeers = peersRef.current.filter(p => p.peerID !== id);
          peersRef.current = remainingPeers;
          setPeers(remainingPeers);
        });
      })
      .catch(err => console.error("Media Error:", err));

    // 4. Handle Chat Comments
    socketRef.current.on("new_live_comment", (comment) => {
      setComments((prev) => [...prev, comment]);
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    return () => {
      socketRef.current.disconnect();
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [streamerId]);

  // Function for the person STARTING the call
  function createPeer(userToSignal, callerId, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream, config: peerConfig });
    peer.on("signal", (signal) => {
      socketRef.current.emit("sending_signal", { userToSignal, callerId, signal });
    });
    return peer;
  }

  // Function for the person RECEIVING the call
  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream, config: peerConfig });
    peer.on("signal", (signal) => {
      socketRef.current.emit("returning_signal", { signal, targetId: callerId });
    });
    peer.signal(incomingSignal);
    return peer;
  }

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    socketRef.current.emit("send_live_comment", {
      streamerId, text: inputText, username: user.username, avatarUrl: user.avatarUrl 
    });
    setInputText("");
  };

  return (
    <div className="h-screen w-full bg-[#050505] flex flex-col md:flex-row overflow-hidden text-white">
      {/* --- VIDEO GRID --- */}
      <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[250px]">
        {/* Your Local Video */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-yellow-500 shadow-lg shadow-yellow-500/10">
          <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            You (Boss)
          </div>
        </div>

        {/* Remote Participant Videos */}
        {peers.map((peerObj) => (
          <div key={peerObj.peerID} className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
            <VideoComponent peer={peerObj.peer} />
          </div>
        ))}
      </div>

      {/* --- SIDEBAR CHAT --- */}
      <div className="w-full md:w-80 lg:w-96 h-[40vh] md:h-full bg-zinc-950 border-l border-white/5 flex flex-col shadow-2xl">
        <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
          <div>
             <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest italic">Live Stadium</h2>
             <div className="flex items-center gap-1 text-green-500 text-[9px] font-bold">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> ONLINE
             </div>
          </div>
          <button onClick={() => navigate('/')} className="p-1 hover:bg-red-500 rounded-full transition-colors"><X size={18} /></button>
        </div>

        {/* Comment Waterfall */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.map((msg, idx) => (
            <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <img src={msg.avatarUrl || `https://ui-avatars.com/api/?name=${msg.username}`} className="w-8 h-8 rounded-full border border-white/10" alt="avatar" />
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">@{msg.username}</span>
                <p className="text-sm text-white/90 leading-tight">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900 border-t border-white/5 flex items-center gap-2">
          <input 
            type="text" value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder="Talk to the group..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-600" 
          />
          <button type="submit" className="p-3 bg-yellow-500 text-black rounded-xl hover:scale-105 active:scale-95 transition-transform"><Send size={20} /></button>
        </form>
      </div>
    </div>
  );
};

export default LiveRoom;