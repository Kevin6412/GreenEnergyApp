import { supabase } from '@/lib/supabase';

/**
 * Interface representing a town with environmental metrics and geographical data
 * @interface TownItem
 */
export interface TownItem {
  /** Unique identifier for the town */
  id: number;
  /** Name of the town */
  town_name: string;
  /** Environmental green score (higher is better) */
  green_score: number;
  /** Gas consumption in liters */
  gas: number;
  /** Water consumption (optional) */
  water?: number;
  /** Electricity consumption in kWh (optional) */
  electricity?: number;
  /** Recycling amount in kg (optional) */
  recycle?: number;
  /** Array of vertex coordinates for polygon rendering [lat1, lng1, lat2, lng2, ...] */
  vertices?: number[];
}

/**
 * Interface representing geographic coordinates
 * @interface MapCoordinates
 */
export interface MapCoordinates {
  /** Latitude coordinate */
  latitude: number;
  /** Longitude coordinate */
  longitude: number;
}

/**
 * Interface representing polygon data for map rendering
 * @interface PolygonData
 */
export interface PolygonData {
  /** Array of coordinates defining the polygon shape */
  coordinates: MapCoordinates[];
  /** Fill color for the polygon in CSS format */
  fillColor: string;
  /** Stroke color for the polygon border in CSS format */
  strokeColor: string;
}

/**
 * Interface representing the state of the map component
 * @interface MapState
 */
export interface MapState {
  /** Array of town data items */
  townData: TownItem[];
  /** Currently selected town or null if none selected */
  selectedTown: TownItem | null;
  /** Loading state indicator */
  loading: boolean;
}

/**
 * Fetches town data from the Supabase database
 * 
 * @async
 * @function getTownData
 * @returns {Promise<{ data: TownItem[] | null; error: any }>} Object containing town data and any error
 * @throws {Error} When database query fails
 * 
 */
export async function getTownData(): Promise<{ data: TownItem[] | null; error: any }> {
  return await supabase.from('scoreboard').select('*').limit(100);
}

/**
 * Processes raw town data by filtering out null items
 * 
 * @function processTownData
 * @param {TownItem[] | null} data - Raw town data from database
 * @returns {TownItem[]} Filtered array of valid town items
 * 
 */
export function processTownData(data: TownItem[] | null): TownItem[] {
  return data?.filter((item) => item != null) || [];
}

/**
 * Generates polygon coordinates from town vertex data for map rendering
 * 
 * @function generateTownPolygons
 * @param {TownItem[]} townsData - Array of town items with vertex data
 * @returns {Record<number, MapCoordinates[]>} Object mapping town IDs to their polygon coordinates
 * 
 */
export function generateTownPolygons(townsData: TownItem[]): Record<number, MapCoordinates[]> {
  const polygons: Record<number, MapCoordinates[]> = {};

  townsData.forEach((town) => {
    let polygonArr: MapCoordinates[] = [];

    if (town != null && town.vertices != null) {
      for (let step = 0; step < town.vertices.length / 2; step++) {
        polygonArr.push({
          latitude: town.vertices[step * 2],
          longitude: town.vertices[step * 2 + 1],
        });
      }
      polygons[town.id] = polygonArr;
    }
  });

  return polygons;
}

/**
 * Generates a consistent color scheme for town polygons
 * 
 * @function generatePolygonColors
 * @param {TownItem[]} townData - Array of town items
 * @returns {Record<number, string>} Object mapping town IDs to their assigned colors
 * 
 */
export function generatePolygonColors(townData: TownItem[]): Record<number, string> {
  const colors = [
    'rgba(255, 99, 132, 0.4)', // Red
    'rgba(54, 162, 235, 0.4)', // Blue
    'rgba(255, 206, 86, 0.4)', // Yellow
    'rgba(75, 192, 192, 0.4)', // Teal
    'rgba(153, 102, 255, 0.4)', // Purple
    'rgba(255, 159, 64, 0.4)', // Orange
    'rgba(199, 199, 199, 0.4)', // Gray
    'rgba(83, 102, 255, 0.4)', // Indigo
    'rgba(40, 159, 64, 0.4)', // Green
    'rgba(210, 114, 225, 0.4)', // Pink
    'rgba(102, 159, 255, 0.4)', // Light Blue
    'rgba(255, 102, 159, 0.4)', // Light Red
    'rgba(159, 255, 102, 0.4)', // Light Green
    'rgba(255, 203, 102, 0.4)', // Light Orange
    'rgba(102, 255, 203, 0.4)', // Mint
    'rgba(203, 102, 255, 0.4)', // Lavender
    'rgba(255, 102, 203, 0.4)', // Hot Pink
    'rgba(102, 203, 255, 0.4)', // Sky Blue
    'rgba(203, 255, 102, 0.4)', // Lime
    'rgba(255, 153, 102, 0.4)', // Coral
  ];

  const polygonColors: Record<number, string> = {};
  townData.forEach((town, index) => {
    polygonColors[town.id] = colors[index % colors.length];
  });
  return polygonColors;
}

/**
 * Configuration object for map display settings
 * 
 * @constant {Object} MAP_CONFIG
 * @property {Object} initialRegion - Initial map viewport configuration
 * @property {number} initialRegion.latitude - Initial center latitude (Singapore)
 * @property {number} initialRegion.longitude - Initial center longitude (Singapore)
 * @property {number} initialRegion.latitudeDelta - Zoom level for latitude
 * @property {number} initialRegion.longitudeDelta - Zoom level for longitude
 * 
 */
export const MAP_CONFIG = {
  initialRegion: {
    latitude: 1.3521,
    longitude: 103.8198,
    latitudeDelta: 0.25,
    longitudeDelta: 0.25,
  },
} as const;
