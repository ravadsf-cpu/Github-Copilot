// Firebase Configuration
// Replace these values with your actual Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Safe guard: if required env vars aren't set, we fallback to a no-auth demo mode
const missingEnv = !process.env.REACT_APP_FIREBASE_API_KEY || !process.env.REACT_APP_FIREBASE_PROJECT_ID;

const firebaseConfig = missingEnv ? {
  // Demo fallback config (no real auth). User can still browse feed.
  apiKey: 'demo-api-key',
  authDomain: 'demo.invalid',
  projectId: 'demo-project',
  storageBucket: 'demo-project.appspot.com',
  messagingSenderId: '0',
  appId: '1:0:web:demo',
  measurementId: 'G-DEMO'
} : {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (e) {
  console.warn('[firebase] initialization failed, falling back to demo mode:', e.message);
  app = { __demo: true };
}

// Initialize Firebase services
export const auth = app.__demo ? null : getAuth(app);
export const db = app.__demo ? null : getFirestore(app);
export const analytics = (!app.__demo && typeof window !== 'undefined') ? getAnalytics(app) : null;
export const isDemoMode = !!app.__demo || missingEnv;

export default app;
