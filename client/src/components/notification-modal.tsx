import { useNotifications } from "../hooks/use-notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";

export default function NotificationModal() {
  const { isVisible, hideNotification, snoozeNotification } = useNotifications();

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 notification-modal flex items-center justify-center z-50"
      onClick={hideNotification}
      data-testid="notification-modal"
    >
      <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Dumbbell className="text-2xl text-primary-foreground w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2" data-testid="text-notification-title">
              Time to Crush Your Workout! 💪
            </h3>
            <p className="text-muted-foreground mb-6" data-testid="text-notification-message">
              Your scheduled workout is starting now. Let's make it count!
            </p>
            <div className="flex space-x-3">
              <Button 
                className="flex-1"
                onClick={hideNotification}
                data-testid="button-start-workout-now"
              >
                Start Now
              </Button>
              <Button 
                className="flex-1" 
                variant="outline"
                onClick={snoozeNotification}
                data-testid="button-snooze-workout"
              >
                Snooze 5 min
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
