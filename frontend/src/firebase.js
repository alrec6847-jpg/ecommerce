import { initializeApp } from 'firebase/app';
// import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging - DISABLED
const messaging = null;

// Export Firebase app instance
export { app };

// Request permission and get token - DISABLED
export const requestNotificationPermission = async () => {
  return null;
};

// Listen for foreground messages - DISABLED
export const onMessageListener = async () => {
  return new Promise(() => {});
};

// Show notification - DISABLED
export const showNotification = (title, body) => {
  console.log('Notification suppressed:', title, body);
};

export default app;
