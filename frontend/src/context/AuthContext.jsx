// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();

  useEffect(() => {
    // This effect syncs state if localStorage changes directly (e.g. from other tabs, though less common in SPAs)
    // Or simply to initialize from localStorage on first load if token/user are not already set by initial useState
    const storedToken = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      // Ensure state is cleared if localStorage is empty (e.g. after explicit logout)
      setToken(null);
      setUser(null);
    }
  }, []);

  const loginAction = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({ email: data.email, userId: data.userId }));
    setToken(data.token);
    setUser({ email: data.email, userId: data.userId });
    // Navigation is usually handled by the component calling loginAction
  };

  const logoutAction = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated, loginAction, logoutAction }}>
      {children}
    </AuthContext.Provider>
  );
};
