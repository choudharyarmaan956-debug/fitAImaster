import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface WorkoutPlanParams {
  age: number;
  weight: number;
  height: number;
  fitnessLevel: string;
  goals: string[];
  workoutDays: number;
  equipment?: string[];
}

export interface MealPlanParams {
  calorieTarget: number;
  proteinTarget: number;
  goals: string[];
  dietaryRestrictions?: string[];
}

export async function generateWorkoutPlan(params: WorkoutPlanParams): Promise<any> {
  try {
    const prompt = `Create a personalized workout plan for a ${params.age}-year-old person who weighs ${params.weight}kg, is ${params.height}cm tall, has a ${params.fitnessLevel} fitness level, and wants to work out ${params.workoutDays} days per week. Their goals are: ${params.goals.join(', ')}.

Please provide a structured workout plan in JSON format with the following structure:
{
  "overview": "Brief description of the plan",
  "weeklySchedule": [
    {
      "day": "Monday",
      "workoutType": "Upper Body",
      "duration": 45,
      "exercises": [
        {
          "name": "Exercise name",
          "sets": 3,
          "reps": "12 or time description",
          "instructions": "Brief instructions"
        }
      ]
    }
  ],
  "tips": ["Training tips array"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a certified personal trainer and fitness expert. Create personalized workout plans based on user goals and fitness levels. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw new Error("Failed to generate workout plan. Please try again.");
  }
}

export async function generateMealPlan(params: MealPlanParams): Promise<any> {
  try {
    const prompt = `Create a personalized meal plan for someone with a daily calorie target of ${params.calorieTarget} calories and protein target of ${params.proteinTarget}g. Their fitness goals are: ${params.goals.join(', ')}.

Please provide a structured meal plan in JSON format with the following structure:
{
  "dailyNutritionTargets": {
    "calories": ${params.calorieTarget},
    "protein": ${params.proteinTarget},
    "carbs": "calculated amount",
    "fat": "calculated amount"
  },
  "proteinSources": [
    {
      "name": "Food name",
      "serving": "serving size",
      "calories": "calories per serving",
      "protein": "protein grams per serving",
      "benefits": "why this food is good for their goals"
    }
  ],
  "sampleMeals": [
    {
      "mealType": "Breakfast/Lunch/Dinner/Snack",
      "name": "Meal name",
      "ingredients": ["ingredient list"],
      "calories": "total calories",
      "protein": "total protein"
    }
  ],
  "tips": ["Nutrition tips array"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a certified nutritionist and dietary expert. Create personalized meal plans based on user goals and nutritional needs. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error("Failed to generate meal plan. Please try again.");
  }
}

export async function analyzeFoodCalories(foodName: string, quantity: number = 1, unit: string = "serving"): Promise<any> {
  try {
    const prompt = `Analyze the nutritional content of ${quantity} ${unit} of "${foodName}". 

Please provide the nutritional information in JSON format:
{
  "food": "${foodName}",
  "quantity": ${quantity},
  "unit": "${unit}",
  "calories": "total calories",
  "protein": "protein in grams",
  "carbs": "carbohydrates in grams",
  "fat": "fat in grams",
  "confidence": "high/medium/low based on how well-known this food is"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a nutritional database expert. Provide accurate calorie and macronutrient information for foods. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error analyzing food calories:", error);
    throw new Error("Failed to analyze food calories. Please try again.");
  }
}
