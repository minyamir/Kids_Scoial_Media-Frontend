import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import BottomNav from '../components/Layout/BottomNav';

const Notifications = () => {
  const { notifications } = useContext(NotificationContext);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="p-4 border-b border-gray-800 text-center">
        <h1 className="font-bold text-lg">All activity</h1>
      </div>

      <div className="flex flex-col">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif._id} className="flex items-center justify-between p-4 hover:bg-gray-900 transition">
              <div className="flex items-center gap-3">
               <img 
  src={notif.sender.avatarUrl || `https://ui-avatars.com/api/?name=${notif.sender.username}&background=random`} 
  className="w-12 h-12 rounded-full object-cover" 
  alt="user"
/>
                <div>
                  <p className="text-sm">
                    <span className="font-bold">{notif.sender.username}</span> 
                    {notif.type === 'like' ? ' liked your video' : ' started following you'}
                  </p>
                  <p className="text-xs text-gray-500">2h ago</p>
                </div>
              </div>
              
              {notif.type === 'like' && (
                <div className="w-10 h-12 bg-gray-800 rounded overflow-hidden">
                   <video src={notif.videoUrl} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-500">No notifications yet</div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;