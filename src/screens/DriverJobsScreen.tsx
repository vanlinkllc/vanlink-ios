import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { JobCard } from '@/components/JobCard';
import { StateView } from '@/components/StateView';
import { colors } from '@/constants/theme';
import { fetchAvailableJobs, fetchJobsForDriver, type Job } from '@/lib/api';
import { getCurrentDriverCoordinates } from '@/lib/location';
import type { DriverStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<DriverStackParamList, 'DriverJobs'>;

const DriverJobsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [list, setList] = useState(route.params.list);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const loadedJobs =
        list === 'available'
          ? await getCurrentDriverCoordinates().then(coords =>
              fetchAvailableJobs({
                driverLat: coords.latitude,
                driverLng: coords.longitude,
              })
            )
          : await fetchJobsForDriver();
      setJobs(Array.isArray(loadedJobs) ? loadedJobs : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load jobs.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [list]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  if (loading) return <StateView title="Loading jobs" loading />;
  if (error) return <StateView title="Could not load jobs" message={error} actionLabel="Retry" onAction={load} />;

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
        <View style={styles.segment}>
          <Button title="Available" onPress={() => setList('available')} variant={list === 'available' ? 'primary' : 'secondary'} style={styles.segmentButton} />
          <Button title="My jobs" onPress={() => setList('mine')} variant={list === 'mine' ? 'primary' : 'secondary'} style={styles.segmentButton} />
        </View>

        {jobs.length === 0 ? (
          <StateView
            title={list === 'available' ? 'No available jobs' : 'No assigned jobs'}
            message="Pull to refresh or check again later."
          />
        ) : (
          <View style={styles.list}>
            {jobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onPress={() => navigation.navigate('JobDetails', { jobId: job.id, mode: 'driver' })}
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
  content: {
    minHeight: '100%',
    padding: 20,
    gap: 16,
  },
  segment: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentButton: {
    flex: 1,
  },
  list: {
    gap: 12,
  },
});

export default DriverJobsScreen;
