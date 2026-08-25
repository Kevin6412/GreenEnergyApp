import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Interface representing a single scoreboard entry with environmental metrics
 */
export interface ScoreboardItem {
  id: number;
  town_name: string;
  green_score: number;
  gas: number;
  electricity?: number;
  recycle?: number;
}

/**
 * Complete state of the scoreboard including data and UI status
 */
export interface ScoreboardState {
  scoreData: ScoreboardItem[];
  greenScore: number;
  loading: boolean;
}

/**
 * Fetches scoreboard data from the database
 * Retrieves up to 100 scoreboard entries from Supabase
 * @returns {Promise<Object>} Database query result with scoreboard data or error
 * @returns {ScoreboardItem[]} [return.data] - Array of scoreboard entries if successful
 * @returns {any} [return.error] - Error object if query fails
 */
export async function getScoreboardData(): Promise<{ data: ScoreboardItem[] | null; error: any }> {
  return await supabase.from('scoreboard').select('*').limit(100);
}

/**
 * Calculates green score based on electricity and gas consumption
 * Uses exponential decay formula to penalize high resource usage
 * @param {ScoreboardItem} item - Scoreboard entry with consumption data
 * @returns {number} Calculated green score (0-100 scale)
 */
export function calculateGreenScore(item: ScoreboardItem): number {
  const electricity = item.electricity ?? 0;
  const gas = item.gas ?? 0;
  
  const elec_score = 100 / (1 + electricity / 410) ** 1.3;
  const gas_score = 100 / (1 + gas / 70) ** 1.0;
  
  return Number(((elec_score + gas_score) / 2).toFixed(1));
}

/**
 * Processes raw scoreboard data by filtering, calculating scores, and sorting
 * Removes incomplete records and applies green score calculation to all entries
 * @param {ScoreboardItem[] | null} data - Raw scoreboard data from database
 * @returns {ScoreboardItem[]} Processed and sorted scoreboard data
 */
export function processScoreboardData(data: ScoreboardItem[] | null): ScoreboardItem[] {
  if (!data) return [];

  // Filter out incomplete records
  const filteredData = data.filter(
    (item) => item != null && item.gas != null && item.electricity != null
  );

  // Calculate green scores
  filteredData.forEach((item) => {
    item.green_score = calculateGreenScore(item);
  });

  // Sort by green score in descending order
  return filteredData.sort((a, b) => b.green_score - a.green_score);
}

/**
 * Creates a real-time channel for scoreboard updates
 * Configures channel with broadcast settings for live data synchronization
 * @returns {RealtimeChannel} Configured Supabase real-time channel
 */
export function createScoreboardChannel(): RealtimeChannel {
  return supabase.channel('scoreboard', {
    config: { broadcast: { self: false }, private: true },
  });
}

/**
 * Subscribes to real-time scoreboard events on a channel
 * Sets up event handlers for INSERT, UPDATE, and DELETE operations
 * @param {RealtimeChannel} channel - The real-time channel to subscribe to
 * @param {Object} eventHandlers - Object containing event handler functions
 * @param {Function} eventHandlers.onInsert - Handler for new scoreboard entries
 * @param {Function} eventHandlers.onUpdate - Handler for updated scoreboard entries
 * @param {Function} eventHandlers.onDelete - Handler for deleted scoreboard entries
 * @returns {Promise<void>} Subscription promise that resolves when connected
 */
export function subscribeToChannel(
  channel: RealtimeChannel, 
  eventHandlers: {
    onInsert: (payload: any) => void;
    onUpdate: (payload: any) => void;
    onDelete: (payload: any) => void;
  }
): Promise<void> {
  channel.on('broadcast', { event: 'INSERT' }, eventHandlers.onInsert);
  channel.on('broadcast', { event: 'UPDATE' }, eventHandlers.onUpdate);
  channel.on('broadcast', { event: 'DELETE' }, eventHandlers.onDelete);

  return channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Subscribed to scoreboard channel');
    }
  });
}

/**
 * Removes and unsubscribes from a real-time channel
 * Cleans up channel resources and stops listening for updates
 * @param {RealtimeChannel} channel - The channel to remove
 */
export function removeChannel(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
