import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Bot, Play, RotateCcw, Dumbbell } from "lucide-react";

interface WorkoutPlanProps {
  user: any;
}

export default function WorkoutPlan({ user }: WorkoutPlanProps) {
  const { toast } = useToast();

  const { data: workoutPlan, isLoading } = useQuery<{ plan?: any } | undefined>({
    queryKey: ["/api/workout-plans/user", user.id],
    enabled: !!user.id,
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/workout-plans/generate", {
        userId: user.id,
        age: user.age,
        weight: user.weight,
        height: user.height,
        fitnessLevel: user.fitnessLevel,
        goals: user.goals || [],
        workoutDays: user.workoutDays,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans/user", user.id] });
      toast({
        title: "New Workout Plan Generated! 🎯",
        description: "Your AI has created a fresh workout plan tailored to your goals.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate workout plan",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <section className="mb-12">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!workoutPlan && !generatePlanMutation.isPending) {
    return (
      <section className="mb-12">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Workout Plan Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Let our AI create a personalized workout plan based on your goals and fitness level.
              </p>
              <Button 
                onClick={() => generatePlanMutation.mutate()}
                className="pulse-animation"
                data-testid="button-generate-initial-plan"
              >
                <Bot className="mr-2 w-4 h-4" />
                Generate My AI Workout Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your AI-Generated Workout Plan</h2>
              <p className="text-muted-foreground">Personalized for your goals and fitness level</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                <Bot className="mr-1 w-3 h-3" />
                AI Optimized
              </Badge>
              <Button 
                onClick={() => generatePlanMutation.mutate()}
                disabled={generatePlanMutation.isPending}
                variant="outline"
                data-testid="button-regenerate-plan"
              >
                <RotateCcw className="mr-2 w-4 h-4" />
                {generatePlanMutation.isPending ? "Generating..." : "Generate New Plan"}
              </Button>
            </div>
          </div>

          {workoutPlan && workoutPlan.plan && (
            <>
              {/* Plan Overview */}
              {workoutPlan.plan.overview && (
                <div className="mb-8 p-4 bg-muted/50 rounded-lg">
                  <p className="text-foreground">{workoutPlan.plan.overview}</p>
                </div>
              )}

              {/* Weekly Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workoutPlan.plan.weeklySchedule?.map((day: any, index: number) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground" data-testid={`text-workout-${index}`}>
                          {day.day} - {day.workoutType}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {day.duration} min
                        </Badge>
                      </div>

                      {/* Exercise placeholder image */}
                      <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-4 flex items-center justify-center">
                        <Dumbbell className="w-8 h-8 text-muted-foreground" />
                      </div>

                      <div className="space-y-3 mb-4">
                        {day.exercises?.slice(0, 3).map((exercise: any, exerciseIndex: number) => (
                          <div key={exerciseIndex} className="flex justify-between items-center text-sm">
                            <span className="text-foreground">{exercise.name}</span>
                            <span className="text-muted-foreground">{exercise.sets}x{exercise.reps}</span>
                          </div>
                        ))}
                        {day.exercises?.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{day.exercises.length - 3} more exercises
                          </p>
                        )}
                      </div>

                      <Button 
                        className="w-full" 
                        size="sm"
                        data-testid={`button-start-workout-${index}`}
                      >
                        <Play className="mr-2 w-4 h-4" />
                        Start Workout
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Training Tips */}
              {workoutPlan.plan.tips && workoutPlan.plan.tips.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Training Tips</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {workoutPlan.plan.tips.map((tip: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-accent/10 rounded-lg">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-sm text-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
