import { supabase } from '@/lib/supabase';
import withTimeout from '@/lib/timeout';

/**
 * Represents a single quiz challenge question.
 */
export interface ChallengeQuestion {
  id: number;
  question_desc: string;
  optionA: string;
  optionB: string;
  optionC: string;
  answer: string;
  points: number;
}

/**
 * Represents a user's challenge-related profile information.
 */
export interface UserProfile {
  id: string;
  green_score: number;
  quiz_answers: Record<number, string | null>;
}

/**
 * Global challenge state structure for UI/controllers.
 */
export interface ChallengeState {
  questions: ChallengeQuestion[];
  selectedAnswers: Record<number, string | null>;
  greenScore: number;
  user: any;
}


/**
 * Fetch up to 5 challenge questions from the database.
 */
export async function getChallengeQuestions(): Promise<{
  data: ChallengeQuestion[] | null;
  error: any | null;
}> {
  return await withTimeout(
    supabase.from('challenges').select('*').limit(5),
    5000
  );
}

/**
 * Fetch the currently authenticated user from Supabase Auth.
 */
export async function getCurrentUser(): Promise<{
  data: { user: any } | null;
  error: any | null;
}> {
  return await withTimeout(
    supabase.auth.getUser(),
    5000
  );
}

/**
 * Retrieve a user's stored challenge profile (green score + quiz answers).
 */
export async function getUserProfile(userId: string): Promise<{
  data: UserProfile | null;
  error: any | null;
}> {
  return await withTimeout(
    supabase
      .from('userprofile')
      .select('green_score, quiz_answers')
      .eq('id', userId)
      .single(),
    5000
  );
}

/**
 * Update a user profile with new quiz answers and optional score changes.
 */
export async function updateUserProfile(
  userId: string,
  updateData: {
    quiz_answers: Record<number, string | null>;
    green_score?: number;
  }
): Promise<{ error: any | null }> {
  return await withTimeout(
    supabase.from('userprofile').update(updateData).eq('id', userId),
    5000
  );
}


/**
 * Calculate how much time is left until the next Sunday at 23:59.
 *
 * @returns A human-readable countdown string.
 *
 * Example:
 *   "2 days 5 hours left"
 */
export function calculateTimeLeft(): string {
  const now = new Date();
  const nextSunday = new Date();

  // determine days until Sunday (0=Sunday)
  const day = now.getDay();
  const daysUntilSunday = (7 - day) % 7;

  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(23, 59, 0, 0);

  // if already past this week's Sunday cutoff, move to next week's
  if (nextSunday.getTime() < now.getTime()) {
    nextSunday.setDate(nextSunday.getDate() + 7);
  }

  const diffMs = nextSunday.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);

  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${
    diffHours !== 1 ? 's' : ''
  } left`;
}
