import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const checkUser = () => {
      const storedUser = localStorage.getItem('cleary_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email, password) => {
    // Mock login - replace with Firebase auth
    const mockUser = { 
      id: '1', 
      email, 
      name: email.split('@')[0],
      preferences: {
        mood: 'balanced',
        topics: ['technology', 'science', 'world'],
        politicalLean: 'centrist'
      }
    };
    setUser(mockUser);
    localStorage.setItem('cleary_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const signup = async (email, password, name) => {
    // Mock signup - replace with Firebase auth
    const mockUser = { 
      id: Date.now().toString(), 
      email, 
      name,
      preferences: {
        mood: 'balanced',
        topics: [],
        politicalLean: 'centrist'
      }
    };
    setUser(mockUser);
    localStorage.setItem('cleary_user', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cleary_user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
