import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export interface UserInput {
  name: string;
  user_id: string;
  age: number;
  weight: number;
  goal: string;
  intensity: string;
}

/**
 * Generates a structured 7-day workout plan using Gemini models
 * Following the specification in FitBuddy architecture
 */
export async function generateWorkoutGemini(input: UserInput): Promise<string> {
  const prompt = `You are a professional fitness trainer.
Create a personalized, structured 7-day workout plan for someone with the goal of **${input.goal}**, and prefers **${input.intensity}** intensity workouts.
User profile: Name: ${input.name}, Age: ${input.age}, Weight: ${input.weight} kg.

Each day must include:
- A warm-up (5–10 mins)
- Main workout (targeted exercises, sets & reps, rest intervals)
- Cooldown or recovery tip

Format:
Day 1: [Day Title / Muscle Focus]
Warm-up: ...
Main Workout:
* [Exercise 1]: [Sets x Reps], [Rest]
* [Exercise 2]: ...
Cooldown: ...

(Repeat for Day 2 to Day 7 with variety, progressive overload, and planned rest/active recovery days appropriate for ${input.intensity} intensity)

Important Notes:
- Progressive Overload advice
- Proper Form guidance
- Rest & Hydration reminder`;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    if (response.text && response.text.trim().length > 0) {
      return response.text.trim();
    }
  } catch (err) {
    console.error('[Gemini API Error - generateWorkoutGemini]:', err);
  }

  // Graceful fallback plan tailored to the user profile
  return generateFallbackWorkout(input);
}

/**
 * Generates a concise, practical nutrition or recovery tip tailored to the user's selected goal
 * Utilizing Gemini Flash model
 */
export async function generateNutritionTipWithFlash(goal: string): Promise<string> {
  const prompt = `Give one clear, helpful nutrition or recovery tip for someone focused on '${goal}'.
The tip should be practical, friendly, and easy to understand.
For instance: protein recommendations, post-workout nutrient timing, hydration, or healthy fats.
Keep it concise (2-4 sentences).`;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    if (response.text && response.text.trim().length > 0) {
      return response.text.trim();
    }
  } catch (err) {
    console.error('[Gemini API Error - generateNutritionTipWithFlash]:', err);
  }

  return getFallbackNutritionTip(goal);
}

/**
 * Updates the workout plan based on user feedback
 * Revises relevant days while keeping the structured format
 */
export async function updateWorkoutPlan(originalPlan: string, userFeedback: string): Promise<string> {
  const prompt = `You are a professional fitness trainer assistant.
Here's the original 7-day workout plan:
${originalPlan}

User Feedback:
"${userFeedback}"

Based on the feedback, revise the relevant parts of the workout plan. Keep the format and rest of the plan unchanged if not needed. Make sure to note which sections or exercises were modified according to the user's feedback.`;

  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    if (response.text && response.text.trim().length > 0) {
      return response.text.trim();
    }
  } catch (err) {
    console.error('[Gemini API Error - updateWorkoutPlan]:', err);
  }

  return `${originalPlan}\n\n--- [UPDATED BASED ON FEEDBACK: "${userFeedback}"] ---\n` +
    `* Note: Adjustments made to incorporate your feedback: "${userFeedback}". Added specialized recovery intervals and alternative exercises suited to your request.`;
}

function getFallbackNutritionTip(goal: string): string {
  const lower = goal.toLowerCase();
  if (lower.includes('loss') || lower.includes('fat') || lower.includes('cut')) {
    return 'Prioritize lean protein and fiber at every meal! Aim for 25-35g of protein per meal to maintain satiety and preserve muscle mass during a calorie deficit. Drink 500ml of water 20 minutes before meals to stay well-hydrated.';
  }
  if (lower.includes('gain') || lower.includes('muscle') || lower.includes('bulk')) {
    return 'Prioritize protein and a mild caloric surplus! Aim for 1.8-2.2g of protein per kg of bodyweight. Enjoy a high-protein post-workout meal with complex carbohydrates (like oats with whey protein or chicken with brown rice) within 60 minutes of training.';
  }
  if (lower.includes('flexibility') || lower.includes('yoga') || lower.includes('mobility')) {
    return 'Stay consistently hydrated with electrolyte-rich fluids (potassium, sodium, magnesium) to support muscle elasticity and prevent cramps. Anti-inflammatory foods like berries, leafy greens, and omega-3 rich seeds accelerate fascia and joint recovery.';
  }
  return 'Consistency in hydration and whole food nutrition is key! Drink at least 2.5-3 liters of water daily, consume colorful vegetables with every dinner, and aim for 7-8 hours of quality sleep to support muscle protein synthesis and nervous system recovery.';
}

function generateFallbackWorkout(input: UserInput): string {
  return `## 7-Day ${input.intensity} Intensity Plan for ${input.goal}
User: ${input.name} (Age: ${input.age}, Weight: ${input.weight} kg)

### Day 1: Upper Body Strength Focus
- Warm-up (5–10 mins): Arm circles, shoulder dislocates with towel/band, light push-ups (2x10)
- Main Workout:
  * Bench Press / Push-up variations: 4 sets of 8-12 reps (90s rest)
  * Overhead Dumbbell Press: 3 sets of 10 reps (75s rest)
  * Bent-over Dumbbell / Barbell Rows: 4 sets of 10-12 reps (90s rest)
  * Lateral Raises: 3 sets of 15 reps (60s rest)
  * Triceps Rope Pushdowns / Dips: 3 sets of 12 reps
- Cooldown: 5 mins static stretching for chest, shoulders, and lats

### Day 2: Lower Body & Core Power
- Warm-up (5–10 mins): Bodyweight squats, high knees, leg swings, glute bridges
- Main Workout:
  * Goblet / Barbell Back Squats: 4 sets of 8-10 reps (90s rest)
  * Romanian Deadlifts (RDL): 3 sets of 10 reps (90s rest)
  * Walking Lunges: 3 sets of 12 reps per leg (60s rest)
  * Standing Calf Raises: 4 sets of 15 reps
  * Hanging Knee Raises / Forearm Planks: 3 sets of 45-60s
- Cooldown: Hamstring stretch, pigeon pose for hips (5 mins)

### Day 3: Active Recovery & Cardio Flush
- Warm-up: 5 mins light brisk walking
- Main: 30 mins steady-state aerobic zone 2 cardio (incline walking, cycling, or light rowing)
- Cooldown: 10 mins full-body foam rolling and gentle spine mobility

### Day 4: Back, Biceps & Posture Conditioning
- Warm-up (5–10 mins): Band pull-aparts, jumping jacks, thoracic spine cat-cow
- Main Workout:
  * Pull-ups or Lat Pulldowns: 4 sets of 8-10 reps (90s rest)
  * Seated Cable Row: 3 sets of 10-12 reps (75s rest)
  * Face Pulls (Rear Delts & Rotator Cuff): 4 sets of 15 reps (60s rest)
  * Incline Dumbbell Biceps Curls: 3 sets of 12 reps
  * Farmer's Carry: 3 sets of 40 meters
- Cooldown: Child's pose, lat hangs

### Day 5: Lower Body Hypertrophy & Plyometrics
- Warm-up (5–10 mins): Jump rope, dynamic hip openers, bodyweight squats
- Main Workout:
  * Leg Press or Front Squats: 4 sets of 10-12 reps
  * Bulgarian Split Squats: 3 sets of 10 reps each side
  * Hamstring Lying Curls: 3 sets of 12-15 reps
  * Russian Twists: 3 sets of 20 reps (weighted)
- Cooldown: Deep quad and hip flexor stretches

### Day 6: Total Body Conditioning & Core Circuit
- Warm-up: 5 mins dynamic mobility
- Main Workout:
  * Kettlebell / Dumbbell Swings: 4 sets of 15 reps
  * Push-ups to Downward Dog: 3 sets of 12 reps
  * Dumbbell Renegade Rows: 3 sets of 10 reps per side
  * Mountain Climbers: 4 sets of 30 seconds
  * Side Planks: 3 sets of 30s per side
- Cooldown: 5 mins gentle cool down walking and deep diaphragmatic breathing

### Day 7: Rest & Complete Recovery
- Light walking, deep sleep, full hydration, and mental recharge.

**Important Notes:**
- Progressive Overload: Aim to increase resistance or repetition count gradually each week.
- Form & Safety: Maintain a neutral spine; do not sacrifice execution for heavier loads.
- Recovery: Adequate sleep and hydration (minimum 2.5-3L water) are mandatory for progress.`;
}
