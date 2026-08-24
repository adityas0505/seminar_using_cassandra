import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = () => {
      // Check standard user
      const userToken = localStorage.getItem('user_token');
      const userData = localStorage.getItem('user_data');
      if (userToken && userData) {
        setUser(JSON.parse(userData));
      }

      // Check admin user
      const adminToken = localStorage.getItem('admin_token');
      const adminData = localStorage.getItem('admin_data');
      if (adminToken && adminData) {
        setAdmin(JSON.parse(adminData));
      }

      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser } = res.data;

    const prefix = loggedUser.role === 'admin' ? 'admin' : 'user';
    localStorage.setItem(`${prefix}_token`, token);
    localStorage.setItem(`${prefix}_data`, JSON.stringify(loggedUser));

    if (loggedUser.role === 'admin') {
      setAdmin(loggedUser);
    } else {
      setUser(loggedUser);
    }

    return res.data;
  };

  const register = async (name, email, password, role = 'user') => {
    const res = await api.post('/auth/register', { name, email, password, role });
    const { token, user: loggedUser } = res.data;

    const prefix = loggedUser.role === 'admin' ? 'admin' : 'user';
    localStorage.setItem(`${prefix}_token`, token);
    localStorage.setItem(`${prefix}_data`, JSON.stringify(loggedUser));

    if (loggedUser.role === 'admin') {
      setAdmin(loggedUser);
    } else {
      setUser(loggedUser);
    }

    return res.data;
  };

  const logout = (role = 'user') => {
    localStorage.removeItem(`${role}_token`);
    localStorage.removeItem(`${role}_data`);
    if (role === 'admin') {
      setAdmin(null);
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, admin, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
