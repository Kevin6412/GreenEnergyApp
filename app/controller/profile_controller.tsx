import { fetchUserBadge } from '@/app/model/profile_model'

import {
  Alert,
} from 'react-native';

/**
 * Retrieves all badges associated with a user by their NRIC
 * 
 * @async
 * @static
 * @param {string} nric - The National Registration Identity Card number to fetch badges for
 * @returns {Promise<Object>} Result object containing operation status and data
 * @returns {boolean} return.success - Whether the operation was successful
 * @returns {Array|null} [return.badges] - Array of badge objects if successful, empty array if no badges found
 * @returns {string} [return.error] - Error message if operation failed
 */

export class ProfileController {

    static async GetUserBadges(nric) {
        try {
            const { data: userData, error: authError } = await fetchUserBadge(nric);
            if (authError) {
                console.error('Database error:', authError);
                return { success: false, error: 'Cannot fetch user badges from database' };
            }

            if (!userData) {
                return { success: true, badges: [] }; // No badges found
            }

            return { success: true, badges: userData };

        } catch (e) {
            console.error('Unexpected error in GetUserBadges:', e.message);
            return { success: false, error: `Failed to get user badges: ${e.message}` };
        }
    }
}
