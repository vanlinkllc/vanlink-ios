import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { RouteMap } from '@/components/RouteMap';
import { StateView } from '@/components/StateView';
import { colors } from '@/constants/theme';
import { completeJob, fetchJob, fetchRoute, updateJobLocation, type Job, type RouteResult } from '@/lib/api';
import { getCurrentDriverCoordinates } from '@/lib/location';
import type { DriverStackParamList } from '@/types/navigation';
import { formatDateTime, titleCase } from '@/utils/format';

type Props = NativeStackScreenProps<DriverStackParamList, 'Route'>;

const RouteScreen: React.FC<Props> = ({ navigation, route }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const loadRoute = useCallback(async (loadedJob: Job) => {
    if (
      !Number.isFinite(loadedJob.pickupLat) ||
      !Number.isFinite(loadedJob.pickupLng) ||
      !Number.isFinite(loadedJob.dropoffLat) ||
      !Number.isFinite(loadedJob.dropoffLng)
    ) {
      setRouteResult(null);
      setRouteError('This job does not include backend location coordinates.');
      return;
    }

    setRouteLoading(true);
    setRouteError(null);
    try {
      const result = await fetchRoute(
        {
          lat: loadedJob.pickupLat as number,
          lng: loadedJob.pickupLng as number,
          address: loadedJob.pickupAddress,
        },
        {
          lat: loadedJob.dropoffLat as number,
          lng: loadedJob.dropoffLng as number,
          address: loadedJob.dropoffAddress,
        }
      );
      setRouteResult(result);
    } catch (routeLoadError) {
      setRouteResult(null);
      setRouteError(
        routeLoadError instanceof Error ? routeLoadError.message : 'Unable to load backend route.'
      );
    } finally {
      setRouteLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      setError(null);
      const loadedJob = await fetchJob(route.params.jobId);
      setJob(loadedJob);
      await loadRoute(loadedJob);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load route.');
    } finally {
      setLoading(false);
    }
  }, [loadRoute, route.params.jobId]);

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

  const handleShareLocation = async () => {
    if (!job) return;
    setLocationLoading(true);
    try {
      const coords = await getCurrentDriverCoordinates();
      const updatedJob = await updateJobLocation(
        job.id,
        coords.latitude,
        coords.longitude,
        job.navPhase
      );
      setJob(updatedJob);
      await loadRoute(updatedJob);
      Alert.alert('Location updated', 'Your current driver location was sent to VanLink.');
    } catch (locationError) {
      Alert.alert(
        'Location unavailable',
        locationError instanceof Error ? locationError.message : 'Unable to update your location.'
      );
    } finally {
      setLocationLoading(false);
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
          {routeLoading ? (
            <View style={styles.routeStateRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.muted}>Loading backend route...</Text>
            </View>
          ) : null}
          {routeResult ? (
            <Text style={styles.routeSummary}>
              {routeResult.distanceKm.toFixed(2)} km · {routeResult.durationText}
            </Text>
          ) : null}
          {routeError ? (
            <View style={styles.routeErrorCard}>
              <Text style={styles.routeError}>{routeError}</Text>
              <Button title="Retry route" onPress={() => loadRoute(job)} variant="secondary" />
            </View>
          ) : null}
          <RouteMap job={job} routeResult={routeResult} />
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.address}>{job.pickupAddress || 'Missing pickup address'}</Text>
          <Text style={styles.label}>Dropoff</Text>
          <Text style={styles.address}>{job.dropoffAddress || 'Missing dropoff address'}</Text>
          <Text style={styles.label}>Scheduled</Text>
          <Text style={styles.address}>{formatDateTime(job.scheduledTime)}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title={locationLoading ? 'Updating location...' : 'Share current location'}
            onPress={handleShareLocation}
            loading={locationLoading}
            disabled={submitting || locationLoading}
            variant="secondary"
          />
          <Button
            title={submitting ? 'Completing...' : 'Mark complete'}
            onPress={handleComplete}
            loading={submitting}
            disabled={submitting || locationLoading}
          />
          <Button
            title="Job details"
            onPress={() => navigation.navigate('JobDetails', { jobId: job.id, mode: 'driver' })}
            variant="secondary"
            disabled={submitting || locationLoading}
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
    gap: 14,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  status: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  address: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
  },
  routeStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  muted: {
    color: colors.mutedText,
    fontSize: 13,
  },
  routeSummary: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  routeErrorCard: {
    backgroundColor: colors.warningBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    padding: 12,
    gap: 10,
  },
  routeError: {
    color: colors.warningText,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    gap: 12,
  },
});

export default RouteScreen;
