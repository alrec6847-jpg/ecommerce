import { useEffect, useState } from 'react';
import { 
  registerServiceWorker, 
  requestNotificationPermission, 
  getFCMToken, 
  registerAdminToken,
  onMessageListener 
} from '../utils/notifications';

const NotificationManager = ({ isAdmin = false }) => {
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      /*
      try {
        // Register service worker
        registerServiceWorker();

        // Request notification permission
        const permissionGranted = await requestNotificationPermission();
        setNotificationPermission(permissionGranted);

        if (permissionGranted) {
          // Get FCM token
          const fcmToken = await getFCMToken();
          setToken(fcmToken);

          // If admin, register token for admin notifications
          if (isAdmin && fcmToken) {
            await registerAdminToken(fcmToken);
          }
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
      */
    };

    initializeNotifications();
  }, [isAdmin]);

  useEffect(() => {
    /*
    // Listen for foreground messages
    const unsubscribe = onMessageListener()
      .then(payload => {
        console.log('Foreground message received:', payload);
        // You can handle foreground messages here, e.g., show a custom notification
      })
      .catch(err => console.log('Failed to receive foreground message:', err));
    */

    return () => {
      // Cleanup if needed
    };
  }, []);

  return null; // This component doesn't render anything
};

export default NotificationManager;
