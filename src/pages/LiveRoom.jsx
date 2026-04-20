import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Send, X, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import API, { BASE_URL } from '../api/axios'; 
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Peer from 'simple-peer';

// Sub-component to manage each participant's video
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
  const [peers, setPeers] = useState([]); // Array of {peerID, peer}

  const socketRef = useRef();
  const myVideoRef = useRef();
  const peersRef = useRef([]); // To track peer objects for cleanup
  const scrollRef = useRef();

  const isHost = user?._id === streamerId;

  useEffect(() => {
    socketRef.current = io(BASE_URL.replace('/api', ''), { transports: ["websocket"] });

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      setStream(mediaStream);
      if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;

      // Join the room
      socketRef.current.emit("join_stadium", streamerId);

      // When I join, I get a list of everyone already there
      socketRef.current.on("all_users", (users) => {
        const peers = [];
        users.forEach((userID) => {
          const peer = createPeer(userID, socketRef.current.id, mediaStream);
          peersRef.current.push({ peerID: userID, peer });
          peers.push({ peerID: userID, peer });
        });
        setPeers(peers);
      });

      // When a new person joins while I am already here
      socketRef.current.on("user_joined_stadium", (payload) => {
        const peer = addPeer(payload.signal, payload.callerId, mediaStream);
        peersRef.current.push({ peerID: payload.callerId, peer });
        setPeers((users) => [...users, { peerID: payload.callerId, peer }]);
      });

      // Final handshake step
      socketRef.current.on("receiving_returned_signal", (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        if (item) item.peer.signal(payload.signal);
      });

      socketRef.current.on("user_left", (id) => {
        const peerObj = peersRef.current.find(p => p.peerID === id);
        if(peerObj) peerObj.peer.destroy();
        const remainingPeers = peersRef.current.filter(p => p.peerID !== id);
        peersRef.current = remainingPeers;
        setPeers(remainingPeers);
      });
    });

    socketRef.current.on("new_live_comment", (comment) => {
      setComments((prev) => [...prev, comment]);
    });

    return () => {
      socketRef.current.disconnect();
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [streamerId]);

  function createPeer(userToSignal, callerId, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", (signal) => {
      socketRef.current.emit("sending_signal", { userToSignal, callerId, signal });
    });
    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });
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
      {/* Video Grid Section */}
      <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[250px]">
        {/* My Video Block */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-yellow-500 shadow-lg shadow-yellow-500/10">
          <video ref={myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            You (Boss)
          </div>
        </div>

        {/* Everyone Else's Video Blocks */}
        {peers.map((peerObj) => (
          <div key={peerObj.peerID} className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
            <VideoComponent peer={peerObj.peer} />
          </div>
        ))}
      </div>

      {/* Chat Sidebar (Group Chat) */}
      <div className="w-full md:w-80 lg:w-96 h-[40vh] md:h-full bg-zinc-950 border-l border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5 bg-zinc-900/50 flex justify-between items-center">
          <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest italic">Live Stadium Chat</h2>
          <button onClick={() => navigate('/')} className="p-1 hover:bg-red-500 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {comments.map((msg, idx) => (
            <div key={idx} className="flex gap-3 animate-in slide-in-from-bottom-2">
              <img src={msg.avatarUrl || `https://ui-avatars.com/api/?name=${msg.username}`} className="w-8 h-8 rounded-full object-cover" alt="user" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-zinc-500 uppercase">@{msg.username}</span>
                <p className="text-sm text-white/90">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-zinc-900 flex items-center gap-2">
          <input 
            type="text" value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder="Say something to the group..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-yellow-500 outline-none transition-all" 
          />
          <button type="submit" className="p-3 text-yellow-500 hover:scale-110 active:scale-95 transition-transform"><Send size={20} /></button>
        </form>
      </div>
    </div>
  );
};

export default LiveRoom;