import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JobCard } from '@/components/JobCard';
import { StateView } from '@/components/StateView';
import { colors } from '@/constants/theme';
import { fetchActiveDriverJob, type Job } from '@/lib/api';
import type { DriverStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<DriverStackParamList, 'ActiveJob'>;

const ActiveJobScreen: React.FC<Props> = ({ navigation }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const activeJob = await fetchActiveDriverJob();
      setJob(activeJob);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load active job.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <StateView title="Loading active job" loading />;
  if (error) return <StateView title="Could not load active job" message={error} actionLabel="Retry" onAction={load} />;
  if (!job) {
    return <StateView title="No active job" message="Accept a job to see route details here." actionLabel="Find jobs" onAction={() => navigation.navigate('DriverJobs', { list: 'available' })} />;
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
          <JobCard job={job} onPress={() => navigation.navigate('Route', { jobId: job.id })} />
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

export default ActiveJobScreen;
