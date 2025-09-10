import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  quantity: integer("quantity").default(1),
  unit: text("unit").default("serving"),
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
  quantity: true,
  unit: true,
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
