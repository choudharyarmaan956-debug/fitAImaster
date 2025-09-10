import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Bot } from "lucide-react";
import { z } from "zod";

const onboardingSchema = insertUserSchema.extend({
  goals: z.array(z.string()).min(1, "Please select at least one goal"),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
  onUserCreated: (user: any) => void;
}

export default function OnboardingForm({ onUserCreated }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      password: "",
      age: undefined,
      weight: undefined,
      height: undefined,
      fitnessLevel: "",
      goals: [],
      workoutDays: undefined,
      calorieTarget: undefined,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      const response = await apiRequest("POST", "/api/users", data);
      return response.json();
    },
    onSuccess: (user) => {
      toast({
        title: "Profile Created! 🎉",
        description: "Your AI fitness journey begins now!",
      });
      onUserCreated(user);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OnboardingData) => {
    createUserMutation.mutate(data);
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const goals = [
    "Weight Loss",
    "Muscle Gain", 
    "Endurance",
    "Flexibility",
    "General Fitness",
    "Strength Training"
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Welcome to Your AI Fitness Journey! 🚀
            </h2>
            <p className="text-muted-foreground text-lg">
              Let's create your personalized workout plan in just a few steps
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {step}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    currentStep >= step ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {step === 1 ? "Profile" : step === 2 ? "Goals" : "Settings"}
                  </span>
                  {step < 3 && <div className="w-8 h-1 bg-muted ml-4"></div>}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Basic Profile */}
            {currentStep === 1 && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      {...form.register("username")}
                      placeholder="Enter your username"
                      data-testid="input-username"
                    />
                    {form.formState.errors.username && (
                      <p className="text-destructive text-sm">{form.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      {...form.register("password")}
                      placeholder="Enter your password"
                      data-testid="input-password"
                    />
                    {form.formState.errors.password && (
                      <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      {...form.register("age", { valueAsNumber: true })}
                      placeholder="Enter your age"
                      data-testid="input-age"
                    />
                    {form.formState.errors.age && (
                      <p className="text-destructive text-sm">{form.formState.errors.age.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      {...form.register("weight", { valueAsNumber: true })}
                      placeholder="Enter your weight"
                      data-testid="input-weight"
                    />
                    {form.formState.errors.weight && (
                      <p className="text-destructive text-sm">{form.formState.errors.weight.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      {...form.register("height", { valueAsNumber: true })}
                      placeholder="Enter your height"
                      data-testid="input-height"
                    />
                    {form.formState.errors.height && (
                      <p className="text-destructive text-sm">{form.formState.errors.height.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="fitnessLevel">Fitness Level</Label>
                    <Select onValueChange={(value) => form.setValue("fitnessLevel", value)}>
                      <SelectTrigger data-testid="select-fitness-level">
                        <SelectValue placeholder="Select your fitness level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.fitnessLevel && (
                      <p className="text-destructive text-sm">{form.formState.errors.fitnessLevel.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Goals */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Primary Goals</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                    {goals.map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal}
                          checked={form.watch("goals")?.includes(goal)}
                          onCheckedChange={(checked) => {
                            const currentGoals = form.getValues("goals") || [];
                            if (checked) {
                              form.setValue("goals", [...currentGoals, goal]);
                            } else {
                              form.setValue("goals", currentGoals.filter(g => g !== goal));
                            }
                          }}
                          data-testid={`checkbox-goal-${goal.toLowerCase().replace(" ", "-")}`}
                        />
                        <Label htmlFor={goal} className="text-sm">{goal}</Label>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.goals && (
                    <p className="text-destructive text-sm">{form.formState.errors.goals.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="workoutDays">Workout Days per Week</Label>
                    <Select onValueChange={(value) => form.setValue("workoutDays", parseInt(value))}>
                      <SelectTrigger data-testid="select-workout-days">
                        <SelectValue placeholder="Select workout days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="4">4 days</SelectItem>
                        <SelectItem value="5">5 days</SelectItem>
                        <SelectItem value="6">6 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.workoutDays && (
                      <p className="text-destructive text-sm">{form.formState.errors.workoutDays.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="calorieTarget">Daily Calorie Target</Label>
                    <Input
                      id="calorieTarget"
                      type="number"
                      {...form.register("calorieTarget", { valueAsNumber: true })}
                      placeholder="2000"
                      data-testid="input-calorie-target"
                    />
                    {form.formState.errors.calorieTarget && (
                      <p className="text-destructive text-sm">{form.formState.errors.calorieTarget.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-4">Ready to Start Your Journey?</h3>
                  <p className="text-muted-foreground">
                    Review your information and click the button below to generate your personalized AI workout plan!
                  </p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p><span className="font-medium">Age:</span> {form.watch("age")} years</p>
                  <p><span className="font-medium">Weight:</span> {form.watch("weight")} kg</p>
                  <p><span className="font-medium">Height:</span> {form.watch("height")} cm</p>
                  <p><span className="font-medium">Fitness Level:</span> {form.watch("fitnessLevel")}</p>
                  <p><span className="font-medium">Goals:</span> {form.watch("goals")?.join(", ")}</p>
                  <p><span className="font-medium">Workout Days:</span> {form.watch("workoutDays")} per week</p>
                  <p><span className="font-medium">Calorie Target:</span> {form.watch("calorieTarget")} calories/day</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  data-testid="button-previous"
                >
                  Previous
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  className="ml-auto"
                  data-testid="button-next"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="ml-auto pulse-animation" 
                  disabled={createUserMutation.isPending}
                  data-testid="button-generate-plan"
                >
                  <Bot className="mr-2 w-4 h-4" />
                  {createUserMutation.isPending ? "Creating..." : "Generate My AI Workout Plan"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
