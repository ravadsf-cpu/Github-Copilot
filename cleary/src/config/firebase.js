// Firebase Configuration
// Replace these values with your actual Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Add a hard disable flag so we can force server-side OAuth even if stale build/service worker keeps old Firebase config.
// To re-enable Firebase auth, set REACT_APP_ENABLE_FIREBASE_AUTH=true and provide all required Firebase env vars.
const HARD_DISABLE_FIREBASE = process.env.REACT_APP_ENABLE_FIREBASE_AUTH !== 'true';

// Safe guard: require ALL critical Firebase variables; if any missing OR hard disable flag set -> demo mode.
const requiredVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_AUTH_DOMAIN'
];
const missingVars = requiredVars.filter(k => !process.env[k]);
const missingEnv = missingVars.length > 0 || HARD_DISABLE_FIREBASE;

console.log('[firebase] Firebase env check:', {
  hasApiKey: !!process.env.REACT_APP_FIREBASE_API_KEY,
  hasProjectId: !!process.env.REACT_APP_FIREBASE_PROJECT_ID,
  hasAuthDomain: !!process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  hardDisableFlag: HARD_DISABLE_FIREBASE,
  missingVars,
  missingEnv,
  willUseDemoMode: missingEnv
});

let firebaseConfig = null;
if (!missingEnv) {
  firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  };
}

// Initialize Firebase
let app;
if (firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('[firebase] Firebase initialized successfully');
  } catch (e) {
    console.warn('[firebase] initialization failed, falling back to demo mode:', e.message);
    app = { __demo: true };
  }
} else {
  // Explicit demo mode when env vars missing
  if (HARD_DISABLE_FIREBASE) {
    console.log('[firebase] HARD DISABLED (REACT_APP_ENABLE_FIREBASE_AUTH!=true) -> forcing server OAuth');
  } else {
    console.log('[firebase] No Firebase config found, using demo mode (server OAuth fallback)');
  }
  app = { __demo: true };
}

// Initialize Firebase services
export const auth = app.__demo ? null : getAuth(app);
export const db = app.__demo ? null : getFirestore(app);
export const analytics = (!app.__demo && typeof window !== 'undefined') ? getAnalytics(app) : null;
export const isDemoMode = !!app.__demo;
export const isFirebaseConfigured = !isDemoMode; // explicit flag for consumer logic

if (isDemoMode) {
  console.log('[firebase] ✅ Demo mode active - Google Sign-In will use SERVER OAuth (no Firebase).');
  if (missingVars.length) {
    console.log('[firebase] Missing vars ->', missingVars.join(', '));
  }
} else {
  console.log('[firebase] ✅ Firebase mode active - will use Firebase Auth');
}

export default app;
