import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Dumbbell, TrendingUp, Trophy, Play, Utensils, AlarmClock, RotateCcw, Heart, Zap, Apple, Coffee } from "lucide-react";
import DailyCheckin from "./daily-checkin";
import WorkoutTimer from "./workout-timer";

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [backgroundTheme, setBackgroundTheme] = useState('morning');
  const [showCelebration, setShowCelebration] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, icon: string, x: number, y: number, delay: number}>>([]);
  const [showWorkoutTimer, setShowWorkoutTimer] = useState(false);

  const { data: todayCalories = { totalCalories: 0 } } = useQuery<{ totalCalories: number }>({
    queryKey: ["/api/calories/today", user.id],
    enabled: !!user.id,
  });

  const { data: todayMacros = { protein: 0, carbs: 0, fat: 0 } } = useQuery<{ protein: number; carbs: number; fat: number }>({
    queryKey: ["/api/macros/today", user.id],
    enabled: !!user.id,
  });

  const { data: latestProgress } = useQuery<{ weight?: number; workoutsCompleted?: number } | undefined>({
    queryKey: ["/api/progress/latest", user.id],
    enabled: !!user.id,
  });

  const { data: userAchievements = [] } = useQuery<any[]>({
    queryKey: ["/api/achievements/user", user.id],
    enabled: !!user.id,
  });

  const caloriesConsumed = todayCalories.totalCalories;
  const caloriesRemaining = (user.calorieTarget || 2000) - caloriesConsumed;
  const calorieProgress = Math.min((caloriesConsumed / (user.calorieTarget || 2000)) * 100, 100);

  // Gen Z Fitness Humor Quotes
  const genZQuotes = [
    { text: "Accidentally did a burpee. Please send help 😅", emoji: "🆘" },
    { text: "My relationship status? In a committed relationship with my gains", emoji: "💪" },
    { text: "Gym hair, don't care 💪", emoji: "💇‍♀️" },
    { text: "Leg day: When walking upstairs becomes a life achievement", emoji: "🏆" },
    { text: "Plot twist: The gym membership was the friends we made along the way", emoji: "🤝" },
    { text: "Rest day? More like 'I'm secretly planning my comeback' day", emoji: "🧠" },
    { text: "Netflix called, but your dumbbells are louder", emoji: "📺" },
    { text: "You're on fire! 🔥 (Metaphorically, please stay hydrated)", emoji: "💧" },
    { text: "Even superheroes have off days... but you're not having one today!", emoji: "🦸‍♀️" },
    { text: "Main character energy activated ✨", emoji: "⭐" }
  ];

  // Time-based background themes
  const getTimeBasedTheme = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning'; // Morning yoga
    if (hour >= 12 && hour < 17) return 'afternoon'; // Afternoon HIIT  
    return 'evening'; // Evening stretching
  };

  // Generate floating particles
  useEffect(() => {
    const icons = ['💪', '🏋️', '🥗', '💧', '⚡', '🔥', '🏃‍♀️', '🧘‍♀️'];
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 10
    }));
    setParticles(newParticles);
  }, []);

  // Rotate quotes every 8 seconds
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % genZQuotes.length);
    }, 8000);
    return () => clearInterval(quoteInterval);
  }, [genZQuotes.length]);

  // Update background theme based on time
  useEffect(() => {
    setBackgroundTheme(getTimeBasedTheme());
    const themeInterval = setInterval(() => {
      setBackgroundTheme(getTimeBasedTheme());
    }, 60000); // Check every minute
    return () => clearInterval(themeInterval);
  }, []);

  // Trigger celebration for achievements
  useEffect(() => {
    if (calorieProgress >= 100 || (latestProgress?.workoutsCompleted && latestProgress.workoutsCompleted >= 5)) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [calorieProgress, latestProgress?.workoutsCompleted]);

  const getBackgroundClasses = () => {
    const baseClasses = "fixed inset-0 transition-all duration-1000 ease-in-out opacity-20";
    switch (backgroundTheme) {
      case 'morning':
        return `${baseClasses} nutrition-morning dark:nutrition-morning`;
      case 'afternoon':
        return `${baseClasses} workouts-afternoon dark:workouts-afternoon`;
      case 'evening':
        return `${baseClasses} progress-evening dark:progress-evening`;
      default:
        return `${baseClasses} gradient-surface`;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className={getBackgroundClasses()}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent gradient-animation"></div>
      </div>

      {/* Daily Check-in Component */}
      <div className="relative z-10 mb-6">
        <DailyCheckin user={user} />
      </div>

      {/* Floating Particle Animation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute text-2xl opacity-20 float-animation"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          >
            {particle.icon}
          </div>
        ))}
      </div>

      {/* Achievement Celebration Confetti */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl animate-bounce">🎉</div>
            <div className="absolute inset-0 animate-ping">
              <div className="w-4 h-4 bg-yellow-400 rounded-full absolute top-0 left-0"></div>
              <div className="w-3 h-3 bg-pink-400 rounded-full absolute top-4 right-2"></div>
              <div className="w-5 h-5 bg-blue-400 rounded-full absolute bottom-2 left-3"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full absolute bottom-0 right-0"></div>
            </div>
          </div>
        </div>
      )}

      {/* Gen Z Motivational Quote Banner */}
      <div className="relative z-10 mb-8">
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800 shadow-lg backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl animate-pulse">{genZQuotes[currentQuote].emoji}</div>
                <div>
                  <p className="text-lg font-medium text-foreground italic">
                    "{genZQuotes[currentQuote].text}"
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Daily Motivation • Fitness Vibes
                  </p>
                </div>
              </div>
              <div className="hidden md:flex space-x-2">
                {genZQuotes.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentQuote ? 'bg-purple-500 scale-125' : 'bg-purple-200 dark:bg-purple-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="relative z-10 mb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 slide-up">
        <Card className="card-professional hover-lift hover-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Today's Calories</p>
                <p className="text-2xl font-bold gradient-text-primary count-up" data-testid="text-calories-consumed">
                  {caloriesConsumed}
                </p>
                <p className={`text-sm ${caloriesRemaining < 200 ? "text-destructive" : "text-muted-foreground"}`}>
                  {caloriesRemaining > 0 ? `${caloriesRemaining} remaining` : `${Math.abs(caloriesRemaining)} over limit`}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Flame className="text-accent w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">This Week's Workouts</p>
                <p className="text-2xl font-bold gradient-text-primary count-up" data-testid="text-workouts-completed">
                  {latestProgress?.workoutsCompleted || 0}
                </p>
                <p className="text-secondary text-sm">Great progress!</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Dumbbell className="text-secondary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Current Weight</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-current-weight">
                  {latestProgress?.weight || user.weight || 0} kg
                </p>
                <p className="text-secondary text-sm">On track</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-primary w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Streak</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-streak-days">7 days</p>
                <p className="text-secondary text-sm">Keep it up! 🔥</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <Trophy className="text-accent w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Ring and Quick Actions */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="text-center">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold text-foreground mb-6">Today's Nutrition Progress</h3>
            
            {/* Calorie Progress Ring */}
            <div className="relative inline-block mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 progress-ring" viewBox="0 0 120 120">
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    stroke="hsl(210, 40%, 90%)" 
                    strokeWidth="8" 
                    fill="none"
                  />
                  <circle 
                    cx="60" 
                    cy="60" 
                    r="50" 
                    stroke="hsl(217, 91%, 60%)" 
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray="314"
                    strokeDashoffset={314 - (314 * calorieProgress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground" data-testid="text-progress-percentage">
                      {Math.round(calorieProgress)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Calories</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Macro Progress Bars */}
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">Protein</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {todayMacros.protein}g / {user.proteinTarget || 140}g
                  </span>
                </div>
                <Progress 
                  value={Math.min((todayMacros.protein / (user.proteinTarget || 140)) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Carbs</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {todayMacros.carbs}g / {user.carbTarget || 200}g
                  </span>
                </div>
                <Progress 
                  value={Math.min((todayMacros.carbs / (user.carbTarget || 200)) * 100, 100)} 
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium">Fat</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {todayMacros.fat}g / {user.fatTarget || 65}g
                  </span>
                </div>
                <Progress 
                  value={Math.min((todayMacros.fat / (user.fatTarget || 65)) * 100, 100)} 
                  className="h-2"
                />
              </div>
            </div>

            {calorieProgress > 90 && (
              <Badge variant="destructive" className="mb-2">
                Approaching calorie limit!
              </Badge>
            )}
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  className="flex items-center justify-start space-x-3 p-4 h-auto bg-secondary/10 hover:bg-secondary/20 text-left"
                  variant="ghost"
                  data-testid="button-start-workout"
                >
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                    <Play className="text-secondary-foreground w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground">Start Workout</span>
                </Button>

                <Button 
                  className="flex items-center justify-start space-x-3 p-4 h-auto bg-accent/10 hover:bg-accent/20 text-left"
                  variant="ghost"
                  data-testid="button-log-meal"
                >
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <Utensils className="text-accent-foreground w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground">Log Meal</span>
                </Button>

                <Button 
                  className="flex items-center justify-start space-x-3 p-4 h-auto bg-primary/10 hover:bg-primary/20 text-left"
                  variant="ghost"
                  data-testid="button-set-alarm"
                >
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <AlarmClock className="text-primary-foreground w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground">Set Alarm</span>
                </Button>

                <Button 
                  className="flex items-center justify-start space-x-3 p-4 h-auto bg-muted hover:bg-muted/80 text-left"
                  variant="ghost"
                  data-testid="button-new-plan"
                >
                  <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center">
                    <RotateCcw className="text-background w-5 h-5" />
                  </div>
                  <span className="font-medium text-foreground">New Plan</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
    </div>
  );
}
