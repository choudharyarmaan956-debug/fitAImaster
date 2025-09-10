import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Dumbbell, TrendingUp, Trophy, Play, Utensils, AlarmClock, RotateCcw } from "lucide-react";

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const { data: todayCalories = { totalCalories: 0 } } = useQuery({
    queryKey: ["/api/calories/today", user.id],
    enabled: !!user.id,
  });

  const { data: latestProgress } = useQuery({
    queryKey: ["/api/progress/latest", user.id],
    enabled: !!user.id,
  });

  const caloriesConsumed = todayCalories.totalCalories;
  const caloriesRemaining = (user.calorieTarget || 2000) - caloriesConsumed;
  const calorieProgress = Math.min((caloriesConsumed / (user.calorieTarget || 2000)) * 100, 100);

  return (
    <section className="mb-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Today's Calories</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-calories-consumed">
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
                <p className="text-2xl font-bold text-foreground" data-testid="text-workouts-completed">
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
            <h3 className="text-lg font-semibold text-foreground mb-6">Today's Goal Progress</h3>
            <div className="relative inline-block mb-4">
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
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
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
  );
}
