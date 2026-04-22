// Firebase Cloud Messaging service worker - DISABLED to fix white screen
// import { getMessaging, getToken, onMessage } from "firebase/messaging";
// import { app } from "../firebase";

// Get messaging instance
const messaging = null;

// Register service worker
export const registerServiceWorker = () => {
  return null;
};

// Get FCM token
export const getFCMToken = async () => {
  return null;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  return false;
};

// Listen for foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    // Empty promise that never resolves since messaging is disabled
  });
};

// Register admin token for notifications
export const registerAdminToken = async (token) => {
  // Disabled
  return true;
};
