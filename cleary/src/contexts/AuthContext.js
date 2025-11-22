import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, isDemoMode, isFirebaseConfigured } from '../config/firebase';

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
        // Attempt server-side session restore (cookie-based JWT) if no local user loaded yet
        if (!user) {
          (async () => {
            try {
              const resp = await fetch('/api/auth/me', {
                credentials: 'include' // Ensure cookies are sent
              });
              if (resp.ok) {
                const json = await resp.json();
                if (json.authenticated && json.user) {
                  setUser({
                    id: json.user.id,
                    email: json.user.email,
                    name: json.user.name || (json.user.email ? json.user.email.split('@')[0] : 'User'),
                    photoURL: json.user.photoURL || json.user.picture || null,
                    preferences: {
                      mood: 'balanced',
                      topics: ['technology', 'science', 'world'],
                      politicalLean: 'centrist'
                    }
                  });
                }
              }
            } catch (err) {
              console.warn('[Auth] Failed to restore session:', err);
            } finally {
              setLoading(false);
            }
          })();
          return () => {};
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
    // HARD RULE: Unless Firebase explicitly configured & enabled, force server OAuth to avoid stale service worker / build using old Firebase setup.
    const shouldUseFirebase = auth && isFirebaseConfigured && !isDemoMode;
    if (shouldUseFirebase) {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } catch (e) {
        console.error('[Firebase auth error]', e);
        const hint = 'If Google Sign-In fails, enable Identity Toolkit API and Google provider in Firebase, and add your domain to Authorized Domains.';
        throw new Error(`${e.message}. ${hint}`);
      }
    }
    // Fallback: server-side OAuth (default path in demo mode / hard disabled / missing env vars)
    try {
      const resp = await fetch('/api/auth/google/login');
      if (!resp.ok) {
        const json = await resp.json().catch(() => ({}));
        // Show user-friendly setup message
        if (json.error === 'oauth_not_configured') {
          throw new Error(json.message || 'Google Sign-In is not set up yet. Check the console for setup instructions or use guest mode.');
        }
        throw new Error(json.message || 'Server OAuth configuration error. Contact administrator.');
      }
      const { url } = await resp.json();
      if (!url) throw new Error('Server OAuth not available. Missing configuration.');
      
      // Check if popup is already open
      let existingPopup = null;
      try {
        existingPopup = window.open('', 'cleary_google_login');
        if (existingPopup && !existingPopup.closed && existingPopup.location.href !== 'about:blank') {
          existingPopup.focus();
          throw new Error('A login window is already open. Please complete or close it first.');
        }
      } catch (e) {
        // Popup might be from different origin, ignore
      }
      
      // Open popup window
      const w = window.open(url, 'cleary_google_login', 'width=500,height=600,left=100,top=100');
      if (!w || w.closed || typeof w.closed === 'undefined') {
        throw new Error('Popup blocked by browser. Please allow popups for this site and try again.');
      }
      
      // Await message from popup with timeout and error handling
      const authData = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          window.removeEventListener('message', handler);
          if (w && !w.closed) {
            try { w.close(); } catch {}
          }
          reject(new Error('Google login timed out after 2 minutes. Please try again.'));
        }, 120000);
        
        const handler = (event) => {
          // Handle error from popup
          if (event.data && event.data.type === 'cleary-google-login-error') {
            clearTimeout(timeout);
            window.removeEventListener('message', handler);
            reject(new Error('Login failed: ' + (event.data.error || 'Unknown error')));
            return;
          }
          
          // Handle success from popup
          if (!event.data || event.data.type !== 'cleary-google-login') return;
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          resolve(event.data.data);
        };
        
        window.addEventListener('message', handler);
        
        // Check if popup was closed by user
        const checkClosed = setInterval(() => {
          if (w.closed) {
            clearInterval(checkClosed);
            clearTimeout(timeout);
            window.removeEventListener('message', handler);
            reject(new Error('Login cancelled. Popup was closed.'));
          }
        }, 500);
      });
      
      const profile = authData.profile;
      if (!profile || !profile.email) {
        throw new Error('Invalid response from Google. Please try again.');
      }
      
      const localUser = {
        id: profile.id || ('google-' + Date.now()),
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        photoURL: profile.picture || null,
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
          picture: localUser.photoURL,
          provider: 'google-oauth',
          timestamp: Date.now()
        }));
      } catch (storageErr) {
        console.warn('[Auth] Failed to save to localStorage:', storageErr);
      }
      return localUser;
    } catch (e) {
      console.error('[Google OAuth error]', e);
      throw new Error(e.message || 'Failed to sign in with Google. Please try again.');
    }
  };

  const signup = async (email, password, name) => {
    if (!auth) throw new Error('Authentication is not configured');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const logout = async () => {
    if (!auth) {
      setUser(null);
      try { localStorage.removeItem('cleary_user'); } catch {}
      // Inform backend to clear cookie if present
      try {
        await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include' 
        });
      } catch (err) {
        console.warn('[Auth] Failed to clear server session:', err);
      }
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
