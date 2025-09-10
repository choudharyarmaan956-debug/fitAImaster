import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Medal, TrendingUp } from "lucide-react";

interface ProgressTrackerProps {
  user: any;
}

export default function ProgressTracker({ user }: ProgressTrackerProps) {
  const { data: progressEntries = [] } = useQuery({
    queryKey: ["/api/progress/user", user.id],
    enabled: !!user.id,
  });

  const { data: latestProgress } = useQuery({
    queryKey: ["/api/progress/latest", user.id],
    enabled: !!user.id,
  });

  // Mock achievements based on user data and progress
  const achievements = [
    {
      title: "7-Day Streak!",
      description: "Completed all workouts",
      icon: Trophy,
      color: "accent",
      earned: true,
    },
    {
      title: "Calorie Goal Met",
      description: "5 days in a row",
      icon: Flame,
      color: "secondary",
      earned: true,
    },
    {
      title: "First Milestone",
      description: "Personal best achieved",
      icon: Medal,
      color: "primary",
      earned: true,
    },
    {
      title: "Consistency King",
      description: "30-day streak",
      icon: TrendingUp,
      color: "muted",
      earned: false,
    },
  ];

  // Calculate some basic stats
  const currentWeight = latestProgress?.weight || user.weight || 0;
  const initialWeight = user.weight || 0;
  const weightChange = currentWeight - initialWeight;
  const totalWorkouts = progressEntries.reduce((sum: number, entry: any) => sum + (entry.workoutsCompleted || 0), 0);

  return (
    <section className="mb-12">
      <Card>
        <CardContent className="p-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">Progress Tracking</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Progress Summary */}
            <div className="md:col-span-2 space-y-6">
              <h4 className="font-semibold text-foreground">Progress Overview</h4>
              
              {/* Weight Progress */}
              <div className="bg-muted/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-medium text-foreground">Weight Progress</h5>
                  <Badge variant={weightChange <= 0 ? "secondary" : "outline"}>
                    {weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Starting Weight</span>
                    <span className="font-medium" data-testid="text-starting-weight">{initialWeight} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Current Weight</span>
                    <span className="font-medium" data-testid="text-current-weight">{currentWeight} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Goal</span>
                    <span className="font-medium text-primary">
                      {user.goals?.includes("Weight Loss") ? `${initialWeight - 5} kg` : 
                       user.goals?.includes("Muscle Gain") ? `${initialWeight + 3} kg` : 
                       "Maintain"}
                    </span>
                  </div>
                </div>

                {/* Visual placeholder for chart */}
                <div className="mt-6 h-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Weight tracking chart</p>
                    <p className="text-xs">Visual progress over time</p>
                  </div>
                </div>
              </div>

              {/* Workout Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-secondary" data-testid="text-total-workouts">
                    {totalWorkouts}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Workouts</div>
                </div>
                
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary" data-testid="text-workout-streak">
                    7
                  </div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
              </div>

              {/* Weekly Progress */}
              <div>
                <h5 className="font-medium text-foreground mb-3">This Week's Progress</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Workouts Completed</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={80} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground">4/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Calorie Goals Met</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={60} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground">3/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">Sleep Quality</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={90} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground">Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Achievements */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Achievements</h4>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      achievement.earned 
                        ? `bg-${achievement.color}/10 border border-${achievement.color}/20` 
                        : "bg-muted/30 opacity-60"
                    }`}
                    data-testid={`achievement-${index}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.earned 
                        ? `bg-${achievement.color}` 
                        : "bg-muted"
                    }`}>
                      <achievement.icon className={`w-4 h-4 ${
                        achievement.earned 
                          ? achievement.color === "muted" ? "text-foreground" : "text-white"
                          : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground text-sm">
                        {achievement.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {achievement.description}
                      </div>
                    </div>
                    {achievement.earned && (
                      <Badge variant="secondary" className="text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress towards next goal */}
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
                <h5 className="font-medium text-foreground mb-2">Next Milestone</h5>
                <div className="text-sm text-muted-foreground mb-2">30-Day Consistency Streak</div>
                <Progress value={23.33} className="mb-2" />
                <div className="text-xs text-muted-foreground">7 of 30 days completed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
