import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ucms_token') || null);
  const [loading, setLoading] = useState(true);

  // Quick credentials for instant viva / presentation switching
  const DEMO_USERS = {
    admin: { email: 'admin@ucms.edu', password: 'Admin@123' },
    'it-staff': { email: 'it.staff@ucms.edu', password: 'Staff@123' },
    'facility-staff': { email: 'facility.staff@ucms.edu', password: 'Staff@123' },
    student: { email: 'student1@ucms.edu', password: 'Student@123' },
    student2: { email: 'student2@ucms.edu', password: 'Student@123' }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('ucms_token');
      const storedUser = localStorage.getItem('ucms_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          // Refresh profile in background
          const res = await authAPI.getMe();
          if (res.data && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('ucms_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          logout();
        }
      } else {
        // Auto-login as student1 on first launch if nothing stored, for instant zero-friction start!
        try {
          const res = await authAPI.login(DEMO_USERS.student);
          setToken(res.data.token);
          setUser(res.data.user);
          localStorage.setItem('ucms_token', res.data.token);
          localStorage.setItem('ucms_user', JSON.stringify(res.data.user));
        } catch (e) {
          // Ignore if server isn't up yet
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('ucms_token', token);
    localStorage.setItem('ucms_user', JSON.stringify(user));
    return user;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { token, user } = res.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('ucms_token', token);
    localStorage.setItem('ucms_user', JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ucms_token');
    localStorage.removeItem('ucms_user');
  };

  const switchRole = async (roleKey) => {
    const creds = DEMO_USERS[roleKey];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        role: user ? user.role : null,
        login,
        register,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
