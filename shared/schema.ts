import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  age: integer("age"),
  weight: integer("weight"),
  height: integer("height"),
  fitnessLevel: text("fitness_level"),
  goals: jsonb("goals").$type<string[]>(),
  workoutDays: integer("workout_days"),
  calorieTarget: integer("calorie_target"),
  // New nutrition preferences
  dietType: text("diet_type"), // vegan, keto, mediterranean, etc
  allergies: jsonb("allergies").$type<string[]>(),
  dislikedFoods: jsonb("disliked_foods").$type<string[]>(),
  proteinTarget: integer("protein_target"),
  carbTarget: integer("carb_target"),
  fatTarget: integer("fat_target"),
  // App preferences
  darkMode: boolean("dark_mode").default(false),
  pushNotifications: boolean("push_notifications").default(true),
  // Streaks and stats
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalWorkouts: integer("total_workouts").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workoutPlans = pgTable("workout_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  plan: jsonb("plan").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calorieEntries = pgTable("calorie_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  foodName: text("food_name").notNull(),
  calories: integer("calories").notNull(),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fat: integer("fat"),
  fiber: integer("fiber"),
  sugar: integer("sugar"),
  quantity: integer("quantity").default(1),
  unit: text("unit").default("serving"),
  mealType: text("meal_type"), // breakfast, lunch, dinner, snack
  entryDate: timestamp("entry_date").defaultNow(),
});

export const workoutAlarms = pgTable("workout_alarms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  time: text("time").notNull(),
  days: jsonb("days").$type<string[]>(),
  message: text("message"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const progressEntries = pgTable("progress_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  weight: integer("weight"),
  workoutsCompleted: integer("workouts_completed").default(0),
  caloriesConsumed: integer("calories_consumed").default(0),
  entryDate: timestamp("entry_date").defaultNow(),
});

// Daily Check-ins for Adaptive Coaching
export const dailyCheckins = pgTable("daily_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sleepQuality: integer("sleep_quality").notNull(), // 1-10 scale
  energyLevel: integer("energy_level").notNull(), // 1-10 scale  
  soreness: integer("soreness").notNull(), // 1-10 scale
  mood: integer("mood").notNull(), // 1-10 scale
  stress: integer("stress").notNull(), // 1-10 scale
  readinessScore: integer("readiness_score"), // Calculated 0-100
  notes: text("notes"),
  checkinDate: timestamp("checkin_date").defaultNow(),
});

// Achievements and Badges System
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // streak, workout, weight, pr, nutrition
  name: text("name").notNull(), // "First Workout", "7 Day Streak", etc
  description: text("description").notNull(),
  icon: text("icon").notNull(), // emoji or icon name
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Personal Records Tracking
export const personalRecords = pgTable("personal_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exercise: text("exercise").notNull(), // exercise name
  type: text("type").notNull(), // weight, reps, time, distance
  value: decimal("value").notNull(), // the PR value
  unit: text("unit").notNull(), // kg, lbs, seconds, minutes, km, etc
  previousValue: decimal("previous_value"), // for comparison
  improvementPercentage: decimal("improvement_percentage"),
  achievedAt: timestamp("achieved_at").defaultNow(),
});

// Smart Meal Plans
export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  plan: jsonb("plan").$type<any>(), // AI generated meal plan
  targetCalories: integer("target_calories"),
  targetProtein: integer("target_protein"),
  targetCarbs: integer("target_carbs"),
  targetFat: integer("target_fat"),
  dietType: text("diet_type"), // matches user preference
  duration: text("duration"), // daily, weekly, monthly
  groceryList: jsonb("grocery_list").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages for AI Coach
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  context: jsonb("context").$type<any>(), // user context for AI responses
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  age: true,
  weight: true,
  height: true,
  fitnessLevel: true,
  goals: true,
  workoutDays: true,
  calorieTarget: true,
  dietType: true,
  allergies: true,
  dislikedFoods: true,
  proteinTarget: true,
  carbTarget: true,
  fatTarget: true,
  darkMode: true,
  pushNotifications: true,
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).pick({
  userId: true,
  plan: true,
});

export const insertCalorieEntrySchema = createInsertSchema(calorieEntries).pick({
  userId: true,
  foodName: true,
  calories: true,
  protein: true,
  carbs: true,
  fat: true,
  fiber: true,
  sugar: true,
  quantity: true,
  unit: true,
  mealType: true,
});

export const insertWorkoutAlarmSchema = createInsertSchema(workoutAlarms).pick({
  userId: true,
  time: true,
  days: true,
  message: true,
  isActive: true,
});

export const insertProgressEntrySchema = createInsertSchema(progressEntries).pick({
  userId: true,
  weight: true,
  workoutsCompleted: true,
  caloriesConsumed: true,
});

export const insertDailyCheckinSchema = createInsertSchema(dailyCheckins).pick({
  userId: true,
  sleepQuality: true,
  energyLevel: true,
  soreness: true,
  mood: true,
  stress: true,
  readinessScore: true,
  notes: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  userId: true,
  type: true,
  name: true,
  description: true,
  icon: true,
});

export const insertPersonalRecordSchema = createInsertSchema(personalRecords).pick({
  userId: true,
  exercise: true,
  type: true,
  value: true,
  unit: true,
  previousValue: true,
  improvementPercentage: true,
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).pick({
  userId: true,
  name: true,
  plan: true,
  targetCalories: true,
  targetProtein: true,
  targetCarbs: true,
  targetFat: true,
  dietType: true,
  duration: true,
  groceryList: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  role: true,
  content: true,
  context: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type InsertCalorieEntry = z.infer<typeof insertCalorieEntrySchema>;
export type CalorieEntry = typeof calorieEntries.$inferSelect;
export type InsertWorkoutAlarm = z.infer<typeof insertWorkoutAlarmSchema>;
export type WorkoutAlarm = typeof workoutAlarms.$inferSelect;
export type InsertProgressEntry = z.infer<typeof insertProgressEntrySchema>;
export type ProgressEntry = typeof progressEntries.$inferSelect;
export type InsertDailyCheckin = z.infer<typeof insertDailyCheckinSchema>;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertPersonalRecord = z.infer<typeof insertPersonalRecordSchema>;
export type PersonalRecord = typeof personalRecords.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
