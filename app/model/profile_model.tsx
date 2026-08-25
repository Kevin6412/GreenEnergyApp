
import { supabase } from '@/lib/supabase';
/**
 * Fetches badge information for a user by their NRIC
 * 
 * @async
 * @function fetchUserBadge
 * @param {string} nric - The National Registration Identity Card number to search for
 * @returns {Promise<Object>} A promise that resolves to a Supabase query result object
 * @returns {Array|null} [return.data] - Array of badge objects if found, null otherwise
 * @returns {Object|null} [return.error] - Error object if query fails, null otherwise
 * 
 *
**/
export async function fetchUserBadge(nric : string){
    return await supabase.from('badges')
                    .select('*') 
                    .ilike('nric', nric);

}

