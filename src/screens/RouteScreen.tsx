import React, { useCallback, useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { StateView } from '@/components/StateView';
import { completeJob, fetchJob, type Job } from '@/lib/api';
import type { DriverStackParamList } from '@/types/navigation';
import { formatDateTime, titleCase } from '@/utils/format';

type Props = NativeStackScreenProps<DriverStackParamList, 'Route'>;

const RouteScreen: React.FC<Props> = ({ navigation, route }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const loadedJob = await fetchJob(route.params.jobId);
      setJob(loadedJob);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load route.');
    } finally {
      setLoading(false);
    }
  }, [route.params.jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async () => {
    if (!job) return;
    setSubmitting(true);
    try {
      const completed = await completeJob(job.id);
      setJob(completed);
      Alert.alert('Job completed', 'The backend marked this job complete.', [
        { text: 'Back to active jobs', onPress: () => navigation.navigate('ActiveJob') },
      ]);
    } catch (completeError) {
      Alert.alert(
        'Complete failed',
        completeError instanceof Error ? completeError.message : 'Unable to complete this job.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <StateView title="Loading route" loading />;
  if (error) return <StateView title="Could not load route" message={error} actionLabel="Retry" onAction={load} />;
  if (!job) return <StateView title="Route unavailable" message="The backend did not return this job." />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.status}>{titleCase(job.status)}</Text>
          <Text style={styles.title}>Route</Text>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.address}>{job.pickupAddress || 'Missing pickup address'}</Text>
          <Text style={styles.label}>Dropoff</Text>
          <Text style={styles.address}>{job.dropoffAddress || 'Missing dropoff address'}</Text>
          <Text style={styles.label}>Scheduled</Text>
          <Text style={styles.address}>{formatDateTime(job.scheduledTime)}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={submitting ? 'Completing...' : 'Mark complete'}
            onPress={handleComplete}
            loading={submitting}
            disabled={submitting}
          />
          <Button
            title="Job details"
            onPress={() => navigation.navigate('JobDetails', { jobId: job.id, mode: 'driver' })}
            variant="secondary"
            disabled={submitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 8,
  },
  status: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  address: {
    color: '#111827',
    fontSize: 16,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
});

export default RouteScreen;
