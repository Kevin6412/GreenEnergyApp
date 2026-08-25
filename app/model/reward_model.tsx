import { supabase } from '@/lib/supabase';

/**
 * Represents a reward that can be redeemed by users.
 */
export interface Reward {
  id: number;
  reward_name: string;
  available: boolean;
  points_required: number;
}

/**
 * Represents a user's reward-related profile information.
 */
export interface UserProfile {
  nric: string;
  green_score: number;
  rewards: number[]; // reward IDs the user has claimed
}


/**
 * Retrieve all rewards from the database.
 */
export async function GetRewardList(): Promise<{
  data: Reward[] | null;
  error: any | null;
}> {
  return await supabase
    .from('rewards')
    .select('*')
    .order('id', { ascending: true });
}

/**
 * Update a user's score and claimed rewards.
 */
export async function updateUserRewards(
  nric: string,
  newScore: number,
  rewards: number[]
): Promise<{ error: any | null }> {
  return await supabase
    .from('userprofile')
    .update({
      green_score: newScore,
      rewards: rewards,
    })
    .eq('nric', nric);
}

/**
 * Update whether a reward is currently available for redemption.
 */
export async function updateRewardAvailability(
  rewardId: number,
  available: boolean
): Promise<{ error: any | null }> {
  return await supabase
    .from('rewards')
    .update({ available })
    .eq('id', rewardId);
}
