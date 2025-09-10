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
  type InsertProgressEntry,
  type DailyCheckin,
  type InsertDailyCheckin,
  type Achievement,
  type InsertAchievement,
  type PersonalRecord,
  type InsertPersonalRecord,
  type MealPlan,
  type InsertMealPlan,
  type ChatMessage,
  type InsertChatMessage
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

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
  getTodayMacrosByUserId(userId: string): Promise<{protein: number, carbs: number, fat: number}>;

  // Workout alarm methods
  createWorkoutAlarm(alarm: InsertWorkoutAlarm): Promise<WorkoutAlarm>;
  getWorkoutAlarmsByUserId(userId: string): Promise<WorkoutAlarm[]>;
  updateWorkoutAlarm(id: string, updates: Partial<WorkoutAlarm>): Promise<WorkoutAlarm | undefined>;
  deleteWorkoutAlarm(id: string): Promise<boolean>;

  // Progress tracking methods
  createProgressEntry(entry: InsertProgressEntry): Promise<ProgressEntry>;
  getProgressEntriesByUserId(userId: string): Promise<ProgressEntry[]>;
  getLatestProgressByUserId(userId: string): Promise<ProgressEntry | undefined>;

  // Daily check-in methods
  createDailyCheckin(checkin: InsertDailyCheckin): Promise<DailyCheckin>;
  getTodayCheckinByUserId(userId: string): Promise<DailyCheckin | undefined>;
  getCheckinsByUserId(userId: string, limit?: number): Promise<DailyCheckin[]>;

  // Achievement methods
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievementsByUserId(userId: string): Promise<Achievement[]>;
  
  // Personal record methods
  createPersonalRecord(record: InsertPersonalRecord): Promise<PersonalRecord>;
  getPersonalRecordsByUserId(userId: string): Promise<PersonalRecord[]>;
  
  // Meal plan methods
  createMealPlan(plan: InsertMealPlan): Promise<MealPlan>;
  getMealPlansByUserId(userId: string): Promise<MealPlan[]>;
  getLatestMealPlanByUserId(userId: string): Promise<MealPlan | undefined>;
  
  // Chat methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesByUserId(userId: string, limit?: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private workoutPlans: Map<string, WorkoutPlan>;
  private calorieEntries: Map<string, CalorieEntry>;
  private workoutAlarms: Map<string, WorkoutAlarm>;
  private progressEntries: Map<string, ProgressEntry>;
  private dailyCheckins: Map<string, DailyCheckin>;
  private achievements: Map<string, Achievement>;
  private personalRecords: Map<string, PersonalRecord>;
  private mealPlans: Map<string, MealPlan>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.users = new Map();
    this.workoutPlans = new Map();
    this.calorieEntries = new Map();
    this.workoutAlarms = new Map();
    this.progressEntries = new Map();
    this.dailyCheckins = new Map();
    this.achievements = new Map();
    this.personalRecords = new Map();
    this.mealPlans = new Map();
    this.chatMessages = new Map();
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
    
    // Hash password for security
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    // Calculate default macro targets based on goals and weight
    const weight = insertUser.weight || 70; // Default weight
    const calorieTarget = insertUser.calorieTarget || 2000;
    const proteinTarget = insertUser.proteinTarget || Math.round(weight * 1.6); // 1.6g per kg
    const fatTarget = insertUser.fatTarget || Math.round((calorieTarget * 0.25) / 9); // 25% of calories
    const carbTarget = insertUser.carbTarget || Math.round((calorieTarget - (proteinTarget * 4) - (fatTarget * 9)) / 4);
    
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
      age: insertUser.age ?? null,
      weight: insertUser.weight ?? null,
      height: insertUser.height ?? null,
      fitnessLevel: insertUser.fitnessLevel ?? null,
      goals: insertUser.goals ? insertUser.goals as string[] : null,
      workoutDays: insertUser.workoutDays ?? null,
      calorieTarget: insertUser.calorieTarget ?? null,
      // New nutrition preferences with defaults
      dietType: insertUser.dietType ?? null,
      allergies: insertUser.allergies ? insertUser.allergies as string[] : null,
      dislikedFoods: insertUser.dislikedFoods ? insertUser.dislikedFoods as string[] : null,
      proteinTarget: proteinTarget,
      carbTarget: carbTarget,
      fatTarget: fatTarget,
      // App preferences
      darkMode: insertUser.darkMode ?? false,
      pushNotifications: insertUser.pushNotifications ?? true,
      // Streaks and stats
      currentStreak: 0,
      longestStreak: 0,
      totalWorkouts: 0,
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
      plan: insertPlan.plan || null,
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
      quantity: insertEntry.quantity ?? null,
      unit: insertEntry.unit ?? null,
      protein: insertEntry.protein ?? null,
      carbs: insertEntry.carbs ?? null,
      fat: insertEntry.fat ?? null,
      fiber: insertEntry.fiber ?? null,
      sugar: insertEntry.sugar ?? null,
      mealType: insertEntry.mealType ?? null,
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

  async getTodayMacrosByUserId(userId: string): Promise<{protein: number, carbs: number, fat: number}> {
    const today = new Date();
    const todayEntries = await this.getCalorieEntriesByUserId(userId, today);
    return todayEntries.reduce((totals, entry) => ({
      protein: totals.protein + (entry.protein || 0),
      carbs: totals.carbs + (entry.carbs || 0),
      fat: totals.fat + (entry.fat || 0)
    }), { protein: 0, carbs: 0, fat: 0 });
  }

  async createWorkoutAlarm(insertAlarm: InsertWorkoutAlarm): Promise<WorkoutAlarm> {
    const id = randomUUID();
    const alarm: WorkoutAlarm = {
      ...insertAlarm,
      id,
      message: insertAlarm.message ?? null,
      days: insertAlarm.days ? insertAlarm.days as string[] : null,
      isActive: insertAlarm.isActive ?? null,
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
      weight: insertEntry.weight ?? null,
      workoutsCompleted: insertEntry.workoutsCompleted ?? null,
      caloriesConsumed: insertEntry.caloriesConsumed ?? null,
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

  // Daily Check-in methods
  async createDailyCheckin(insertCheckin: InsertDailyCheckin): Promise<DailyCheckin> {
    const id = randomUUID();
    const checkin: DailyCheckin = {
      ...insertCheckin,
      id,
      readinessScore: insertCheckin.readinessScore ?? null,
      notes: insertCheckin.notes ?? null,
      checkinDate: new Date()
    };
    this.dailyCheckins.set(id, checkin);
    return checkin;
  }

  async getTodayCheckinByUserId(userId: string): Promise<DailyCheckin | undefined> {
    const today = new Date().toDateString();
    return Array.from(this.dailyCheckins.values()).find(
      checkin => checkin.userId === userId && 
                 checkin.checkinDate && 
                 new Date(checkin.checkinDate).toDateString() === today
    );
  }

  async getCheckinsByUserId(userId: string, limit?: number): Promise<DailyCheckin[]> {
    const checkins = Array.from(this.dailyCheckins.values())
      .filter(checkin => checkin.userId === userId)
      .sort((a, b) => new Date(b.checkinDate!).getTime() - new Date(a.checkinDate!).getTime());
    return limit ? checkins.slice(0, limit) : checkins;
  }

  // Achievement methods
  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const achievement: Achievement = {
      ...insertAchievement,
      id,
      unlockedAt: new Date()
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  async getAchievementsByUserId(userId: string): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.userId === userId)
      .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime());
  }

  // Personal Record methods
  async createPersonalRecord(insertRecord: InsertPersonalRecord): Promise<PersonalRecord> {
    const id = randomUUID();
    const record: PersonalRecord = {
      ...insertRecord,
      id,
      previousValue: insertRecord.previousValue ?? null,
      improvementPercentage: insertRecord.improvementPercentage ?? null,
      achievedAt: new Date()
    };
    this.personalRecords.set(id, record);
    return record;
  }

  async getPersonalRecordsByUserId(userId: string): Promise<PersonalRecord[]> {
    return Array.from(this.personalRecords.values())
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.achievedAt!).getTime() - new Date(a.achievedAt!).getTime());
  }

  // Meal Plan methods
  async createMealPlan(insertPlan: InsertMealPlan): Promise<MealPlan> {
    const id = randomUUID();
    const plan: MealPlan = {
      ...insertPlan,
      id,
      plan: insertPlan.plan ?? null,
      targetCalories: insertPlan.targetCalories ?? null,
      targetProtein: insertPlan.targetProtein ?? null,
      targetCarbs: insertPlan.targetCarbs ?? null,
      targetFat: insertPlan.targetFat ?? null,
      dietType: insertPlan.dietType ?? null,
      duration: insertPlan.duration ?? null,
      groceryList: insertPlan.groceryList ? insertPlan.groceryList as string[] : null,
      createdAt: new Date()
    };
    this.mealPlans.set(id, plan);
    return plan;
  }

  async getMealPlansByUserId(userId: string): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values())
      .filter(plan => plan.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getLatestMealPlanByUserId(userId: string): Promise<MealPlan | undefined> {
    const plans = await this.getMealPlansByUserId(userId);
    return plans[0];
  }

  // Chat methods
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      ...insertMessage,
      id,
      context: insertMessage.context ?? null,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessagesByUserId(userId: string, limit?: number): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()); // Chronological order
    return limit ? messages.slice(-limit) : messages; // Get most recent messages
  }
}

export const storage = new MemStorage();
