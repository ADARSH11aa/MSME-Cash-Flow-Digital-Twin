import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCRpzMWlWO0JH6P-N34BRpDYaw1FJdjkvs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'msme-cashflow.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'msme-cashflow',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'msme-cashflow.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '591114935161',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:591114935161:web:1b4bcb8441b7bc5d542da8',
};

// Initialize Firebase App only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export Firebase Auth instance only
export const auth = getAuth(app);
export default app;
