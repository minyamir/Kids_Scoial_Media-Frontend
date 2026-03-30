import React from 'react';
import { Bell } from 'lucide-react';

const NotificationToast = ({ message }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
      <div className="bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
        <div className="bg-pink-600 p-2 rounded-full">
          <Bell size={18} />
        </div>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default NotificationToast;