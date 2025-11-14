import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, isDemoMode } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      // Demo mode: try local session rehydration if present
      try {
        const raw = localStorage.getItem('cleary_user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.email || parsed.displayName || parsed.name)) {
            setUser({
              id: parsed.uid || 'local',
              email: parsed.email || null,
              name: parsed.displayName || parsed.name || (parsed.email ? parsed.email.split('@')[0] : 'User'),
              photoURL: parsed.photoURL || null,
              preferences: parsed.preferences || {
                mood: 'balanced',
                topics: ['technology', 'science', 'world'],
                politicalLean: 'centrist'
              }
            });
          }
        }
      } catch {}
      setLoading(false);
      return () => {};
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'User'),
          photoURL: firebaseUser.photoURL,
          preferences: {
            mood: 'balanced',
            topics: ['technology', 'science', 'world'],
            politicalLean: 'centrist'
          }
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    if (!auth) throw new Error('Authentication is not configured');
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error('Authentication is not configured');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (e) {
      // Provide clearer error for blocked Identity Toolkit
      const hint = 'If Google Sign-In fails, enable Identity Toolkit API and Google provider in Firebase, and add your domain to Authorized Domains.';
      throw new Error(`${e.message}. ${hint}`);
    }
  };

  const signup = async (email, password, name) => {
    if (!auth) throw new Error('Authentication is not configured');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const logout = () => {
    if (!auth) {
      setUser(null);
      try { localStorage.removeItem('cleary_user'); } catch {}
      return Promise.resolve();
    }
    return signOut(auth);
  };

  const loginAsGuest = async () => {
    const guestUser = {
      id: 'guest',
      email: null,
      name: 'Guest',
      photoURL: null,
      preferences: {
        mood: 'balanced',
        topics: ['technology', 'science', 'world'],
        politicalLean: 'centrist'
      }
    };
    setUser(guestUser);
    return guestUser;
  };

  // Local/demo login helper for when Firebase auth is not configured
  const loginLocal = async ({ email, name }) => {
    const localUser = {
      id: 'local-' + Date.now(),
      email: email || null,
      name: name || (email ? email.split('@')[0] : 'User'),
      photoURL: null,
      preferences: {
        mood: 'balanced',
        topics: ['technology', 'science', 'world'],
        politicalLean: 'centrist'
      }
    };
    setUser(localUser);
    try {
      localStorage.setItem('cleary_user', JSON.stringify({
        email: localUser.email,
        displayName: localUser.name,
        uid: localUser.id,
        timestamp: Date.now()
      }));
    } catch {}
    return localUser;
  };

  const value = {
    user,
    login,
    loginWithGoogle,
    signup,
    logout,
    loading,
    isDemoMode,
    loginAsGuest,
    loginLocal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
