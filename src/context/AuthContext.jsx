import { createContext, useState, useEffect } from 'react';
import { getProfile } from '../api/auth.api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // 🔥 Added loading state

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Validate token and get user data from backend
          const response = await getProfile(token);
          setUser(response.data.user);
        } catch (err) {
          console.error("Session expired or invalid token");
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token,setUser, loading, login, logout }}>
      {!loading && children} {/* 🛡️ Don't render app until auth is checked */}
    </AuthContext.Provider>
  );
};