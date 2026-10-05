import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  saveUser,
  savePlan,
  updatePlan,
  getOriginalPlan,
  getUser,
  getAllUsers,
  deleteUser,
  seedDefaultSamplesIfEmpty,
  UserRecord,
} from './server/db.ts';
import {
  generateWorkoutGemini,
  generateNutritionTipWithFlash,
  updateWorkoutPlan,
} from './server/gemini.ts';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize SQLite database
initDatabase();
// Seed initial samples so the admin dashboard has immediate data
seedDefaultSamplesIfEmpty();

// --- API Routes ---

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'FitBuddy - AI Workout Generator', time: new Date().toISOString() });
});

// 1. Generate workout plan & nutrition tip
const handleGenerateWorkout = async (req: Request, res: Response) => {
  try {
    const name = String(req.body.username || req.body.name || '').trim();
    let userId = String(req.body.user_id || req.body.userId || '').trim();
    const age = parseInt(req.body.age, 10);
    const weight = parseFloat(req.body.weight);
    const goal = String(req.body.goal || '').trim();
    const intensity = String(req.body.intensity || 'Medium').trim();

    if (!name || isNaN(age) || isNaN(weight) || !goal) {
      res.status(400).json({
        error: 'Missing required fields: username, age, weight, goal are required.',
      });
      return;
    }

    // Auto-generate user ID if missing
    if (!userId) {
      userId = `USR-${Math.floor(100 + Math.random() * 900)}`;
    }

    const userInput = {
      name,
      user_id: userId,
      age,
      weight,
      goal,
      intensity,
    };

    console.log(`[FitBuddy] Generating plan for user ${userId} (${name}, ${goal}, ${intensity})`);

    // Call Gemini models in parallel for rapid response
    const [workoutPlan, nutritionTip] = await Promise.all([
      generateWorkoutGemini(userInput),
      generateNutritionTipWithFlash(goal),
    ]);

    // Save to SQLite
    saveUser(userInput);
    savePlan(userId, workoutPlan, nutritionTip);

    res.json({
      message: 'Workout plan generated and saved successfully!',
      user_id: userId,
      username: name,
      age,
      weight,
      goal,
      intensity,
      workout_plan: workoutPlan,
      nutrition_tip: nutritionTip,
    });
  } catch (error: any) {
    console.error('[FitBuddy] Error generating workout:', error);
    res.status(500).json({ error: error.message || 'Something went wrong while generating the workout plan.' });
  }
};

app.post('/api/generate-plan', handleGenerateWorkout);
app.post('/generate-workout', handleGenerateWorkout); // Matches PDF route specification

// 2. Nutrition tip generator
app.get('/api/nutrition-tip', async (req: Request, res: Response) => {
  try {
    const goal = String(req.query.goal || 'General Fitness').trim();
    const tip = await generateNutritionTipWithFlash(goal);
    res.json({ goal, nutrition_tip: tip });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error generating nutrition tip' });
  }
});

// 3. Submit feedback & update plan
const handleUpdateFeedback = async (req: Request, res: Response) => {
  try {
    const userId = String(req.body.user_id || req.body.userId || '').trim();
    const feedback = String(req.body.feedback || req.body.user_feedback || '').trim();

    if (!userId || !feedback) {
      res.status(400).json({ error: 'Both user_id and feedback are required.' });
      return;
    }

    const originalPlan = getOriginalPlan(userId);
    if (!originalPlan) {
      res.status(404).json({ error: `Original plan not found for user ID: ${userId}` });
      return;
    }

    console.log(`[FitBuddy] Updating plan for user ${userId} with feedback: "${feedback}"`);

    const updatedPlan = await updateWorkoutPlan(originalPlan, feedback);
    updatePlan(userId, updatedPlan, feedback);

    const fullUser = getUser(userId);

    res.json({
      message: 'Your plan has been updated based on your feedback!',
      user_id: userId,
      user: fullUser,
      original_plan: originalPlan,
      updated_plan: updatedPlan,
      feedback,
    });
  } catch (error: any) {
    console.error('[FitBuddy] Error updating plan:', error);
    res.status(500).json({ error: error.message || 'Something went wrong while updating the workout plan.' });
  }
};

app.post('/api/update-plan', handleUpdateFeedback);
app.post('/submit-feedback', handleUpdateFeedback); // Matches PDF route specification

// 4. Admin View: Get all users & plans
const handleGetAllUsers = (_req: Request, res: Response) => {
  try {
    const users = getAllUsers();
    res.json({
      count: users.length,
      users,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch users.' });
  }
};

app.get('/api/users', handleGetAllUsers);
app.get('/api/view-all-users', handleGetAllUsers);
app.get('/view-all-users-data', handleGetAllUsers);

// 5. Get single user details
app.get('/api/users/:userId', (req: Request, res: Response) => {
  try {
    const user = getUser(req.params.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Delete user
app.delete('/api/users/:userId', (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    deleteUser(userId);
    res.json({ success: true, message: `User ${userId} deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Reset or seed samples
app.post('/api/seed-samples', (_req: Request, res: Response) => {
  seedDefaultSamplesIfEmpty();
  const users = getAllUsers();
  res.json({ success: true, count: users.length, users });
});

// --- Frontend Integration ---
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Mount Vite middlewares in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[FitBuddy Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
