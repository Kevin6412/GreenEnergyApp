import { 
  ScoreboardItem, 
  getScoreboardData, 
  processScoreboardData,
  calculateGreenScore,
  createScoreboardChannel,
  subscribeToChannel,
  removeChannel
} from '@/app/model/scoreboard_model';

import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Controller responsible for managing scoreboard data loading,
 * processing, validation, real-time updates, and CRUD change handling.
 */
export class ScoreboardController {

  /**
   * Loads and processes scoreboard data from the database.
   *
   * @async
   * @returns {Promise<{success: boolean; data?: ScoreboardItem[]; error?: string}>}
   *  - `success`: Whether the load was successful  
   *  - `data`: Processed scoreboard results  
   *  - `error`: Error message on failure  
   */
  static async loadScoreboard(): Promise<{ 
    success: boolean; 
    data?: ScoreboardItem[]; 
    error?: string 
  }> {
    try {
      const { data, error } = await getScoreboardData();

      if (error) {
        return { success: false, error: `Failed to load scoreboard: ${error.message}` };
      }

      const processedData = processScoreboardData(data);
      return { success: true, data: processedData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Handles real-time **INSERT** events from Supabase.
   * Adds the new item, recalculates the green score, and re-sorts the list.
   *
   * @param {any} payload - Payload received from Supabase real-time event.
   * @param {ScoreboardItem[]} currentData - Current scoreboard state.
   * @returns {ScoreboardItem[]} - Updated scoreboard list.
   */
  static handleScoreboardInsert(
    payload: any, 
    currentData: ScoreboardItem[]
  ): ScoreboardItem[] {
    if (!payload.payload?.record) return currentData;
    
    const newRecord = payload.payload.record as ScoreboardItem;
    
    const filteredPrev = currentData.filter(
      (item) => item != null && item.gas != null && item.electricity != null
    );

    if (newRecord.gas != null && newRecord.electricity != null) {
      newRecord.green_score = calculateGreenScore(newRecord);
      const newData = [newRecord, ...filteredPrev];
      return newData.sort((a, b) => b.green_score - a.green_score);
    }

    return currentData;
  }

  /**
   * Handles real-time **UPDATE** events from Supabase.
   * Replaces the updated record, recalculates all green scores, and sorts.
   *
   * @param {any} payload - Payload received from Supabase real-time event.
   * @param {ScoreboardItem[]} currentData - Current scoreboard state.
   * @returns {ScoreboardItem[]} - Updated scoreboard list.
   */
  static handleScoreboardUpdate(
    payload: any, 
    currentData: ScoreboardItem[]
  ): ScoreboardItem[] {
    if (!payload.payload?.record) return currentData;
    
    const updatedRecord = payload.payload.record as ScoreboardItem;

    const filteredPrev = currentData.filter(
      (item) => item != null && item.gas != null && item.electricity != null
    );

    const updatedData = filteredPrev.map((item) =>
      item.id === updatedRecord.id ? updatedRecord : item
    );

    updatedData.forEach((item) => {
      if (item.gas != null && item.electricity != null) {
        item.green_score = calculateGreenScore(item);
      }
    });

    return updatedData
      .sort((a, b) => b.green_score - a.green_score)
      .filter((item) => item != null);
  }

  /**
   * Handles real-time **DELETE** events from Supabase.
   *
   * @param {any} payload - Payload received from Supabase real-time event.
   * @param {ScoreboardItem[]} currentData - Current scoreboard list.
   * @returns {ScoreboardItem[]} - Filtered list with deleted record removed.
   */
  static handleScoreboardDelete(
    payload: any, 
    currentData: ScoreboardItem[]
  ): ScoreboardItem[] {
    if (!payload.payload?.old_record) return currentData;
    
    const deletedRecord = payload.payload.old_record as ScoreboardItem;
    return currentData.filter((item) => item && item.id !== deletedRecord.id);
  }

  /**
   * Subscribes to Supabase real-time events for scoreboard changes.
   *
   * @async
   * @param {Object} eventHandlers - Object containing event callbacks.
   * @param {(payload: any) => void} eventHandlers.onInsert - Insert handler.
   * @param {(payload: any) => void} eventHandlers.onUpdate - Update handler.
   * @param {(payload: any) => void} eventHandlers.onDelete - Delete handler.
   * @returns {Promise<RealtimeChannel>} - The created Supabase realtime channel.
   */
  static async subscribeToRealtimeUpdates(
    eventHandlers: {
      onInsert: (payload: any) => void;
      onUpdate: (payload: any) => void;
      onDelete: (payload: any) => void;
    }
  ): Promise<RealtimeChannel> {
    const channel = createScoreboardChannel();
    await subscribeToChannel(channel, eventHandlers);
    return channel;
  }

  /**
   * Unsubscribes from Supabase real-time updates.
   *
   * @param {RealtimeChannel} channel - The channel to remove.
   */
  static unsubscribeFromRealtimeUpdates(channel: RealtimeChannel): void {
    removeChannel(channel);
  }

  /**
   * Validates that a scoreboard item contains all required fields.
   *
   * @param {ScoreboardItem} item - Scoreboard item to validate.
   * @returns {boolean} - True if valid, false if incomplete.
   */
  static validateScoreboardItem(item: ScoreboardItem): boolean {
    return item != null && item.gas != null && item.electricity != null;
  }
}
