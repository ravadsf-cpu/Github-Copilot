// Firebase Configuration
// Replace these values with your actual Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB5lb1sZ5aDb3-DRTaEVKZS4B_Qzzfk6hw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "billion-dollar-startup-2443e.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "billion-dollar-startup-2443e",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "billion-dollar-startup-2443e.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "716243006507",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:716243006507:web:abcdef123456",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-ABCDEF123"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
