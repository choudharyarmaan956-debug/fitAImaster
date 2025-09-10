import { 
  type User, 
  type InsertUser, 
  type WorkoutPlan, 
  type InsertWorkoutPlan,
  type CalorieEntry,
  type InsertCalorieEntry,
  type WorkoutAlarm,
  type InsertWorkoutAlarm,
  type ProgressEntry,
  type InsertProgressEntry
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Workout plan methods
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  getWorkoutPlanByUserId(userId: string): Promise<WorkoutPlan | undefined>;
  updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan | undefined>;

  // Calorie tracking methods
  createCalorieEntry(entry: InsertCalorieEntry): Promise<CalorieEntry>;
  getCalorieEntriesByUserId(userId: string, date?: Date): Promise<CalorieEntry[]>;
  getTodayCaloriesByUserId(userId: string): Promise<number>;

  // Workout alarm methods
  createWorkoutAlarm(alarm: InsertWorkoutAlarm): Promise<WorkoutAlarm>;
  getWorkoutAlarmsByUserId(userId: string): Promise<WorkoutAlarm[]>;
  updateWorkoutAlarm(id: string, updates: Partial<WorkoutAlarm>): Promise<WorkoutAlarm | undefined>;
  deleteWorkoutAlarm(id: string): Promise<boolean>;

  // Progress tracking methods
  createProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry>;
  getProgressEntriesByUserId(userId: string): Promise<ProgressEntry[]>;
  getLatestProgressByUserId(userId: string): Promise<ProgressEntry | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private workoutPlans: Map<string, WorkoutPlan>;
  private calorieEntries: Map<string, CalorieEntry>;
  private workoutAlarms: Map<string, WorkoutAlarm>;
  private progressEntries: Map<string, ProgressEntry>;

  constructor() {
    this.users = new Map();
    this.workoutPlans = new Map();
    this.calorieEntries = new Map();
    this.workoutAlarms = new Map();
    this.progressEntries = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createWorkoutPlan(insertPlan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const id = randomUUID();
    const plan: WorkoutPlan = {
      ...insertPlan,
      id,
      createdAt: new Date()
    };
    this.workoutPlans.set(id, plan);
    return plan;
  }

  async getWorkoutPlanByUserId(userId: string): Promise<WorkoutPlan | undefined> {
    return Array.from(this.workoutPlans.values()).find(
      (plan) => plan.userId === userId
    );
  }

  async updateWorkoutPlan(id: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan | undefined> {
    const plan = this.workoutPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updates };
    this.workoutPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  async createCalorieEntry(insertEntry: InsertCalorieEntry): Promise<CalorieEntry> {
    const id = randomUUID();
    const entry: CalorieEntry = {
      ...insertEntry,
      id,
      entryDate: new Date()
    };
    this.calorieEntries.set(id, entry);
    return entry;
  }

  async getCalorieEntriesByUserId(userId: string, date?: Date): Promise<CalorieEntry[]> {
    const entries = Array.from(this.calorieEntries.values()).filter(
      (entry) => entry.userId === userId
    );

    if (date) {
      const targetDate = new Date(date).toDateString();
      return entries.filter(entry => 
        entry.entryDate && new Date(entry.entryDate).toDateString() === targetDate
      );
    }

    return entries;
  }

  async getTodayCaloriesByUserId(userId: string): Promise<number> {
    const today = new Date();
    const todayEntries = await this.getCalorieEntriesByUserId(userId, today);
    return todayEntries.reduce((total, entry) => total + entry.calories, 0);
  }

  async createWorkoutAlarm(insertAlarm: InsertWorkoutAlarm): Promise<WorkoutAlarm> {
    const id = randomUUID();
    const alarm: WorkoutAlarm = {
      ...insertAlarm,
      id,
      createdAt: new Date()
    };
    this.workoutAlarms.set(id, alarm);
    return alarm;
  }

  async getWorkoutAlarmsByUserId(userId: string): Promise<WorkoutAlarm[]> {
    return Array.from(this.workoutAlarms.values()).filter(
      (alarm) => alarm.userId === userId
    );
  }

  async updateWorkoutAlarm(id: string, updates: Partial<WorkoutAlarm>): Promise<WorkoutAlarm | undefined> {
    const alarm = this.workoutAlarms.get(id);
    if (!alarm) return undefined;
    
    const updatedAlarm = { ...alarm, ...updates };
    this.workoutAlarms.set(id, updatedAlarm);
    return updatedAlarm;
  }

  async deleteWorkoutAlarm(id: string): Promise<boolean> {
    return this.workoutAlarms.delete(id);
  }

  async createProgressEntry(insertEntry: InsertProgressEntry): Promise<ProgressEntry> {
    const id = randomUUID();
    const entry: ProgressEntry = {
      ...insertEntry,
      id,
      entryDate: new Date()
    };
    this.progressEntries.set(id, entry);
    return entry;
  }

  async getProgressEntriesByUserId(userId: string): Promise<ProgressEntry[]> {
    return Array.from(this.progressEntries.values())
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => new Date(b.entryDate!).getTime() - new Date(a.entryDate!).getTime());
  }

  async getLatestProgressByUserId(userId: string): Promise<ProgressEntry | undefined> {
    const entries = await this.getProgressEntriesByUserId(userId);
    return entries[0];
  }
}

export const storage = new MemStorage();
