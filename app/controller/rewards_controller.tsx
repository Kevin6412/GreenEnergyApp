import { 
  GetRewardList,
  updateUserRewards, 
  Reward, 
  UserProfile 
} from '@/app/model/reward_model';

export interface RewardsState {
  loading: boolean;
  rewards: Reward[];
  claimedRewards: number[];
  userScore: number;
}

/**
 * Controller responsible for loading rewards, validating redemption,
 * and updating user reward-related data.
 */
export class RewardsController {

  /**
   * Loads all available rewards and determines which rewards
   * the user has already claimed.
   *
   * @async
   * @param {UserProfile | null} profile - The user's profile information.
   * @returns {Promise<{
   *   success: boolean,
   *   data?: {
   *     rewards: Reward[],
   *     claimedRewards: number[],
   *     userScore: number
   *   },
   *   error?: string
   * }>}
   * - `success`: Whether loading was successful  
   * - `data.rewards`: All rewards fetched from the database  
   * - `data.claimedRewards`: IDs of rewards the user already claimed  
   * - `data.userScore`: The user's green score  
   * - `error`: Error message on failure  
   */
  static async loadRewardsData(profile: UserProfile | null): Promise<{
    success: boolean;
    data?: {
      rewards: Reward[];
      claimedRewards: number[];
      userScore: number;
    };
    error?: string;
  }> {
    try {
      const userScore = profile?.green_score || 0;

      const { data: rewardsData, error: rewardsErr } = await GetRewardList();

      if (rewardsErr) {
        throw new Error(`Failed to load rewards: ${rewardsErr.message}`);
      }

      const claimedRewards = profile
        ? rewardsData
            .filter(reward => profile.rewards.includes(reward.id))
            .map(reward => reward.id)
        : [];

      return {
        success: true,
        data: {
          rewards: rewardsData || [],
          claimedRewards,
          userScore,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Redeems a reward for the user, updating their score and claimed rewards list.
   *
   * @async
   * @param {Reward} reward - The reward the user is attempting to redeem.
   * @param {UserProfile} profile - The user's current profile state.
   * @returns {Promise<{
   *   success: boolean,
   *   newScore?: number,
   *   updatedRewards?: number[],
   *   error?: string
   * }>}
   * - `success`: Whether redemption was successful  
   * - `newScore`: New score after redemption  
   * - `updatedRewards`: Updated list of claimed reward IDs  
   * - `error`: Error message on failure  
   */
  static async redeemReward(
    reward: Reward,
    profile: UserProfile
  ): Promise<{
    success: boolean;
    newScore?: number;
    updatedRewards?: number[];
    error?: string;
  }> {
    try {
      // Validation: insufficient score
      if (profile.green_score < reward.points_required) {
        return {
          success: false,
          error: `You need at least ${reward.points_required} points to redeem this reward.`,
        };
      }

      if (!profile) {
        return {
          success: false,
          error: 'Profile not found. Please try restarting the app.',
        };
      }

      const newScore = profile.green_score - reward.points_required;
      const updatedRewards = [...profile.rewards, reward.id];

      const { error: userErr } = await updateUserRewards(
        profile.nric,
        newScore,
        updatedRewards
      );

      if (userErr) {
        throw new Error(`Failed to update user profile: ${userErr.message}`);
      }

      return {
        success: true,
        newScore,
        updatedRewards,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validates whether a user is eligible to redeem a specific reward.
   *
   * @param {number} userScore - The user's current green score.
   * @param {Reward} reward - The reward the user wishes to redeem.
   * @param {UserProfile | null} profile - The user's profile.
   * @returns {{ isValid: boolean; error?: string }}
   * - `isValid`: Whether redemption is allowed  
   * - `error`: Explanation if redemption is invalid  
   */
  static validateRewardRedemption(
    userScore: number,
    reward: Reward,
    profile: UserProfile | null
  ): { isValid: boolean; error?: string } {
    if (!profile) {
      return { isValid: false, error: 'Profile not found' };
    }

    if (userScore < reward.points_required) {
      return {
        isValid: false,
        error: `You need at least ${reward.points_required} points to redeem this reward.`,
      };
    }

    if (profile.rewards.includes(reward.id)) {
      return {
        isValid: false,
        error: 'You have already claimed this reward.',
      };
    }

    return { isValid: true };
  }
}
