import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  Utensils, 
  ChefHat, 
  Apple, 
  Coffee,
  Clock,
  Target,
  Sparkles,
  Calendar,
  Heart,
  Zap
} from "lucide-react";

interface MealPlannerProps {
  user: any;
}

export default function MealPlanner({ user }: MealPlannerProps) {
  const [open, setOpen] = useState(false);
  const [dietType, setDietType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [dislikedFoods, setDislikedFoods] = useState("");
  const [calorieTarget, setCalorieTarget] = useState(user.calorieTarget || 2000);
  const [proteinTarget, setProteinTarget] = useState(user.proteinTarget || 140);
  const [carbTarget, setCarbTarget] = useState(user.carbTarget || 200);
  const [fatTarget, setFatTarget] = useState(user.fatTarget || 65);
  const { toast } = useToast();

  // Get user's meal plans
  const { data: mealPlans = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/meal-plans/user", user.id],
    enabled: !!user.id,
  });

  // Get latest meal plan
  const { data: latestMealPlan } = useQuery<any>({
    queryKey: ["/api/meal-plans/latest", user.id],
    enabled: !!user.id,
  });

  const generateMealPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      const response = await apiRequest("POST", "/api/meal-plans/generate", planData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans/user", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans/latest", user.id] });
      
      toast({
        title: "Meal Plan Generated! 🍽️",
        description: "Your personalized meal plan is ready with smart nutrition recommendations.",
      });
      
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate meal plan",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePlan = () => {
    generateMealPlanMutation.mutate({
      userId: user.id,
      dietType: dietType || "balanced",
      allergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
      dislikedFoods: dislikedFoods.split(',').map(f => f.trim()).filter(Boolean),
      calorieTarget,
      proteinTarget,
      carbTarget,
      fatTarget,
      fitnessGoal: user.fitnessGoal || "general_fitness",
      activityLevel: user.activityLevel || "moderate"
    });
  };

  const formatMealPlan = (plan: any) => {
    try {
      if (typeof plan === 'string') {
        return JSON.parse(plan);
      }
      return plan;
    } catch {
      return plan;
    }
  };

  const renderMealPlanCard = (mealPlan: any) => {
    const plan = formatMealPlan(mealPlan.plan);
    
    return (
      <Card key={mealPlan.id} className="mb-4 border-l-4 border-l-green-500">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5 text-green-500" />
                <span>{mealPlan.name}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Created: {new Date(mealPlan.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              {mealPlan.dietType && (
                <Badge variant="secondary">{mealPlan.dietType}</Badge>
              )}
              <Badge variant="outline">
                {mealPlan.targetCalories} cal
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {plan && (
            <div className="space-y-4">
              {plan.weeklySchedule ? (
                // Structured meal plan
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(plan.weeklySchedule).slice(0, 4).map(([day, meals]: [string, any]) => (
                    <div key={day} className="border rounded-lg p-3">
                      <h4 className="font-semibold text-sm mb-2 text-primary capitalize">{day}</h4>
                      <div className="space-y-2 text-sm">
                        {meals.breakfast && (
                          <div className="flex items-center space-x-2">
                            <Coffee className="w-3 h-3 text-orange-500" />
                            <span className="text-muted-foreground">Breakfast:</span>
                            <span>{meals.breakfast}</span>
                          </div>
                        )}
                        {meals.lunch && (
                          <div className="flex items-center space-x-2">
                            <Utensils className="w-3 h-3 text-blue-500" />
                            <span className="text-muted-foreground">Lunch:</span>
                            <span>{meals.lunch}</span>
                          </div>
                        )}
                        {meals.dinner && (
                          <div className="flex items-center space-x-2">
                            <Apple className="w-3 h-3 text-green-500" />
                            <span className="text-muted-foreground">Dinner:</span>
                            <span>{meals.dinner}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Text-based meal plan
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {typeof plan === 'string' ? plan : JSON.stringify(plan, null, 2)}
                  </p>
                </div>
              )}

              {/* Nutrition Targets */}
              <div className="grid grid-cols-4 gap-4 mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{mealPlan.targetCalories}</div>
                  <div className="text-xs text-muted-foreground">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{mealPlan.targetProtein}g</div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{mealPlan.targetCarbs}g</div>
                  <div className="text-xs text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600">{mealPlan.targetFat}g</div>
                  <div className="text-xs text-muted-foreground">Fat</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-2">
            <ChefHat className="w-6 h-6 text-green-500" />
            <span>Smart Meal Planning</span>
          </h2>
          <p className="text-muted-foreground">AI-powered meal plans tailored to your preferences and goals</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2" data-testid="generate-meal-plan">
              <Sparkles className="w-4 h-4" />
              <span>Generate New Plan</span>
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5 text-green-500" />
                <span>Create Smart Meal Plan</span>
              </DialogTitle>
              <DialogDescription>
                Generate a personalized meal plan based on your dietary preferences, allergies, and nutrition goals.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Diet Type */}
              <div className="space-y-2">
                <Label>Diet Type</Label>
                <Select value={dietType} onValueChange={setDietType}>
                  <SelectTrigger data-testid="diet-type-select">
                    <SelectValue placeholder="Select your diet preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Ketogenic</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="low_carb">Low Carb</SelectItem>
                    <SelectItem value="high_protein">High Protein</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nutrition Targets */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily Calorie Target</Label>
                  <Input 
                    type="number" 
                    value={calorieTarget}
                    onChange={(e) => setCalorieTarget(parseInt(e.target.value))}
                    data-testid="calorie-target-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Protein Target (g)</Label>
                  <Input 
                    type="number" 
                    value={proteinTarget}
                    onChange={(e) => setProteinTarget(parseInt(e.target.value))}
                    data-testid="protein-target-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carbs Target (g)</Label>
                  <Input 
                    type="number" 
                    value={carbTarget}
                    onChange={(e) => setCarbTarget(parseInt(e.target.value))}
                    data-testid="carbs-target-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fat Target (g)</Label>
                  <Input 
                    type="number" 
                    value={fatTarget}
                    onChange={(e) => setFatTarget(parseInt(e.target.value))}
                    data-testid="fat-target-input"
                  />
                </div>
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <Label>Allergies & Intolerances</Label>
                <Textarea
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g., nuts, dairy, gluten, shellfish (comma-separated)"
                  data-testid="allergies-input"
                />
              </div>

              {/* Disliked Foods */}
              <div className="space-y-2">
                <Label>Disliked Foods</Label>
                <Textarea
                  value={dislikedFoods}
                  onChange={(e) => setDislikedFoods(e.target.value)}
                  placeholder="e.g., spinach, mushrooms, fish (comma-separated)"
                  data-testid="dislikes-input"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePlan}
                disabled={generateMealPlanMutation.isPending}
                className="w-full"
                data-testid="generate-plan-button"
              >
                {generateMealPlanMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating Plan...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Smart Meal Plan</span>
                  </div>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Latest Meal Plan Preview */}
      {latestMealPlan && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span>Current Active Plan</span>
          </h3>
          {renderMealPlanCard(latestMealPlan)}
        </div>
      )}

      {/* All Meal Plans */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span>Meal Plan History</span>
        </h3>
        
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading meal plans...</div>
        ) : mealPlans.length === 0 ? (
          <Card className="text-center py-8 border-2 border-dashed">
            <CardContent>
              <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-foreground mb-2">No Meal Plans Yet</h4>
              <p className="text-muted-foreground mb-4">
                Generate your first AI-powered meal plan to get personalized nutrition recommendations.
              </p>
              <Button onClick={() => setOpen(true)}>
                Create Your First Meal Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div>
            {mealPlans.map(renderMealPlanCard)}
          </div>
        )}
      </div>
    </div>
  );
}