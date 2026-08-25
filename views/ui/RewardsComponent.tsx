import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ImageBackground, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Loading from '@/views/ui/LoadingComponent';
import { styles } from '@/app/styles/reward_style';
import { useUser } from '@/app/context/UserProfileContext';
import { RewardsController } from '@/app/controller/rewards_controller';
import { RewardsModel, Reward } from '@/app/model/reward_model';

export default function RewardsView() {
  const router = useRouter();
  const { profile, refreshProfile } = useUser();
  
  // State that was previously in useRewards()
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [claimedRewards, setClaimedRewards] = useState<number[]>([]);
  const [userScore, setUserScore] = useState<number>(0);

  // Load rewards data on component mount
  useEffect(() => {
    loadRewardsData();
  },[] );

  const loadRewardsData = async () => {
    setLoading(true);
    try {
      const result = await RewardsController.loadRewardsData(profile);
      
      if (result.success && result.data) {
        setRewards(result.data.rewards);
       setClaimedRewards(result.data.claimedRewards);
        setUserScore(result.data.userScore);
      } else {
        console.error('Error', result.error || 'Failed to load rewards') 
        Alert.alert('Error', result.error || 'Failed to load rewards');
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      Alert.alert('Error', 'Failed to load rewards data');
    } finally {
      setLoading(false);
    }
  };

  const handleRewardRedemption = async (reward: Reward) => {
    if (!profile) {
      Alert.alert('Error', 'User profile not found. Please try again.');
      return;
    }

    // Use controller for validation
    const validation = RewardsController.validateRewardRedemption(userScore, reward, profile);
    if (!validation.isValid) {
      Alert.alert('Cannot Redeem', validation.error || 'Unable to redeem this reward.');
      return;
    }

    // Use controller for redemption
    const result = await RewardsController.redeemReward(reward, profile);
    
    if (result.success && result.newScore !== undefined && result.updatedRewards) {
      // Update local state
      setUserScore(result.newScore);
      setClaimedRewards(result.updatedRewards);
      
      // Refresh profile in context to sync across app
      await refreshProfile();
      
      Alert.alert('Success!', `You redeemed ${reward.reward_name}.`);
    } else {
      Alert.alert('Error', result.error || 'Failed to redeem reward');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ImageBackground
      source={require('@/assets/images/bg-city.png')}
      resizeMode="cover"
      style={styles.backgroundImage}>
      
      <View style={styles.headerSection}>
        <Text style={styles.greenScoreText}>YOUR GREEN SCORE: {userScore} PTS</Text>
        <Text style={styles.rewardsHeader}>REWARDS</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {rewards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>NO REWARDS AVAILABLE</Text>
          </View>
        ) : (
          rewards.map((reward, index) => (
            <RewardCard 
              key={reward.id || index}
              reward={reward}
              userScore={userScore}
              isClaimed={claimedRewards.includes(reward.id)}
              onRedeem={handleRewardRedemption}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.footerSection}>
        <LinearGradient
          colors={['#ff66cc', '#ff9933']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backGradient}>
          <Pressable 
            onPress={() => router.push('/menu')} 
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>BACK TO HOME</Text>
          </Pressable>
        </LinearGradient>
      </View>
    </ImageBackground>
  );
}

// Separate component for reward card for better organization
const RewardCard = ({ reward, userScore, isClaimed, onRedeem }: any) => {
  const canRedeem = userScore >= reward.points_required && !isClaimed;
  const pointsNeeded = reward.points_required - userScore;

  return (
    <View style={styles.rewardCard}>
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardName}>{reward.reward_name}</Text>
        <Text style={styles.pointsRequired}>{reward.points_required} POINTS</Text>
      </View>

      {isClaimed ? (
        <Pressable style={styles.redeemedButton} disabled>
          <Text style={styles.redeemedButtonText}>REDEEMED</Text>
        </Pressable>
      ) : (
        <View style={styles.redeemContainer}>
          <LinearGradient
            colors={canRedeem ? ['#ff66cc', '#ff9933'] : ['#cccccc', '#999999']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.redeemGradient}>
            <Pressable
              style={styles.redeemButton}
              onPress={() => onRedeem(reward)}
              disabled={!canRedeem}>
              <Text style={styles.redeemButtonText}>
                {canRedeem ? 'REDEEM NOW' : 'NEED MORE POINTS'}
              </Text>
            </Pressable>
          </LinearGradient>
          {!canRedeem && pointsNeeded > 0 && (
            <Text style={styles.pointsWarning}>
              NEED {pointsNeeded} MORE POINTS
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

