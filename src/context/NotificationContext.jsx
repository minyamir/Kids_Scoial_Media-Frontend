import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useContext(AuthContext);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await API.get('/notifications'); // Your backend endpoint
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  // Poll for new notifications every 10 seconds
  // useEffect(() => {
  //   fetchNotifications();
  //   const interval = setInterval(fetchNotifications, 10000);
  //   return () => clearInterval(interval);
  // }, [token]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};