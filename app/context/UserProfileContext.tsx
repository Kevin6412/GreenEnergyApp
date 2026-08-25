/**
 * User context and provider for managing authenticated Supabase user data,
 * profile fetching, badge checking, and town ranking logic inside a React Native app.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import withTimeout from '@/lib/timeout';

/**
 * @typedef {Object} UserProfile
 * @property {string} id - UUID of the user (matches Supabase auth user.id).
 * @property {string} nric - NRIC identifier used for login.
 * @property {number} green_score - User's current green score.
 * @property {string} username - Display name.
 * @property {string} town - User's selected town.
 * @property {string} rewards - Serialized rewards data.
 * @property {Object.<number, string|null>} [quiz_answers] - Map of quiz question IDs to answers.
 * @property {number} town_ranking - Computed leaderboard ranking for user's town.
 */

/**
 * @typedef {Object} UserContextType
 * @property {any|null} user - Supabase auth user object or null if logged out.
 * @property {UserProfile|null} profile - Loaded user profile object.
 * @property {boolean} loading - Indicates whether initial or profile loading is ongoing.
 * @property {() => Promise<void>} refreshProfile - Forces reloading the profile from Supabase.
 */

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * Provides user and profile state to the entire app.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - React children nodes.
 */
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // NOTE: Auth state change logic is commented out.
  // It can be re-enabled when needed.
  useEffect(() => {
    // Placeholder for session restoration on app start
  }, []);

  /**
   * Calls backend Flask API to evaluate whether new badges should be awarded.
   *
   * @async
   * @param {UserProfile} data - The user profile data required for badge checks.
   * @returns {Promise<boolean>} - Always returns true (badge check is non-blocking).
   */
  const checkBadgesAchieved = async (data) => {
    try {
      const checkResp = await fetch('http://localhost:8080/api/check-badges', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            nric: data.nric,
            green_score: data.green_score,
            rewards: data.rewards
          }
        }),
      });

      // Ignore failures - badge checks are non-critical
      if (checkResp.status !== 200) return true;
    } catch (error) {
      console.error('failed to check badges : ', error);
      return true;
    }

    return true;
  };

  /**
   * Loads the user profile from Supabase and computes the town ranking.
   *
   * @async
   * @param {string} userId - The Supabase user ID.
   */
  const loadUserProfile = async (userId: string) => {
    try {
      /** @type {{data: UserProfile, error: any}} */
      const { data, error } = await supabase
        .from('userprofile')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      console.log('Profile loaded:', data);

      // Run badge evaluation (timeout protected)
      await withTimeout(checkBadgesAchieved(data), 2000);

      // Compute ranking before storing profile
      const curTownRanking = await getTownRanking();
      setProfile({ ...data, town_ranking: curTownRanking });
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  /**
   * Re-fetches the current logged-in user's profile.
   *
   * @async
   * @returns {Promise<void>}
   */
  const refreshProfile = async () => {
    if (user != null) {
      console.log('Refreshing profile for user:', user.id);
      await loadUserProfile(user.id);
    }
  };

  /**
   * Computes leaderboards and returns the ranking for the user's town.
   *
   * @async
   * @returns {Promise<number>} - The ranking (1-based) or -1 on error.
   */
  async function getTownRanking() {
    try {
      if (!profile) return -1;

      const { data, error } = await supabase
        .from('scoreboard')
        .select('*')
        .limit(100);

      if (error) return -1;

      const cleaned = (data || [])
        .filter((item) => item && item.gas != null && item.electricity != null)
        .sort((a, b) => b.green_score - a.green_score);

      const index = cleaned.findIndex((x) => x.town_name === profile.town);
      return index >= 0 ? index + 1 : -1;
    } catch (e) {
      console.error(e);
      return -1;
    }
  }

  /**
   * Sets the Supabase auth user and loads the profile.
   *
   * @async
   * @param {any} profUser - The authenticated Supabase user object.
   */
  const setUserData = async (profUser) => {
    if (profUser != null) {
      setUser(profUser);
      await loadUserProfile(profUser.id);
    }
  };

  /**
   * Creates a new row inside the `userprofile` table for a new user.
   *
   * @async
   * @param {string} userId - Supabase user ID.
   * @param {string} nric - User NRIC.
   * @param {string} username - User display name.
   * @param {string} town - User-selected town.
   * @throws Will throw an error if Supabase insert fails.
   */
  const createUserProfile = async (
    userId: string,
    nric: string,
    username: string,
    town: string
  ) => {
    try {
      const { error } = await supabase.from('userprofile').insert([
        {
          id: userId,
          nric,
          username,
          email: `${nric.toLowerCase()}@nric.user`,
          town,
          green_score: 0,
          rewards: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      } else {
        console.log('Profile created successfully for user:', userId);
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  };

  const value: UserContextType = {
    user,
    profile,
    loading,
    setUserData,
    refreshProfile,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to consume the UserContext.
 *
 * @returns {UserContextType}
 * @throws {Error} If used outside a <UserProvider />.
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  useEffect(() => {
    if (context.user) {
      context.refreshProfile();
    }
  }, []);

  return context;
}
