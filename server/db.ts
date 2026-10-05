import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dbPath = path.resolve(process.cwd(), 'fitbuddy.db');
const db = new DatabaseSync(dbPath);

// Initialize SQLite Schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      weight REAL NOT NULL,
      goal TEXT NOT NULL,
      intensity TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      original_plan TEXT NOT NULL,
      updated_plan TEXT,
      nutrition_tip TEXT,
      feedback TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
    );
  `);
  console.log(`[FitBuddy DB] SQLite initialized at ${dbPath}`);
}

export interface UserRecord {
  id?: number;
  user_id: string;
  name: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  created_at?: string;
}

export interface PlanRecord {
  id?: number;
  user_id: string;
  original_plan: string;
  updated_plan?: string | null;
  nutrition_tip?: string | null;
  feedback?: string | null;
  updated_at?: string;
}

export interface UserWithPlan extends UserRecord {
  original_plan?: string | null;
  updated_plan?: string | null;
  nutrition_tip?: string | null;
  feedback?: string | null;
}

export function saveUser(user: UserRecord): void {
  const existing = db.prepare('SELECT id FROM users WHERE user_id = ?').get(user.user_id);
  if (existing) {
    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, age = ?, weight = ?, goal = ?, intensity = ?
      WHERE user_id = ?
    `);
    stmt.run(user.name, user.age, user.weight, user.goal, user.intensity, user.user_id);
  } else {
    const stmt = db.prepare(`
      INSERT INTO users (user_id, name, age, weight, goal, intensity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(user.user_id, user.name, user.age, user.weight, user.goal, user.intensity);
  }
}

export function savePlan(userId: string, originalPlan: string, nutritionTip?: string): void {
  const existing = db.prepare('SELECT id FROM plans WHERE user_id = ?').get(userId);
  if (existing) {
    const stmt = db.prepare(`
      UPDATE plans 
      SET original_plan = ?, nutrition_tip = COALESCE(?, nutrition_tip), updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    stmt.run(originalPlan, nutritionTip || null, userId);
  } else {
    const stmt = db.prepare(`
      INSERT INTO plans (user_id, original_plan, nutrition_tip)
      VALUES (?, ?, ?)
    `);
    stmt.run(userId, originalPlan, nutritionTip || null);
  }
}

export function updatePlan(userId: string, updatedText: string, feedback?: string): boolean {
  const existing = db.prepare('SELECT id FROM plans WHERE user_id = ?').get(userId);
  if (existing) {
    const stmt = db.prepare(`
      UPDATE plans 
      SET updated_plan = ?, feedback = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    stmt.run(updatedText, feedback || null, userId);
    return true;
  }
  return false;
}

export function getOriginalPlan(userId: string): string | null {
  const row = db.prepare('SELECT original_plan FROM plans WHERE user_id = ?').get(userId) as { original_plan: string } | undefined;
  return row ? row.original_plan : null;
}

export function getUser(userId: string): UserWithPlan | null {
  const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId) as UserRecord | undefined;
  if (!user) return null;
  const plan = db.prepare('SELECT * FROM plans WHERE user_id = ?').get(userId) as PlanRecord | undefined;
  return {
    ...user,
    original_plan: plan?.original_plan || null,
    updated_plan: plan?.updated_plan || null,
    nutrition_tip: plan?.nutrition_tip || null,
    feedback: plan?.feedback || null,
  };
}

export function getAllUsers(): UserWithPlan[] {
  const users = db.prepare('SELECT * FROM users ORDER BY id DESC').all() as unknown as UserRecord[];
  return users.map((user) => {
    const plan = db.prepare('SELECT * FROM plans WHERE user_id = ?').get(user.user_id) as PlanRecord | undefined;
    return {
      ...user,
      original_plan: plan?.original_plan || 'N/A',
      updated_plan: plan?.updated_plan || 'Not updated',
      nutrition_tip: plan?.nutrition_tip || null,
      feedback: plan?.feedback || null,
    };
  });
}

export function deleteUser(userId: string): boolean {
  const deletePlanStmt = db.prepare('DELETE FROM plans WHERE user_id = ?');
  deletePlanStmt.run(userId);
  const deleteUserStmt = db.prepare('DELETE FROM users WHERE user_id = ?');
  const result = deleteUserStmt.run(userId);
  return true;
}

export function seedDefaultSamplesIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  if (count && count.cnt > 0) return;

  const sampleUsers = [
    {
      user_id: 'USR-101',
      name: 'Shreya Sharma',
      age: 22,
      weight: 55.0,
      goal: 'Muscle Gain',
      intensity: 'High',
      original_plan: `## 7-Day Muscle Gain Workout Plan (High Intensity)

### Day 1: Upper Body Push (Chest, Shoulders & Triceps)
- Warm-up (5-10 mins): Arm circles, shoulder rotations, push-ups (2 sets of 10)
- Main Workout:
  * Barbell Bench Press: 4 sets of 8-10 reps (90s rest)
  * Incline Dumbbell Press: 3 sets of 10-12 reps (75s rest)
  * Overhead Barbell Press: 3 sets of 8-10 reps (90s rest)
  * Dumbbell Lateral Raises: 4 sets of 12-15 reps (60s rest)
  * Cable Triceps Pushdowns: 3 sets of 12-15 reps (60s rest)
- Cooldown: Static chest stretch against wall, overhead triceps stretch (5 mins)

### Day 2: Lower Body & Core Focus
- Warm-up (5-10 mins): Bodyweight squats, leg swings, glute bridges (2 sets of 15)
- Main Workout:
  * Barbell Back Squats: 4 sets of 8-10 reps (120s rest)
  * Romanian Deadlifts (RDL): 3 sets of 10-12 reps (90s rest)
  * Walking Lunges: 3 sets of 12 reps per leg (60s rest)
  * Standing Calf Raises: 4 sets of 15-20 reps (45s rest)
  * Hanging Leg Raises / Planks: 3 sets of 12 reps / 60s hold
- Cooldown: Hamstring stretch, pigeon stretch for glutes (5 mins)

### Day 3: Active Rest & Mobility
- Warm-up: 10 mins light brisk walk
- Main: 25 mins deep yoga mobility flow focusing on hips, spine, and shoulders
- Cooldown: Foam rolling quads, upper back, and calves

### Day 4: Upper Body Pull (Back, Rear Delts & Biceps)
- Warm-up (5-10 mins): Band pull-aparts, scapular retractions, jumping jacks
- Main Workout:
  * Lat Pulldowns / Pull-ups: 4 sets of 8-10 reps (90s rest)
  * Bent-Over Barbell Rows: 4 sets of 8-10 reps (90s rest)
  * Seated Cable Rows: 3 sets of 10-12 reps (60s rest)
  * Face Pulls: 4 sets of 15 reps (60s rest)
  * Incline Dumbbell Biceps Curls: 3 sets of 12 reps (60s rest)
- Cooldown: Child's pose, lat stretch (5 mins)

### Day 5: Legs Hypertrophy & Calves
- Warm-up (5-10 mins): Hip openers, high knees, bodyweight lunges
- Main Workout:
  * Leg Press: 4 sets of 10-12 reps (90s rest)
  * Bulgarian Split Squats: 3 sets of 10 reps each leg (75s rest)
  * Lying Leg Curls: 3 sets of 12-15 reps (60s rest)
  * Leg Extensions: 3 sets of 12-15 reps (60s rest)
- Cooldown: Quad stretch, butterfly stretch (5 mins)

### Day 6: Shoulder & Arm Sculpt + Core
- Warm-up: Dynamic arm swings, light band presses
- Main Workout:
  * Arnold Press: 3 sets of 10 reps (75s rest)
  * Cable Lateral Raises: 3 sets of 12-15 reps
  * Barbell EZ-Bar Curls: 3 sets of 10 reps
  * Skull Crushers: 3 sets of 10-12 reps
  * Ab Wheel Rollouts: 3 sets of 10 reps
- Cooldown: Full upper body stretch

### Day 7: Full Recovery & Mental Recharge
- Light 20 min walk in nature + full foam rolling & 8+ hours restorative sleep.`,
      updated_plan: `## 7-Day Muscle Gain Workout Plan (Updated with Yoga & Joint Care)

### Day 1: Upper Body Push (Chest, Shoulders & Triceps)
- Warm-up (8 mins): Arm circles, cat-cow mobility, push-ups (2 sets of 10)
- Main Workout:
  * Barbell Bench Press: 4 sets of 8-10 reps (90s rest)
  * Incline Dumbbell Press: 3 sets of 10-12 reps (75s rest)
  * Overhead Dumbbell Press (Joint-Friendly): 3 sets of 10 reps
  * Cable Lateral Raises: 4 sets of 12-15 reps (60s rest)
  * Overhead Rope Triceps Extension: 3 sets of 12 reps
- Cooldown: 5 mins gentle chest and shoulder yoga stretches

### Day 2: Lower Body & Core Focus
- Warm-up (8 mins): Deep bodyweight squats, world's greatest stretch
- Main Workout:
  * Barbell Back Squats: 4 sets of 8-10 reps (120s rest)
  * Romanian Deadlifts: 3 sets of 10-12 reps
  * Bulgarian Split Squats: 3 sets of 10 reps per leg
  * Hanging Leg Raises: 3 sets of 12 reps
- Cooldown: 10 mins Vinyasa hip opener yoga flow

### Day 3: Restorative Yoga & Mobility (Updated based on feedback)
- 35 mins guided restorative yoga session targeting hip flexors, lower back, and thoracic spine.

### Day 4: Upper Body Pull & Back
- Same structured progression with added rear-delt band pull-aparts.

### Day 5: Legs Hypertrophy
- Leg press, walking lunges, and calf raises.

### Day 6: Arms & Core + 15 min Cardio Flow
- Biceps curls, triceps dips, and 15 mins moderate tempo cardio on rowing machine.

### Day 7: Full Rest & Recovery
- Hydration, protein synthesis, and restorative sleep.`,
      nutrition_tip: 'Prioritize protein! Aim for 1.6 to 2.2 grams of protein per kilogram of bodyweight. Include a clean protein source (eggs, chicken, lentils, Greek yogurt) within 45 minutes of training to optimize muscle protein synthesis.',
      feedback: 'Add more yoga and make shoulder exercises easier on the rotator cuffs.',
    },
    {
      user_id: 'USR-102',
      name: 'Marcus Chen',
      age: 28,
      weight: 82.5,
      goal: 'Weight Loss',
      intensity: 'High',
      original_plan: `## 7-Day High-Intensity Fat Loss Plan

### Day 1: Full Body HIIT & Metabolic Circuit
- Warm-up (5 mins): Jumping jacks, mountain climbers, dynamic lunges
- Main Workout (4 rounds of 45s work / 15s rest):
  * Kettlebell Swings
  * Burpees
  * Goblet Squats
  * Dumbbell Renegade Rows
  * Box Jumps / Step-ups
- Cooldown: 5 mins static stretching

### Day 2: Upper Body Strength + Incline Treadmill Walk
- Warm-up: Banded pull-aparts, arm swings
- Main: Dumbbell bench press, bent-over rows, overhead press + 20 mins incline walking (12% incline, 3.2 mph)
- Cooldown: Shoulder & quad stretches

### Day 3: Core & Cardio Blitz
- 25 mins HIIT sprints (30s sprint / 30s walk) + 15 mins core circuit (plank, bicycle crunches, Russian twists)

### Day 4: Lower Body Blast
- Deadlifts, walking lunges, leg press, hamstring curls

### Day 5: Active Recovery
- 40 mins light cycling or swimming

### Day 6: Total Body Kettlebell Complex
- Clean & press, front squats, push-ups, kettlebell snatches

### Day 7: Rest & Meal Prep
- Complete rest, hydration tracking, and meal preparation for the upcoming week.`,
      updated_plan: null,
      nutrition_tip: 'Stay in a moderate 300-500 kcal deficit. Drink a large glass of water 20 minutes before meals and ensure your plate is half fibrous vegetables to boost satiety without calorie overload.',
      feedback: null,
    }
  ];

  for (const user of sampleUsers) {
    saveUser({
      user_id: user.user_id,
      name: user.name,
      age: user.age,
      weight: user.weight,
      goal: user.goal,
      intensity: user.intensity,
    });
    savePlan(user.user_id, user.original_plan, user.nutrition_tip);
    if (user.updated_plan) {
      updatePlan(user.user_id, user.updated_plan, user.feedback);
    }
  }
}
