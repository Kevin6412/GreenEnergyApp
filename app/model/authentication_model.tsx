import { supabase } from '@/lib/supabase';

/**
 * User credentials for authentication sign-in
 */
export interface SignInCredentials {
  nric: string;
  password: string;
}

/**
 * User data required for account registration
 */
export interface SignUpCredentials {
  nric: string;
  username: string;
  password: string;
  town: string;
}

/**
 * Authenticates a user with NRIC and password
 * Converts NRIC to email format for Supabase authentication
 * @param {SignInCredentials} credentials - User login credentials
 * @returns {Promise<Object>} Authentication response from Supabase
 * @throws {Error} When authentication fails
 */
async function signInModel(credentials: SignInCredentials) {
  console.log(credentials);
  return await supabase.auth.signInWithPassword({
    email: `${credentials.nric}@nric.user`,
    password: credentials.password,
  });
}

/**
 * Registers a new user account with Supabase Auth
 * Creates authentication record with user metadata
 * @param {SignUpCredentials} signUpData - Complete user registration data
 * @returns {Promise<Object>} Registration response from Supabase
 * @throws {Error} When registration fails
 */
async function signUpModel(signUpData: SignUpCredentials) {
  return await supabase.auth.signUp({
    email: `${signUpData.nric.toLowerCase()}@nric.user`,
    password: signUpData.password,
    options: {
      data: {
        nric: signUpData.nric.toUpperCase(),
        username: signUpData.username,
        user_type: 'resident',
        town: signUpData.town,
      },
    },
  });
}

/**
 * Creates a user profile record in the database
 * Initializes user with default values and empty rewards
 * @param {string} userId - Unique identifier from Supabase Auth
 * @param {string} nric - User's NRIC (uppercase)
 * @param {string} username - User's chosen username
 * @param {string} town - User's selected town
 * @returns {Promise<Object>} Database insertion result
 * @throws {Error} When profile creation fails
 */
async function createUserProfile(userId: string, nric: string, username: string, town: string) {
  return await supabase.from('userprofile').insert([
    {
      id: userId,
      nric: nric,
      username: username,
      email: `${nric.toLowerCase()}@nric.user`,
      town: town,
      water_consumption: 0.0,
      electricity_usage: 0.0,
      recycling_rate: 0.0,
      green_score: 0,
      resident_contribution: 0.0,
      ranking: 0,
      rewards: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
}

export { signInModel, signUpModel, createUserProfile };
