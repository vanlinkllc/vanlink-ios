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
import { fetchJobsForCustomer, type Job } from '@/lib/api';
import type { CustomerStackParamList } from '@/types/navigation';
import { formatCurrency } from '@/utils/format';

type Props = NativeStackScreenProps<CustomerStackParamList, 'CustomerHome'>;

const CustomerHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, refreshProfile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      await refreshProfile();
      const customerJobs = await fetchJobsForCustomer();
      setJobs(Array.isArray(customerJobs) ? customerJobs : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load customer data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <StateView title="Loading customer home" loading />;
  }

  if (error) {
    return <StateView title="Could not load home" message={error} actionLabel="Retry" onAction={load} />;
  }

  const recentJobs = jobs.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
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
          <Text style={styles.greeting}>Welcome, {profile?.firstName || 'Customer'}</Text>
          <Text style={styles.subtle}>Wallet {formatCurrency(profile?.walletBalance)}</Text>
        </View>

        <View style={styles.actions}>
          <Button title="Book delivery" onPress={() => navigation.navigate('BookDelivery')} />
          <Button
            title="View deliveries"
            onPress={() => navigation.navigate('Deliveries')}
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

        <Text style={styles.sectionTitle}>Recent deliveries</Text>
        {recentJobs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No deliveries yet</Text>
            <Text style={styles.emptyText}>Book a delivery to create your first VanLink job.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {recentJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => navigation.navigate('JobDetails', { jobId: job.id, mode: 'customer' })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
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
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  list: {
    gap: 12,
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

export default CustomerHomeScreen;
