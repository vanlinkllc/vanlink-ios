import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { StateView } from '@/components/StateView';
import { formatCurrency, titleCase } from '@/utils/format';

const HomeScreen: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshProfile();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await refreshProfile();
    setLoading(false);
  };

  if (!profile) {
    return (
      <StateView
        title="Profile unavailable"
        message="Your account could not be loaded."
        actionLabel="Retry"
        onAction={handleRefresh}
      />
    );
  }

  const walletBalance = Number.isFinite(profile.walletBalance) ? profile.walletBalance : 0;
  const rating = Number.isFinite(profile.rating) ? profile.rating : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Welcome, {profile.firstName}!
        </Text>
        <Text style={styles.role}>
          {titleCase(profile.role)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wallet Balance</Text>
        <Text style={styles.balance}>
          {formatCurrency(walletBalance)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile Stats</Text>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Rating</Text>
          <Text style={styles.statValue}>{rating.toFixed(1)} stars</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Jobs Completed</Text>
          <Text style={styles.statValue}>{profile.jobsCompleted}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Experience Points</Text>
          <Text style={styles.statValue}>{profile.xp} XP</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#6b7280',
  },
  card: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default HomeScreen;
