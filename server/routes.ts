import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertWorkoutPlanSchema,
  insertCalorieEntrySchema,
  insertWorkoutAlarmSchema,
  insertProgressEntrySchema,
  insertDailyCheckinSchema,
  insertAchievementSchema,
  insertPersonalRecordSchema,
  insertMealPlanSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { generateWorkoutPlan, generateMealPlan, analyzeFoodCalories } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password, ...publicUser } = user;
      res.json(publicUser);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...publicUser } = user;
      res.json(publicUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Workout plan routes
  app.post("/api/workout-plans/generate", async (req, res) => {
    try {
      const { userId, ...params } = req.body;
      
      // Generate AI workout plan
      const aiPlan = await generateWorkoutPlan(params);
      
      // Save to storage
      const workoutPlan = await storage.createWorkoutPlan({
        userId,
        plan: aiPlan
      });
      
      res.json(workoutPlan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/workout-plans/user/:userId", async (req, res) => {
    try {
      const plan = await storage.getWorkoutPlanByUserId(req.params.userId);
      if (!plan) {
        return res.status(404).json({ message: "No workout plan found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Calorie tracking routes
  app.post("/api/calories/analyze", async (req, res) => {
    try {
      const { foodName, quantity, unit } = req.body;
      const analysis = await analyzeFoodCalories(foodName, quantity, unit);
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/calories", async (req, res) => {
    try {
      const entryData = insertCalorieEntrySchema.parse(req.body);
      const entry = await storage.createCalorieEntry(entryData);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/calories/user/:userId", async (req, res) => {
    try {
      const { date } = req.query;
      const entries = await storage.getCalorieEntriesByUserId(
        req.params.userId, 
        date ? new Date(date as string) : undefined
      );
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/calories/today/:userId", async (req, res) => {
    try {
      const totalCalories = await storage.getTodayCaloriesByUserId(req.params.userId);
      res.json({ totalCalories });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Meal plan routes
  app.post("/api/meal-plans/generate", async (req, res) => {
    try {
      const params = req.body;
      const mealPlan = await generateMealPlan(params);
      res.json(mealPlan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Workout alarm routes
  app.post("/api/alarms", async (req, res) => {
    try {
      const alarmData = insertWorkoutAlarmSchema.parse(req.body);
      const alarm = await storage.createWorkoutAlarm(alarmData);
      res.json(alarm);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/alarms/user/:userId", async (req, res) => {
    try {
      const alarms = await storage.getWorkoutAlarmsByUserId(req.params.userId);
      res.json(alarms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/alarms/:id", async (req, res) => {
    try {
      const updates = req.body;
      const alarm = await storage.updateWorkoutAlarm(req.params.id, updates);
      if (!alarm) {
        return res.status(404).json({ message: "Alarm not found" });
      }
      res.json(alarm);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/alarms/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteWorkoutAlarm(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Alarm not found" });
      }
      res.json({ message: "Alarm deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Progress tracking routes
  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertProgressEntrySchema.parse(req.body);
      const entry = await storage.createProgressEntry(progressData);
      res.json(entry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/progress/user/:userId", async (req, res) => {
    try {
      const entries = await storage.getProgressEntriesByUserId(req.params.userId);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/progress/latest/:userId", async (req, res) => {
    try {
      const entry = await storage.getLatestProgressByUserId(req.params.userId);
      if (!entry) {
        return res.status(404).json({ message: "No progress data found" });
      }
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Daily Check-in routes
  app.post("/api/checkins", async (req, res) => {
    try {
      const checkinData = insertDailyCheckinSchema.parse(req.body);
      
      // Calculate readiness score (0-100) based on all factors
      const readinessScore = Math.round(
        ((checkinData.sleepQuality + checkinData.energyLevel + (11 - checkinData.soreness) + 
          checkinData.mood + (11 - checkinData.stress)) / 50) * 100
      );
      
      const checkin = await storage.createDailyCheckin({
        ...checkinData,
        readinessScore
      });
      res.json(checkin);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/checkins/today/:userId", async (req, res) => {
    try {
      const checkin = await storage.getTodayCheckinByUserId(req.params.userId);
      if (!checkin) {
        return res.status(404).json({ message: "No check-in found for today" });
      }
      res.json(checkin);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/checkins/user/:userId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const checkins = await storage.getCheckinsByUserId(req.params.userId, limit);
      res.json(checkins);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enhanced macro tracking routes
  app.get("/api/macros/today/:userId", async (req, res) => {
    try {
      const macros = await storage.getTodayMacrosByUserId(req.params.userId);
      res.json(macros);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Achievement routes
  app.post("/api/achievements", async (req, res) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(achievementData);
      res.json(achievement);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/achievements/user/:userId", async (req, res) => {
    try {
      const achievements = await storage.getAchievementsByUserId(req.params.userId);
      res.json(achievements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Personal Record routes
  app.post("/api/personal-records", async (req, res) => {
    try {
      const recordData = insertPersonalRecordSchema.parse(req.body);
      const record = await storage.createPersonalRecord(recordData);
      res.json(record);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/personal-records/user/:userId", async (req, res) => {
    try {
      const records = await storage.getPersonalRecordsByUserId(req.params.userId);
      res.json(records);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enhanced Meal Plan routes
  app.post("/api/meal-plans", async (req, res) => {
    try {
      const planData = insertMealPlanSchema.parse(req.body);
      const plan = await storage.createMealPlan(planData);
      res.json(plan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/meal-plans/user/:userId", async (req, res) => {
    try {
      const plans = await storage.getMealPlansByUserId(req.params.userId);
      res.json(plans);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/meal-plans/latest/:userId", async (req, res) => {
    try {
      const plan = await storage.getLatestMealPlanByUserId(req.params.userId);
      if (!plan) {
        return res.status(404).json({ message: "No meal plan found" });
      }
      res.json(plan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Enhanced Meal Plan Generation with dietary preferences
  app.post("/api/meal-plans/generate", async (req, res) => {
    try {
      const { userId, dietType, allergies, dislikedFoods, ...params } = req.body;
      
      // Generate AI meal plan with preferences
      const aiPlan = await generateMealPlan({
        ...params,
        dietType,
        allergies,
        dislikedFoods
      });
      
      // Save to storage
      const mealPlan = await storage.createMealPlan({
        userId,
        name: `Meal Plan - ${new Date().toLocaleDateString()}`,
        plan: aiPlan,
        targetCalories: params.calorieTarget,
        targetProtein: params.proteinTarget,
        targetCarbs: params.carbTarget,
        targetFat: params.fatTarget,
        dietType,
        duration: "weekly"
      });
      
      res.json(mealPlan);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Coach Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/chat/user/:userId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const messages = await storage.getChatMessagesByUserId(req.params.userId, limit);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Adaptive Workout Plan Adjustment
  app.post("/api/workout-plans/adjust", async (req, res) => {
    try {
      const { userId, readinessScore, currentPlan } = req.body;
      
      let adjustedPlan = currentPlan;
      
      // Adjust workout intensity based on readiness
      if (readinessScore < 60) {
        // Low readiness - reduce intensity
        adjustedPlan = {
          ...currentPlan,
          weeklySchedule: currentPlan.weeklySchedule?.map((day: any) => ({
            ...day,
            intensity: "Low",
            duration: Math.max(20, day.duration * 0.7),
            exercises: day.exercises?.map((ex: any) => ({
              ...ex,
              sets: Math.max(1, ex.sets - 1),
              reps: Math.max(5, ex.reps - 2)
            }))
          }))
        };
      } else if (readinessScore > 85) {
        // High readiness - can handle more intensity
        adjustedPlan = {
          ...currentPlan,
          weeklySchedule: currentPlan.weeklySchedule?.map((day: any) => ({
            ...day,
            intensity: "High",
            duration: Math.min(90, day.duration * 1.2),
            exercises: day.exercises?.map((ex: any) => ({
              ...ex,
              sets: ex.sets + 1,
              reps: ex.reps + 2
            }))
          }))
        };
      }

      // Update the plan in storage
      const workoutPlan = await storage.getWorkoutPlanByUserId(userId);
      if (workoutPlan) {
        const updated = await storage.updateWorkoutPlan(workoutPlan.id, { plan: adjustedPlan });
        res.json(updated);
      } else {
        res.status(404).json({ message: "No workout plan found" });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
