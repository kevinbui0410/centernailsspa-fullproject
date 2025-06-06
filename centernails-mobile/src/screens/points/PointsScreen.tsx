import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { pointsService } from '../../services/api';

const rewards = [
  {
    id: 1,
    name: '10% Off Any Service',
    points: 100,
    image: require('../../assets/images/reward-1.png'),
  },
  {
    id: 2,
    name: 'Free Manicure',
    points: 200,
    image: require('../../assets/images/reward-2.png'),
  },
  {
    id: 3,
    name: '20% Off Full Set',
    points: 300,
    image: require('../../assets/images/reward-3.png'),
  },
  {
    id: 4,
    name: 'Free Pedicure',
    points: 400,
    image: require('../../assets/images/reward-4.png'),
  },
];

const PointsScreen = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    fetchPointsAndRewards();
  }, []);

  const fetchPointsAndRewards = async () => {
    try {
      setLoading(true);
      const [pointsResponse, rewardsResponse] = await Promise.all([
        pointsService.getPoints(),
        pointsService.getRewards(),
      ]);
      setUserPoints(pointsResponse.points);
      setRewards(rewardsResponse);
    } catch (error) {
      Alert.alert('Error', 'Failed to load points and rewards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async (reward) => {
    try {
      setRedeeming(true);
      await pointsService.redeemReward(reward.id);
      Alert.alert('Success', 'Reward redeemed successfully!');
      // Refresh points and rewards
      fetchPointsAndRewards();
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to redeem reward. Please try again.'
      );
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.pointsCard}>
        <View style={styles.pointsHeader}>
          <Ionicons name="star" size={40} color={colors.accent.gold} />
          <Text style={styles.pointsTitle}>Your Points</Text>
        </View>
        <Text style={styles.pointsValue}>{userPoints}</Text>
        <Text style={styles.pointsSubtitle}>
          Keep visiting to earn more points!
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Available Rewards</Text>
      <View style={styles.rewardsContainer}>
        {rewards.map((reward) => (
          <View key={reward.id} style={styles.rewardCard}>
            <Image source={{ uri: reward.image }} style={styles.rewardImage} />
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardName}>{reward.name}</Text>
              <Text style={styles.rewardPoints}>{reward.points} points</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.redeemButton,
                (userPoints < reward.points || redeeming) && styles.redeemButtonDisabled,
              ]}
              onPress={() => handleRedeem(reward)}
              disabled={userPoints < reward.points || redeeming}
            >
              {redeeming ? (
                <ActivityIndicator color={colors.background.default} size="small" />
              ) : (
                <Text
                  style={[
                    styles.redeemButtonText,
                    userPoints < reward.points && styles.redeemButtonTextDisabled,
                  ]}
                >
                  {userPoints >= reward.points ? 'Redeem' : 'Not Enough Points'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.howItWorks}>
        <Text style={styles.howItWorksTitle}>How It Works</Text>
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Earn points for every service you book
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Accumulate points to unlock rewards
            </Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Redeem rewards for discounts and free services
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsCard: {
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pointsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.background.default,
    marginLeft: 10,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.accent.gold,
    marginBottom: 10,
  },
  pointsSubtitle: {
    fontSize: 16,
    color: colors.background.default,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
  },
  rewardsContainer: {
    marginBottom: 30,
  },
  rewardCard: {
    backgroundColor: colors.background.paper,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.light,
  },
  rewardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  rewardInfo: {
    flex: 1,
    marginLeft: 15,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  rewardPoints: {
    fontSize: 14,
    color: colors.primary.main,
    marginTop: 5,
  },
  redeemButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    minWidth: 100,
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    backgroundColor: colors.background.dark,
  },
  redeemButtonText: {
    color: colors.background.default,
    fontWeight: 'bold',
  },
  redeemButtonTextDisabled: {
    color: colors.text.light,
  },
  howItWorks: {
    backgroundColor: colors.background.paper,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
  },
  stepContainer: {
    gap: 15,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: colors.background.default,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
});

export default PointsScreen; 