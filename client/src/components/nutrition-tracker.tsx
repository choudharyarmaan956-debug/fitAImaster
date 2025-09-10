import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertCalorieEntrySchema, type InsertCalorieEntry } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Bot, AlertTriangle, Dna, Sparkles } from "lucide-react";
import { z } from "zod";

const foodEntrySchema = z.object({
  foodName: z.string().min(1, "Food name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
});

interface NutritionTrackerProps {
  user: any;
}

export default function NutritionTracker({ user }: NutritionTrackerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mealPlan, setMealPlan] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof foodEntrySchema>>({
    resolver: zodResolver(foodEntrySchema),
    defaultValues: {
      foodName: "",
      quantity: 1,
      unit: "serving",
    },
  });

  const { data: todayCalories = { totalCalories: 0 } } = useQuery({
    queryKey: ["/api/calories/today", user.id],
    enabled: !!user.id,
  });

  const { data: todayEntries = [] } = useQuery({
    queryKey: ["/api/calories/user", user.id, new Date().toISOString().split('T')[0]],
    enabled: !!user.id,
  });

  const caloriesConsumed = todayCalories.totalCalories;
  const calorieTarget = user.calorieTarget || 2000;
  const caloriesRemaining = calorieTarget - caloriesConsumed;
  const calorieProgress = Math.min((caloriesConsumed / calorieTarget) * 100, 100);
  const proteinTarget = Math.round((user.weight || 70) * 1.6); // 1.6g per kg for muscle gain

  const addCalorieMutation = useMutation({
    mutationFn: async (data: InsertCalorieEntry) => {
      const response = await apiRequest("POST", "/api/calories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calories/today", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/calories/user", user.id] });
      form.reset();
      toast({
        title: "Food Logged! 🍎",
        description: "Your meal has been added to today's intake.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to log food",
        variant: "destructive",
      });
    },
  });

  const generateMealPlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/meal-plans/generate", {
        calorieTarget: user.calorieTarget || 2000,
        proteinTarget,
        goals: user.goals || [],
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMealPlan(data);
      toast({
        title: "Meal Plan Generated! 🥗",
        description: "Your AI nutritionist has created a personalized meal plan.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate meal plan",
        variant: "destructive",
      });
    },
  });

  const handleFoodSubmit = async (data: z.infer<typeof foodEntrySchema>) => {
    setIsAnalyzing(true);
    try {
      // First analyze the food with AI
      const analysisResponse = await apiRequest("POST", "/api/calories/analyze", data);
      const analysis = await analysisResponse.json();

      // Then add to calorie tracker
      await addCalorieMutation.mutateAsync({
        userId: user.id,
        foodName: data.foodName,
        calories: analysis.calories || 0,
        protein: analysis.protein || 0,
        quantity: data.quantity,
        unit: data.unit,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze food",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <section className="mb-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Calorie Tracker */}
        <Card>
          <CardContent className="p-8">
            <h3 className="text-xl font-semibold text-foreground mb-6">Calorie Tracker</h3>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-foreground font-medium">Daily Goal</span>
                <span className="text-foreground font-semibold" data-testid="text-calorie-goal">
                  {calorieTarget} kcal
                </span>
              </div>
              <Progress value={calorieProgress} className="h-3 mb-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span data-testid="text-calories-consumed">{caloriesConsumed} consumed</span>
                <span data-testid="text-calories-remaining">
                  {caloriesRemaining > 0 ? `${caloriesRemaining} remaining` : `${Math.abs(caloriesRemaining)} over`}
                </span>
              </div>
            </div>

            {/* Warning Alert */}
            {calorieProgress > 90 && (
              <Alert className="mb-6 border-destructive/20 bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  <span className="font-medium">Approaching daily limit!</span>
                  <br />
                  You have {Math.max(caloriesRemaining, 0)} calories remaining for today.
                </AlertDescription>
              </Alert>
            )}

            {/* Meal Log Form */}
            <form onSubmit={form.handleSubmit(handleFoodSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="foodName">Add Meal</Label>
                <Input
                  id="foodName"
                  {...form.register("foodName")}
                  placeholder="Search for food..."
                  data-testid="input-food-name"
                />
                {form.formState.errors.foodName && (
                  <p className="text-destructive text-sm">{form.formState.errors.foodName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    {...form.register("quantity", { valueAsNumber: true })}
                    placeholder="1"
                    data-testid="input-quantity"
                  />
                  {form.formState.errors.quantity && (
                    <p className="text-destructive text-sm">{form.formState.errors.quantity.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select onValueChange={(value) => form.setValue("unit", value)}>
                    <SelectTrigger data-testid="select-unit">
                      <SelectValue placeholder="serving" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serving">serving</SelectItem>
                      <SelectItem value="cup">cup</SelectItem>
                      <SelectItem value="gram">gram</SelectItem>
                      <SelectItem value="piece">piece</SelectItem>
                      <SelectItem value="slice">slice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={addCalorieMutation.isPending || isAnalyzing}
                data-testid="button-log-food"
              >
                <Plus className="mr-2 w-4 h-4" />
                {isAnalyzing ? "Analyzing..." : addCalorieMutation.isPending ? "Logging..." : "Log Food"}
              </Button>
            </form>

            {/* Today's Entries */}
            {todayEntries.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-foreground mb-3">Today's Meals</h4>
                <div className="space-y-2">
                  {todayEntries.slice(0, 5).map((entry: any, index: number) => (
                    <div key={entry.id} className="flex justify-between items-center text-sm py-2 border-b border-border">
                      <span className="text-foreground">{entry.foodName}</span>
                      <span className="text-muted-foreground">{entry.calories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Nutrition Suggestions */}
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">AI Meal Suggestions</h3>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Bot className="mr-1 w-3 h-3" />
                AI Powered
              </Badge>
            </div>

            {/* Protein Requirement */}
            <div className="bg-secondary/10 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Dna className="text-secondary w-4 h-4" />
                <span className="font-medium text-foreground">Daily Protein Target</span>
              </div>
              <div className="text-2xl font-bold text-secondary" data-testid="text-protein-target">
                {proteinTarget}g
              </div>
              <div className="text-sm text-muted-foreground">
                Based on your {user.goals?.includes("Muscle Gain") ? "muscle gain" : "fitness"} goals
              </div>
            </div>

            {/* Default Protein Sources */}
            {!mealPlan && (
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Recommended Protein Sources:</h4>
                
                <div className="space-y-3">
                  {[
                    { name: "Grilled Chicken Breast", protein: "31g", calories: "165", image: "🍗" },
                    { name: "Baked Salmon", protein: "25g", calories: "206", image: "🐟" },
                    { name: "Greek Yogurt with Berries", protein: "20g", calories: "150", image: "🥛" },
                  ].map((food, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center text-xl">
                          {food.image}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{food.name}</div>
                          <div className="text-sm text-muted-foreground">{food.protein} protein, {food.calories} calories</div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => form.setValue("foodName", food.name)}
                        data-testid={`button-add-${index}`}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generated Meal Plan */}
            {mealPlan && (
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">Your Personalized Meal Plan</h4>
                
                {mealPlan.proteinSources && (
                  <div className="space-y-3">
                    {mealPlan.proteinSources.slice(0, 3).map((food: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium text-foreground">{food.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {food.protein}g protein, {food.calories} calories
                          </div>
                          {food.benefits && (
                            <div className="text-xs text-accent mt-1">{food.benefits}</div>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => form.setValue("foodName", food.name)}
                          data-testid={`button-add-generated-${index}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {mealPlan.tips && (
                  <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                    <h5 className="font-medium text-foreground mb-2">💡 Nutrition Tips</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {mealPlan.tips.slice(0, 2).map((tip: string, index: number) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <Button 
              onClick={() => generateMealPlanMutation.mutate()}
              disabled={generateMealPlanMutation.isPending}
              className="w-full mt-6"
              variant={mealPlan ? "outline" : "default"}
              data-testid="button-generate-meal-plan"
            >
              <Sparkles className="mr-2 w-4 h-4" />
              {generateMealPlanMutation.isPending 
                ? "Generating..." 
                : mealPlan 
                  ? "Generate New Meal Plan" 
                  : "Generate Full Meal Plan"
              }
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
