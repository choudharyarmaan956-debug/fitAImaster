import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Trophy, 
  Target, 
  Flame, 
  Calendar,
  Clock,
  Dumbbell,
  Star,
  Award,
  Zap,
  Crown,
  Medal,
  Sparkles
} from "lucide-react";

interface AchievementsBadgeProps {
  user: any;
  compact?: boolean;
}

const ACHIEVEMENT_DEFINITIONS = [
  {
    id: "first_workout",
    name: "First Steps",
    description: "Complete your first workout",
    icon: "🎯",
    iconComponent: Target,
    category: "milestone",
    requirement: 1,
    type: "workouts_completed"
  },
  {
    id: "week_streak",
    name: "Week Warrior",
    description: "Complete workouts for 7 days straight",
    icon: "🔥",
    iconComponent: Flame,
    category: "streak",
    requirement: 7,
    type: "workout_streak"
  },
  {
    id: "month_streak",
    name: "Monthly Master",
    description: "Complete workouts for 30 days straight",
    icon: "👑",
    iconComponent: Crown,
    category: "streak",
    requirement: 30,
    type: "workout_streak"
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete 5 morning workouts",
    icon: "🌅",
    iconComponent: Clock,
    category: "consistency",
    requirement: 5,
    type: "morning_workouts"
  },
  {
    id: "strength_gains",
    name: "Strength Gains",
    description: "Increase your max weight by 50%",
    icon: "💪",
    iconComponent: Dumbbell,
    category: "progress",
    requirement: 1.5,
    type: "strength_improvement"
  },
  {
    id: "consistency_king",
    name: "Consistency King",
    description: "Complete 50 total workouts",
    icon: "⭐",
    iconComponent: Star,
    category: "milestone",
    requirement: 50,
    type: "workouts_completed"
  },
  {
    id: "perfect_week",
    name: "Perfect Week",
    description: "Hit all nutrition and workout goals for a week",
    icon: "✨",
    iconComponent: Sparkles,
    category: "excellence",
    requirement: 7,
    type: "perfect_days"
  },
  {
    id: "century_club",
    name: "Century Club",
    description: "Complete 100 total workouts",
    icon: "🏆",
    iconComponent: Trophy,
    category: "milestone",
    requirement: 100,
    type: "workouts_completed"
  }
];

export default function AchievementsBadge({ user, compact = false }: AchievementsBadgeProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Get user achievements
  const { data: userAchievements = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/achievements/user", user.id],
    enabled: !!user.id,
  });

  // Get user progress data for calculating achievement progress
  const { data: userStats } = useQuery<any>({
    queryKey: ["/api/progress/latest", user.id],
    enabled: !!user.id,
  });

  const { data: dailyCheckins = [] } = useQuery<any[]>({
    queryKey: ["/api/checkins/user", user.id, 100],
    enabled: !!user.id,
  });

  const awardAchievementMutation = useMutation({
    mutationFn: async (achievementData: any) => {
      const response = await apiRequest("POST", "/api/achievements", achievementData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements/user", user.id] });
      
      toast({
        title: `🎉 Achievement Unlocked!`,
        description: `${data.name}: ${data.description}`,
      });
    },
  });

  // Calculate achievement progress
  const calculateProgress = (achievement: any) => {
    const earned = userAchievements.find(ua => ua.achievementType === achievement.id);
    if (earned) return 100;

    // Mock progress calculation based on achievement type
    switch (achievement.type) {
      case "workouts_completed":
        const completedWorkouts = userStats?.workoutsCompleted || 0;
        return Math.min((completedWorkouts / achievement.requirement) * 100, 100);
      
      case "workout_streak":
        // Calculate current streak from daily check-ins
        const currentStreak = calculateCurrentStreak();
        return Math.min((currentStreak / achievement.requirement) * 100, 100);
      
      case "morning_workouts":
        // Mock morning workouts count
        const morningWorkouts = Math.floor((userStats?.workoutsCompleted || 0) * 0.3);
        return Math.min((morningWorkouts / achievement.requirement) * 100, 100);
      
      case "strength_improvement":
        // Mock strength improvement
        const improvement = 1.2; // 20% improvement
        return Math.min((improvement / achievement.requirement) * 100, 100);
      
      case "perfect_days":
        // Mock perfect days count
        const perfectDays = Math.floor(dailyCheckins.filter(c => c.readinessScore > 80).length * 0.5);
        return Math.min((perfectDays / achievement.requirement) * 100, 100);
      
      default:
        return 0;
    }
  };

  const calculateCurrentStreak = () => {
    if (dailyCheckins.length === 0) return 0;
    
    // Sort by date descending and calculate streak
    const sortedCheckins = dailyCheckins.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedCheckins.length; i++) {
      const checkinDate = new Date(sortedCheckins[i].createdAt);
      const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Check for new achievements
  const checkForNewAchievements = () => {
    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      const alreadyEarned = userAchievements.find(ua => ua.achievementType === achievement.id);
      if (!alreadyEarned && calculateProgress(achievement) >= 100) {
        // Award achievement
        awardAchievementMutation.mutate({
          userId: user.id,
          achievementType: achievement.id,
          name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          icon: achievement.icon
        });
      }
    });
  };

  // Check for achievements on component mount
  useEffect(() => {
    if (userStats && dailyCheckins.length > 0) {
      checkForNewAchievements();
    }
  }, [userStats, dailyCheckins]);

  const earnedAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => 
    userAchievements.find(ua => ua.achievementType === a.id)
  );

  const unlockedCount = earnedAchievements.length;
  const totalCount = ACHIEVEMENT_DEFINITIONS.length;

  if (compact) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" data-testid="achievements-compact">
            <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
            <span>{unlockedCount}/{totalCount}</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>Achievements & Badges</span>
            </DialogTitle>
            <DialogDescription>
              Track your progress and unlock achievements as you reach fitness milestones.
            </DialogDescription>
          </DialogHeader>
          {renderAchievementContent()}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Achievements</span>
          </div>
          <Badge variant="secondary">
            {unlockedCount}/{totalCount}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderAchievementContent()}
      </CardContent>
    </Card>
  );

  function renderAchievementContent() {
    return (
      <div className="space-y-6">
        {/* Achievement Overview */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{unlockedCount}</div>
            <div className="text-sm text-muted-foreground">Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalCount - unlockedCount}</div>
            <div className="text-sm text-muted-foreground">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
        </div>

        {/* Current Streak */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Flame className="w-6 h-6 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-foreground">Current Streak</h3>
                  <p className="text-sm text-muted-foreground">Daily check-ins</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {calculateCurrentStreak()}
                </div>
                <div className="text-sm text-muted-foreground">days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Categories */}
        {["milestone", "streak", "consistency", "progress", "excellence"].map(category => {
          const categoryAchievements = ACHIEVEMENT_DEFINITIONS.filter(a => a.category === category);
          
          return (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground capitalize flex items-center space-x-2">
                <Medal className="w-5 h-5 text-primary" />
                <span>{category} Achievements</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-3">
                {categoryAchievements.map(achievement => {
                  const progress = calculateProgress(achievement);
                  const isEarned = progress >= 100;
                  const IconComponent = achievement.iconComponent;
                  
                  return (
                    <Card 
                      key={achievement.id} 
                      className={`border-2 transition-all ${
                        isEarned 
                          ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20' 
                          : 'border-muted'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            isEarned 
                              ? 'bg-yellow-400 text-yellow-900' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-semibold text-sm ${
                                isEarned ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {achievement.name}
                              </h4>
                              {isEarned && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Earned
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className={isEarned ? 'text-yellow-600 font-semibold' : 'text-foreground'}>
                                  {Math.round(progress)}%
                                </span>
                              </div>
                              <Progress 
                                value={progress} 
                                className={`h-1 ${isEarned ? 'bg-yellow-100' : ''}`}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}