import { ParsedDayPlan } from '../types.ts';

/**
 * Parses markdown workout text into structured day objects
 */
export function parseWorkoutPlanText(planText: string): ParsedDayPlan[] {
  if (!planText) return [];

  const days: ParsedDayPlan[] = [];
  // Split by "Day 1", "Day 2", "### Day 1", "**Day 1", etc.
  const dayRegex = /(?:^|\n)(?:###?\s*|\*\*)?Day\s*(\d+)[:\s–—-]+([^\n*]+)(?:\*\*)?/gi;

  const matches: { dayNum: number; title: string; startIndex: number }[] = [];
  let match: RegExpExecArray | null;

  while ((match = dayRegex.exec(planText)) !== null) {
    matches.push({
      dayNum: parseInt(match[1], 10),
      title: match[2]?.trim() || `Day ${match[1]} Workout`,
      startIndex: match.index,
    });
  }

  if (matches.length === 0) {
    // Fallback if formatting doesn't have strict "Day X"
    return [
      {
        dayNumber: 1,
        title: 'Full 7-Day Plan',
        warmup: ['5-10 minutes dynamic warm-up'],
        exercises: [],
        cooldown: ['5 minutes static stretching'],
        rawText: planText,
      },
    ];
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextStart = matches[i + 1] ? matches[i + 1].startIndex : planText.length;
    const dayContent = planText.substring(current.startIndex, nextStart).trim();

    const warmup: string[] = [];
    const exercises: { name: string; setsReps: string; notes?: string }[] = [];
    const cooldown: string[] = [];

    const lines = dayContent.split('\n');
    let section: 'header' | 'warmup' | 'workout' | 'cooldown' | 'other' = 'header';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const lower = line.toLowerCase();

      if (lower.includes('warm-up') || lower.includes('warm up')) {
        section = 'warmup';
        const content = line.replace(/^[#*-\s]*warm-?up[:\s(0-9min)]*/i, '').trim();
        if (content) warmup.push(content);
        continue;
      } else if (lower.includes('main workout') || lower.includes('workout:') || lower.includes('exercises:')) {
        section = 'workout';
        continue;
      } else if (lower.includes('cooldown') || lower.includes('cool down') || lower.includes('recovery:')) {
        section = 'cooldown';
        const content = line.replace(/^[#*-\s]*cool-?down[:\s]*/i, '').trim();
        if (content) cooldown.push(content);
        continue;
      }

      if (section === 'warmup') {
        const clean = line.replace(/^[*-•\d.]+\s*/, '').trim();
        if (clean && !clean.startsWith('#')) warmup.push(clean);
      } else if (section === 'cooldown') {
        const clean = line.replace(/^[*-•\d.]+\s*/, '').trim();
        if (clean && !clean.startsWith('#')) cooldown.push(clean);
      } else if (section === 'workout') {
        const clean = line.replace(/^[*-•\d.]+\s*/, '').trim();
        if (clean && !clean.startsWith('#')) {
          // Parse exercise and sets/reps: "Bench Press: 4 sets of 8-10 reps (90s rest)"
          const colonIdx = clean.indexOf(':');
          if (colonIdx > 0) {
            const name = clean.substring(0, colonIdx).replace(/\*\*/g, '').trim();
            const details = clean.substring(colonIdx + 1).replace(/\*\*/g, '').trim();
            exercises.push({
              name,
              setsReps: details,
            });
          } else {
            exercises.push({
              name: clean.replace(/\*\*/g, ''),
              setsReps: 'As prescribed',
            });
          }
        }
      }
    }

    days.push({
      dayNumber: current.dayNum,
      title: current.title.replace(/\*\*/g, '').trim(),
      warmup: warmup.length ? warmup : ['5-10 mins mobility exercises and light cardio.'],
      exercises: exercises.length ? exercises : [{ name: 'Rest / Active Recovery Routine', setsReps: '30-45 mins light activity' }],
      cooldown: cooldown.length ? cooldown : ['5 mins static stretching and deep breathing.'],
      rawText: dayContent,
    });
  }

  return days;
}
