import { signInModel, signUpModel, createUserProfile, SignInCredentials, SignUpCredentials } from '@/app/model/authentication_model';

/**
 * Authentication Controller handling user authentication business logic
 * Provides static methods for user sign-in, sign-up, and validation
 */
export class AuthController {

  /**
   * Validates user sign-up data for completeness and format requirements
   * @param {SignUpCredentials} signUpData - User registration data containing NRIC, username, password, and town
   * @returns {Object} Validation result with success status and optional error message
   * @returns {boolean} return.isValid - Whether the sign-up data is valid
   * @returns {string} [return.error] - Error message if validation fails
   */
  static validateSignUp(signUpData: SignUpCredentials): { isValid: boolean; error?: string } {
    // Check all fields are present
    if (!signUpData.nric || !signUpData.username || !signUpData.password || !signUpData.town) {
      return { isValid: false, error: 'Please enter NRIC, username, password and select a town' };
    }

    // Validate NRIC format
    const nricRegex = /^[STFGstfg]\d{7}[A-Za-z]$/;
    if (!nricRegex.test(signUpData.nric)) {
      return { isValid: false, error: 'Please enter a valid NRIC format (e.g., S1234567A)' };
    }

    // Validate username length
    if (signUpData.username.length < 3) {
      return { isValid: false, error: 'Username must be at least 3 characters long' };
    }

    // Validate password length
    if (signUpData.password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters long' };
    }

    return { isValid: true };
  }

  /**
   * Authenticates a user with provided credentials
   * @param {SignInCredentials} credentials - User login credentials containing NRIC and password
   * @returns {Promise<Object>} Authentication result with success status and optional user data or error
   * @returns {boolean} return.success - Whether authentication was successful
   * @returns {string} [return.error] - Error message if authentication fails
   * @returns {Object} [return.user] - Authenticated user data if successful
   */
  static async signIn(credentials: SignInCredentials): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      const { data, error } = await signInModel(credentials);

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true, user: data.user };
      }

      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Registers a new user with the provided sign-up data
   * Performs validation, creates authentication record, and sets up user profile
   * @param {SignUpCredentials} signUpData - Complete user registration data
   * @returns {Promise<Object>} Registration result with success status and optional error message
   * @returns {boolean} return.success - Whether registration was successful
   * @returns {string} [return.error] - Error message if registration fails
   */
  static async signUp(signUpData: SignUpCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate input
      const validation = this.validateSignUp(signUpData);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Sign up user
      const { data, error } = await signUpModel(signUpData);

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('Creating user profile', data.user);
        // Create user profile
        await createUserProfile(
          data.user.id,
          signUpData.nric.toUpperCase(),
          signUpData.username,
          signUpData.town
        );

        return { success: true };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
