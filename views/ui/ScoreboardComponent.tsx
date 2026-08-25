import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/views/ui/text';
import { useState, useEffect } from 'react';
import { ScoreboardController } from '@/app/controller/scoreboard_controller';
import { ScoreboardItem } from '@/app/model/scoreboard_model';
import { useUser } from '@/app/context/UserProfileContext';
import Loading from '@/views/ui/LoadingComponent';

import { styles } from '@/app/styles/scoreboard_style';

// Define sorting types
type SortType = 'green_score' | 'electricity' | 'gas';

export default function ScoreboardComponent() {
  const router = useRouter();
  const { profile } = useUser();
  
  // State management
  const [scoreData, setScoreData] = useState<ScoreboardItem[]>([]);
  const [sortedData, setSortedData] = useState<ScoreboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<SortType>('green_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load scoreboard data using controller
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await ScoreboardController.loadScoreboard();
        if (result.success && result.data) {
          setScoreData(result.data);
        } else {
          console.error('Error loading scoreboard:', result.error);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sort data when activeTab, sortDirection, or scoreData changes
  useEffect(() => {
    if (scoreData.length === 0) {
      setSortedData([]);
      return;
    }

    const sorted = [...scoreData].sort((a, b) => {
      let aValue = 0;
      let bValue = 0;

      switch (activeTab) {
        case 'green_score':
          aValue = a.green_score || 0;
          bValue = b.green_score || 0;
          break;
        case 'electricity':
          aValue = a.electricity || 0;
          bValue = b.electricity || 0;
          break;
        case 'gas':
          aValue = a.gas || 0;
          bValue = b.gas || 0;
          break;
      }

      if (sortDirection === 'desc') {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });

    setSortedData(sorted);
  }, [scoreData, activeTab, sortDirection]);

  // Find current town data from sortedData
  const currentTownData = sortedData.find((item) => item.town_name === profile?.town);

  // Get current town's rank
  const currentTownRank = currentTownData
    ? sortedData.findIndex((item) => item.town_name === profile?.town) + 1
    : null;

  // Get rank badge color and icon
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return { color: '#FFD700', icon: '🥇' };
      case 2:
        return { color: '#C0C0C0', icon: '🥈' };
      case 3:
        return { color: '#CD7F32', icon: '🥉' };
      default:
        return { color: '#6A0DAD', icon: `${rank}` };
    }
  };

  // Handle tab press
  const handleTabPress = (tab: SortType) => {
    if (activeTab === tab) {
      // Toggle sort direction if same tab is pressed
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      // Switch to new tab with default sort direction
      setActiveTab(tab);
      // Set default sort direction based on metric
      setSortDirection(tab === 'green_score' ? 'desc' : 'asc');
    }
  };

  // Get display name for tabs
  const getTabDisplayName = (tab: SortType) => {
    switch (tab) {
      case 'green_score': return 'GREEN SCORE';
      case 'electricity': return 'ELECTRICITY';
      case 'gas': return 'GAS';
    }
  };

  // Get sort indicator
  const getSortIndicator = (tab: SortType) => {
    if (activeTab !== tab) return '';
    return sortDirection === 'desc' ? ' ↓' : ' ↑';
  };

  // Get value display for current metric
  const getMetricValue = (item: ScoreboardItem) => {
    switch (activeTab) {
      case 'green_score':
        return `♻️ ${item.green_score || 0}`;
      case 'electricity':
        return `⚡ ${item.electricity || 0}`;
      case 'gas':
        return `⛽ ${item.gas || 0}`;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>SCOREBOARD</Text>
        <Text style={styles.subtitle}></Text>

        <View style={styles.tabsContainer}>
          {(['green_score', 'electricity', 'gas'] as SortType[]).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
              onPress={() => handleTabPress(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {getTabDisplayName(tab)}{getSortIndicator(tab)}
              </Text>
            </Pressable>
          ))}
        </View>

        {profile?.town && currentTownData && (
          <View style={styles.floatingPanel}>
            <Text style={styles.floatingPanelTitle}>YOUR TOWN</Text>
            <View style={styles.floatingPanelContent}>
              <View style={styles.townInfo}>
                <Text style={styles.townName}>{profile.town}</Text>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: getRankStyle(currentTownRank!).color },
                  ]}>
                  <Text style={styles.rankBadgeText}>#{currentTownRank}</Text>
                </View>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statText}>{getMetricValue(currentTownData)}</Text>
                <Text style={styles.statText}>♻️ {currentTownData.green_score || 0}</Text>
                <Text style={styles.statText}>⚡ {currentTownData.electricity || 0}</Text>
                <Text style={styles.statText}>⛽ {currentTownData.gas || 0}</Text>
              </View>
            </View>
          </View>
        )}

        {sortedData.length === 0 ? (
          <View style={[styles.leaderboardCard, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
            <Text style={[styles.noDataText, { color: 'white' }]}>
              No scores yet!{'\n'}Be the first on the leaderboard
            </Text>
          </View>
        ) : (
          <View style={styles.leaderboardCard}>
            <Text style={styles.leaderboardTitle}>GLOBAL RANKINGS</Text>

            <View style={styles.headerRow}>
              <Text style={styles.headerRank}>RANK</Text>
              <Text style={styles.headerTown}>TOWN</Text>
              <Text style={styles.headerStats}>
                {getTabDisplayName(activeTab).split(' ')[0]}
              </Text>
            </View>

            {sortedData.map((item, index) => {
              const rank = index + 1;
              const rankStyle = getRankStyle(rank);
              const isCurrentTown = item.town_name === profile?.town;

              return (
                <View
                  key={item.id || index}
                  style={[
                    styles.leaderboardRow,
                    isCurrentTown && styles.currentTownRow,
                    index === 0 && styles.firstPlaceRow,
                  ]}>
                  <View style={styles.rankSection}>
                    <View style={[styles.rankContainer, { backgroundColor: rankStyle.color }]}>
                      <Text style={styles.rankIcon}>{rankStyle.icon}</Text>
                    </View>
                    <Text style={styles.rankNumber}>#{rank}</Text>
                  </View>

                  <View style={styles.townSection}>
                    <Text style={styles.townNameLeaderboard}>
                      {' ' + item.town_name}
                      {isCurrentTown && <Text style={styles.youText}> (YOU)</Text>}
                    </Text>
                  </View>

                  <View style={styles.statsSection}>
                    <Text style={styles.greenScore}>{getMetricValue(item)}</Text>
                    <Text style={styles.statValue}>♻️ {item.green_score || 0}</Text>
                    <Text style={styles.statValue}>⚡ {item.electricity || 0}</Text>
                    <Text style={styles.statValue}>⛽ {item.gas || 0}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>BACK TO HOME</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
