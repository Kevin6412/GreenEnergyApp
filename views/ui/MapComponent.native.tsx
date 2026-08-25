import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { Text } from '@/views/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/views/ui/card';
import { styles } from '@/app/styles/map_style';
import { useRouter } from 'expo-router';
import { MapController } from '@/app/controller/map_controller';
import { TownItem } from '@/app/model/map_model';

export default function MapComponent() {
  const router = useRouter();
  const [selected, setSelected] = useState<TownItem | null>(null);
  const [townData, setTownData] = useState<TownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapComponents, setMapComponents] = useState<{
    MapView: any;
    Marker: any;
    Polygon: any;
  } | null>(null);

  // Load town data using controller
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await MapController.loadTownData();
        if (result.success && result.data) {
          setTownData(result.data);
        } else {
          console.error('Error loading town data:', result.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Load native map components
    if (Platform.OS !== 'web') {
      const { default: MapView, Marker, Polygon } = require('react-native-maps');
      setMapComponents({ MapView, Marker, Polygon });
    }
  }, []);

  // Handle polygon click
  const handlePolygonClick = (town: TownItem) => {
    setSelected(town);
  };

  // Handle popup close
  const handlePopupClose = () => {
    setSelected(null);
  };

  // Generate polygon data using controller
  const getPolygonData = () => {
    return MapController.generateMapPolygons(townData);
  };

  // Get formatted town stats using controller
  const getTownStats = () => {
    return MapController.formatTownStats(selected);
  };

  // Show loading while map components are loading
  if (Platform.OS !== 'web' && !mapComponents && loading) {
    return (
      <View style={styles.container}>
        <Text>Loading map...</Text>
      </View>
    );
  }

  // Native app (iOS/Android)
  if (Platform.OS !== 'web' && mapComponents) {
    const { MapView, Polygon } = mapComponents;
    const { polygons, colors } = getPolygonData();
    const townStats = getTownStats();

    return (
      <View style={styles.container}>
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
            zIndex: 1000,
            position: 'absolute',
            top: 50,
            alignSelf: 'center',
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

        <MapView
          style={styles.map}
          initialRegion={MapController.getInitialRegion()}>
          {townData.map((town) => {
            const vertices = polygons[town.id];
            if (!vertices || vertices.length === 0) return null;

            return (
              <Polygon
                key={town.id}
                coordinates={vertices}
                fillColor={colors[town.id]}
                strokeColor={MapController.getStrokeColor(colors[town.id])}
                strokeWidth={2}
                tappable={true}
                onPress={() => handlePolygonClick(town)}
              />
            );
          })}
        </MapView>

        <Modal
          visible={!!selected}
          animationType="slide"
          transparent={true}
          onRequestClose={handlePopupClose}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCardWrapper}>
              <Card style={styles.modalCard}>
                <CardHeader style={styles.cardHeader}>
                  <CardTitle style={styles.cardTitle}>{selected?.town_name}</CardTitle>
                  <Pressable onPress={handlePopupClose} style={styles.closeIcon}>
                    <Text style={styles.closeIconText}>×</Text>
                  </Pressable>
                </CardHeader>
                <CardContent style={styles.cardContent}>
                  <View style={styles.statsContainer}>
                    {townStats.map((stat, index) => (
                      <View 
                        key={index} 
                        style={[
                          styles.statRow,
                          stat.isGreenScore && styles.greenScoreRow
                        ]}>
                        <View style={styles.iconTextContainer}>
                          <Text style={styles.icon}>{stat.icon}</Text>
                          <Text style={
                            stat.isGreenScore ? styles.greenScoreLabel : styles.label
                          }>
                            {stat.label}
                          </Text>
                        </View>
                        <Text style={
                          stat.isGreenScore ? styles.greenScoreValue : styles.value
                        }>
                          {stat.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                  
                  <Pressable 
                    style={styles.closeButton} 
                    onPress={handlePopupClose}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </Pressable>
                </CardContent>
              </Card>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Web app fallback
  return (
    <View style={styles.container}>
      <Text className="mb-4 text-lg font-bold">Map not supported on this platform</Text>
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
