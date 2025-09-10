import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertWorkoutPlanSchema,
  insertCalorieEntrySchema,
  insertWorkoutAlarmSchema,
  insertProgressEntrySchema
} from "@shared/schema";
import { generateWorkoutPlan, generateMealPlan, analyzeFoodCalories } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
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
      res.json(user);
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

  const httpServer = createServer(app);
  return httpServer;
}
