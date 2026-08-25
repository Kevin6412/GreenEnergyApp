import { 
  TownItem, 
  MapCoordinates, 
  getTownData, 
  processTownData, 
  generateTownPolygons, 
  generatePolygonColors,
  MAP_CONFIG 
} from '@/app/model/map_model';

/**
 * Controller class for managing map-related operations including data loading,
 * polygon generation, and town statistics formatting.
 * 
 * @class MapController
 * @static
 */
export class MapController {
  /**
   * Loads town data from the database and processes it for map rendering.
   * 
   * @static
   * @async
   * @returns {Promise<{ success: boolean; data?: TownItem[]; error?: string }>} 
   *          Object containing success status, processed town data, and error message if any
   * @throws {Error} When an unexpected error occurs during data loading
   * 
   */
  static async loadTownData(): Promise<{ 
    success: boolean; 
    data?: TownItem[]; 
    error?: string 
  }> {
    try {
      const { data, error } = await getTownData();

      if (error) {
        return { success: false, error: `Failed to load town data: ${error.message}` };
      }

      const processedData = processTownData(data);
      return { success: true, data: processedData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generates polygon coordinates and colors for all towns in the dataset.
   * 
   * @static
   * @param {TownItem[]} townData - Array of town items with geographic data
   * @returns {{
   *   polygons: Record<number, MapCoordinates[]>;
   *   colors: Record<number, string>;
   * }} Object containing polygon coordinates and colors keyed by town ID
   * 
   */
  static generateMapPolygons(townData: TownItem[]): {
    polygons: Record<number, MapCoordinates[]>;
    colors: Record<number, string>;
  } {
    const polygons = generateTownPolygons(townData);
    const colors = generatePolygonColors(townData);
    
    return { polygons, colors };
  }

  /**
   * Validates if a town has sufficient polygon data for map rendering.
   * 
   * @static
   * @param {TownItem} town - The town item to validate
   * @param {Record<number, MapCoordinates[]>} polygons - Polygon data for all towns
   * @returns {boolean} True if the town has valid polygon vertices, false otherwise
   * 
   */
  static validateTownPolygon(town: TownItem, polygons: Record<number, MapCoordinates[]>): boolean {
    const vertices = polygons[town.id];
    return !!(vertices && vertices.length > 0);
  }

  /**
   * Generates a stroke color from a fill color by increasing opacity.
   * 
   * @static
   * @param {string} fillColor - The fill color in CSS format (e.g., 'rgba(255, 99, 132, 0.4)')
   * @returns {string} The stroke color with full opacity
   * 
   */
  static getStrokeColor(fillColor: string): string {
    return fillColor.replace('0.4', '1');
  }

  /**
   * Gets the initial map region configuration for centering the map view.
   * 
   * @static
   * @returns {Object} Initial map region configuration object
   * @property {number} latitude - Initial latitude coordinate
   * @property {number} longitude - Initial longitude coordinate
   * @property {number} latitudeDelta - Latitude delta for zoom level
   * @property {number} longitudeDelta - Longitude delta for zoom level
   * 
   */
  static getInitialRegion() {
    return MAP_CONFIG.initialRegion;
  }

  /**
   * Formats town statistics into a display-ready format with icons and labels.
   * 
   * @static
   * @param {TownItem | null} town - The town item to format statistics for, or null
   * @returns {Array<{
   *   icon: string;
   *   label: string;
   *   value: string;
   *   isGreenScore?: boolean;
   * }>} Array of formatted statistic objects for display
   * 
   */
  static formatTownStats(town: TownItem | null): Array<{
    icon: string;
    label: string;
    value: string;
    isGreenScore?: boolean;
  }> {
    if (!town) return [];

    const stats = [];

    if (town.electricity) {
      stats.push({
        icon: '⚡',
        label: 'Electricity',
        value: `${town.electricity} kWh`
      });
    }

    if (town.gas) {
      stats.push({
        icon: '⛽',
        label: 'Gas',
        value: `${town.gas} L`
      });
    }

    stats.push({
      icon: '🌱',
      label: 'Green Score',
      value: `${town.green_score} pts`,
      isGreenScore: true
    });

    return stats;
  }
}
