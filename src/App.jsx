import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import OtpInput from './pages/VerifyOtp';
import Upload from './pages/Upload';     
import Profile from './pages/Profile';   
import LoginSuccess from './pages/LoginSuccess';
import ChatList from './pages/ChatList'; // 📥 Added ChatList (The Inbox)
import ChatRoom from './pages/ChatRoom';
import LiveRoom from './pages/LiveRoom';
import LiveFeed from './pages/LiveFeed'; // Import the new page
import Explore from './pages/Explore';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider> 
        <Router>
          <div className="bg-black min-h-screen text-white">
            <Routes>
              <Route path="/" element={<Home />} />
{/* Knowledge Discovery */}
                <Route path="/discover" element={<Explore />} />
              {/* Auth Flow */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<OtpInput />} />

              {/* Video & Social Features */}
              <Route path="/upload" element={<Upload />} />
{/* This path works for both the host and the viewer */}
              <Route path="/live-feed" element={<LiveFeed/>}/>
              <Route path="/live/:streamerId" element={<LiveRoom />} />
              {/* 💬 Chat System Routes */}
              <Route path="/chat" element={<ChatList />} />         {/* Inbox List */}
              <Route path="/chat/:userId" element={<ChatRoom />} />  {/* Specific Room */}

              {/* User Features */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/login-success" element={<LoginSuccess />} />

              <Route path="*" element={<div className="p-10">Page Not Found</div>} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;