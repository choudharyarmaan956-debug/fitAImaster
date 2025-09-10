import { useState } from "react";
import OnboardingForm from "../components/onboarding-form";
import Dashboard from "../components/dashboard";
import WorkoutPlan from "../components/workout-plan";
import NutritionTracker from "../components/nutrition-tracker";
import AlarmSystem from "../components/alarm-system";
import ProgressTracker from "../components/progress-tracker";
import NotificationModal from "../components/notification-modal";
import { useNotifications } from "../hooks/use-notifications";
import { Dumbbell, Bell } from "lucide-react";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const { showNotification } = useNotifications();

  const handleUserCreated = (user: any) => {
    setCurrentUser(user);
  };

  if (!currentUser) {
    return <OnboardingForm onUserCreated={handleUserCreated} />;
  }

  return (
    <div className="min-h-screen gradient-surface">
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Dumbbell className="text-primary-foreground w-4 h-4" />
              </div>
              <h1 className="text-xl heading-2 gradient-text-primary">FitGenius</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => setActiveSection("dashboard")}
                className={`transition-colors hover-lift ${activeSection === "dashboard" ? "text-primary gradient-text-primary" : "text-foreground hover:text-primary"}`}
                data-testid="nav-dashboard"
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveSection("workouts")}
                className={`transition-colors ${activeSection === "workouts" ? "text-primary" : "text-foreground hover:text-primary"}`}
                data-testid="nav-workouts"
              >
                Workouts
              </button>
              <button 
                onClick={() => setActiveSection("nutrition")}
                className={`transition-colors ${activeSection === "nutrition" ? "text-primary" : "text-foreground hover:text-primary"}`}
                data-testid="nav-nutrition"
              >
                Nutrition
              </button>
              <button 
                onClick={() => setActiveSection("progress")}
                className={`transition-colors ${activeSection === "progress" ? "text-primary" : "text-foreground hover:text-primary"}`}
                data-testid="nav-progress"
              >
                Progress
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <button 
                className="p-2 rounded-lg hover:bg-muted transition-colors" 
                onClick={showNotification}
                data-testid="button-notifications"
              >
                <Bell className="text-foreground w-5 h-5" />
              </button>
              <div className="w-8 h-8 gradient-bg rounded-full shadow-glow hover-scale"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === "dashboard" && <Dashboard user={currentUser} />}
        {activeSection === "workouts" && <WorkoutPlan user={currentUser} />}
        {activeSection === "nutrition" && <NutritionTracker user={currentUser} />}
        {activeSection === "progress" && <ProgressTracker user={currentUser} />}
        
        {/* Alarm System - always visible */}
        <AlarmSystem user={currentUser} />
      </main>

      <NotificationModal />
    </div>
  );
}
