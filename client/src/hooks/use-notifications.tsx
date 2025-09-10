import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export function useNotifications() {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  const showNotification = useCallback(() => {
    setIsVisible(true);
    
    // Also show browser notification if permission is granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('FitGenius Workout Reminder', {
        body: 'Time to crush your workout! 💪',
        icon: '/favicon.ico',
        tag: 'workout-reminder',
      });
    }
  }, []);

  const hideNotification = useCallback(() => {
    setIsVisible(false);
  }, []);

  const snoozeNotification = useCallback(() => {
    setIsVisible(false);
    toast({
      title: "Workout Snoozed",
      description: "We'll remind you again in 5 minutes.",
    });
    
    // Set snooze timer for 5 minutes
    setTimeout(() => {
      showNotification();
    }, 5 * 60 * 1000); // 5 minutes
  }, [showNotification, toast]);

  // Request notification permission on first load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          toast({
            title: "Notifications Enabled!",
            description: "You'll receive workout reminders.",
          });
        }
      });
    }
  }, [toast]);

  // Demo: Show notification after 3 seconds for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      showNotification();
    }, 3000);

    return () => clearTimeout(timer);
  }, [showNotification]);

  return {
    isVisible,
    showNotification,
    hideNotification,
    snoozeNotification,
  };
}
