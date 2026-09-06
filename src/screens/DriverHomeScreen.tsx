import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { JobCard } from '@/components/JobCard';
import { StateView } from '@/components/StateView';
import { colors, radii } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { fetchActiveDriverJob, fetchDriverStats, type DriverStats, type Job } from '@/lib/api';
import type { DriverStackParamList } from '@/types/navigation';
import { formatCurrency } from '@/utils/format';

type Props = NativeStackScreenProps<DriverStackParamList, 'DriverHome'>;

const DriverHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, refreshProfile } = useAuth();
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      await refreshProfile();
      const [active, driverStats] = await Promise.all([
        fetchActiveDriverJob(),
        fetchDriverStats(),
      ]);
      setActiveJob(active);
      setStats(driverStats);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load driver data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <StateView title="Loading driver home" loading />;
  if (error) return <StateView title="Could not load home" message={error} actionLabel="Retry" onAction={load} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {stats?.firstName || profile?.firstName || 'Driver'}</Text>
          <Text style={styles.subtle}>Wallet {formatCurrency(stats?.walletBalance ?? profile?.walletBalance)}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total earnings</Text>
            <Text style={styles.statValue}>{formatCurrency(stats?.totalEarnings)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{stats?.jobsCompleted ?? 0}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Rating</Text>
            <Text style={styles.statValue}>{stats?.rating?.toFixed(1) ?? '0.0'}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Radius</Text>
            <Text style={styles.statValue}>{stats?.radiusKm ?? 0} km</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            title="Available jobs"
            onPress={() => navigation.navigate('DriverJobs', { list: 'available' })}
          />
          <Button
            title="My jobs"
            onPress={() => navigation.navigate('DriverJobs', { list: 'mine' })}
            variant="secondary"
          />
          <Button
            title="Active job"
            onPress={() => navigation.navigate('ActiveJob')}
            variant="secondary"
          />
          {__DEV__ ? (
            <Button
              title="Development QA"
              onPress={() => navigation.navigate('DevQa')}
              variant="secondary"
            />
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Current job</Text>
        {activeJob ? (
          <JobCard
            job={activeJob}
            onPress={() => navigation.navigate('Route', { jobId: activeJob.id })}
          />
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No active job</Text>
            <Text style={styles.emptyText}>Accepted jobs that are in progress appear here.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Available jobs</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Use your current location</Text>
          <Text style={styles.emptyText}>
            Browse jobs requests your iPhone location and sends those coordinates
            to the VanLink backend for matching.
          </Text>
          <Button
            title="Browse available jobs"
            onPress={() => navigation.navigate('DriverJobs', { list: 'available' })}
            variant="secondary"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    gap: 18,
  },
  header: {
    gap: 6,
  },
  greeting: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  subtle: {
    color: colors.mutedText,
    fontSize: 14,
  },
  actions: {
    gap: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    width: '48%',
    gap: 6,
  },
  statLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DriverHomeScreen;
