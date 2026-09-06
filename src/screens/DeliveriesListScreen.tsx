import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobCard } from '@/components/JobCard';
import { StateView } from '@/components/StateView';
import { colors } from '@/constants/theme';
import { fetchJobsForCustomer, type Job } from '@/lib/api';
import type { CustomerStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<CustomerStackParamList, 'Deliveries'>;

const DeliveriesListScreen: React.FC<Props> = ({ navigation }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const customerJobs = await fetchJobsForCustomer();
      setJobs(Array.isArray(customerJobs) ? customerJobs : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load deliveries.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <StateView title="Loading deliveries" loading />;
  if (error) {
    return <StateView title="Could not load deliveries" message={error} actionLabel="Retry" onAction={load} />;
  }
  if (jobs.length === 0) {
    return <StateView title="No deliveries" message="Your booked deliveries will appear here." />;
  }

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
        <View style={styles.list}>
          {jobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => navigation.navigate('JobDetails', { jobId: job.id, mode: 'customer' })}
            />
          ))}
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
  },
  list: {
    gap: 12,
  },
});

export default DeliveriesListScreen;
