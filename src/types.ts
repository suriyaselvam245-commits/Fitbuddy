export type IntensityLevel = 'Low' | 'Medium' | 'High';

export interface UserFormData {
  username: string;
  user_id: string;
  age: number | '';
  weight: number | '';
  goal: string;
  intensity: IntensityLevel;
}

export interface GeneratedPlanResponse {
  message: string;
  user_id: string;
  username: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  workout_plan: string;
  nutrition_tip: string;
}

export interface UpdatedPlanResponse {
  message: string;
  user_id: string;
  original_plan: string;
  updated_plan: string;
  feedback: string;
  user?: UserRecord;
}

export interface UserRecord {
  id?: number;
  user_id: string;
  name: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
  original_plan?: string | null;
  updated_plan?: string | null;
  nutrition_tip?: string | null;
  feedback?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ParsedDayPlan {
  dayNumber: number;
  title: string;
  warmup: string[];
  exercises: {
    name: string;
    setsReps: string;
    notes?: string;
  }[];
  cooldown: string[];
  rawText: string;
}
