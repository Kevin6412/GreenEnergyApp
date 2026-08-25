import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Modal, Pressable, Platform } from 'react-native';
import { Text } from '@/views/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/views/ui/card';

import { useRouter } from 'expo-router';

import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

let MapContainer: any, TileLayer: any, LeafletPolygon: any, Popup: any;
const isBrowser = typeof window !== 'undefined';
if (isBrowser && Platform.OS === 'web') {
  const leaflet = require('react-leaflet');
  MapContainer = leaflet.MapContainer;
  TileLayer = leaflet.TileLayer;
  LeafletPolygon = leaflet.Polygon;
  Popup = leaflet.Popup;
  require('leaflet/dist/leaflet.css');
}

interface TownItem {
  id: number;
  town_name: string;
  green_score: number;
  gas: number;
  water?: number;
  electricity?: number;
  recycle?: number;
  vertices?: [];
}

export default function MapComponent() {
  const router = useRouter();
  const [selected, setSelected] = useState<TownItem | null>(null);
  const [showWebMap, setShowWebMap] = useState(false);
  const [townData, setTownData] = useState<TownItem[]>([]);

  async function fetchTown() {
    try {
      const { data, error } = await supabase.from('scoreboard').select('*').limit(100);

      if (error) {
        console.error('Fetch error:', error);
        return;
      }

      const filtered_data = data?.filter((item) => item != null) || [];
      setTownData(filtered_data as TownItem[]);
    } catch (error) {
      console.error('Error fetching scoreboard:', error);
    }
  }

  useEffect(() => {
    fetchTown();
    if (isBrowser && Platform.OS === 'web') {
      setShowWebMap(true);
    }
  }, []);

  // Function to generate polygon coordinates from vertices
  const generateTownPolygons = (townsData: TownItem[]) => {
    const polygons: Record<number, [number, number][]> = {};

    townsData.forEach((town) => {
      let polygonArr: [number, number][] = [];

      if (town != null && town.vertices != null) {
        for (let step = 0; step < town.vertices.length / 2; step++) {
          polygonArr.push([town.vertices[step * 2], town.vertices[step * 2 + 1]]);
        }
        polygons[town.id] = polygonArr;
      }
    });

    return polygons;
  };

  // Function to calculate center of polygon for popup
  const getPolygonCenter = (vertices: [number, number][]) => {
    if (!vertices || vertices.length === 0) return [1.3521, 103.8198];

    let sumLat = 0;
    let sumLng = 0;

    vertices.forEach((vertex) => {
      sumLat += vertex[0];
      sumLng += vertex[1];
    });

    return [sumLat / vertices.length, sumLng / vertices.length];
  };

  // Handle polygon click
  const handlePolygonClick = (town: TownItem) => {
    setSelected(town);
  };

  // Handle popup close
  const handlePopupClose = () => {
    setSelected(null);
  };

  if (showWebMap) {
    // Generate town polygons dynamically based on town coordinates
    const townPolygons = generateTownPolygons(townData);

    // Generate colors for all towns
    const generateColors = () => {
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
    };

    const polygonColors = generateColors();

    return (
      <View style={styles.webContainer}>
        <MapContainer
          center={[1.3521, 103.8198]}
          zoom={11}
          style={{ height: height * 0.7, width: width * 0.9, borderRadius: 12 }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {townData.map((town) => {
            const vertices = townPolygons[town.id];
            if (!vertices || vertices.length === 0) return null;

            return (
              <LeafletPolygon
                key={town.id}
                positions={vertices}
                pathOptions={{
                  color: polygonColors[town.id],
                  fillColor: polygonColors[town.id],
                  fillOpacity: 0.6,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => handlePolygonClick(town),
                }}
              />
            );
          })}
          {selected && (
            <Popup
              position={getPolygonCenter(townPolygons[selected.id])}
              onClose={handlePopupClose}>
              <div style={{ minWidth: 180 }}>
                <strong>{selected.town_name}</strong>
                <br />
                {selected.electricity && `⚡ Electricity: ${selected.electricity} kWh`}
                <br />
                {selected.gas && `⛽ Gas: ${selected.gas} L`}
                <br />
                🌱 Green Score: {selected.green_score} pts
                <br />
                <button style={{ marginTop: 8 }} onClick={handlePopupClose}>
                  Close
                </button>
              </div>
            </Popup>
          )}
        </MapContainer>

        <Pressable
          onPress={() => router.push('/menu')}
          style={{
            backgroundColor: '#FFA726',
            borderColor: '#FF4081',
            borderWidth: 4,
            paddingVertical: 14,
            paddingHorizontal: 40,
            borderRadius: 8,
            marginTop: 32,
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
          }}>
          <Text
            style={{
              fontFamily: 'PressStart2P',
              fontSize: 10,
              color: '#3B0A00',
              textAlign: 'center',
            }}>
            BACK TO HOME
          </Text>
        </Pressable>
      </View>
    );
  }

  // Fallback for SSR or if window is not defined
  if (Platform.OS === 'web' && !showWebMap) {
    return (
      <View style={styles.webContainer}>
        <Text className="mb-4 text-lg font-bold">Loading interactive map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.webContainer}>
      <Text className="mb-4 text-lg font-bold">
        Interactive polygons are not supported in the current web map. For full interactivity, use a
        library like react-google-maps/api or react-leaflet.
      </Text>

      <Pressable
        onPress={() => router.push('/menu')}
        style={{
          backgroundColor: '#FFA726',
          borderColor: '#FF4081',
          borderWidth: 4,
          paddingVertical: 14,
          paddingHorizontal: 40,
          borderRadius: 8,
          marginTop: 32,
          shadowColor: '#000',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
        }}>
        <Text
          style={{
            fontFamily: 'PressStart2P',
            fontSize: 10,
            color: '#3B0A00',
            textAlign: 'center',
          }}>
          BACK TO HOME
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  map: {
    width: width,
    height: height,
  },
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 24,
    width: '100%',
  },
});
