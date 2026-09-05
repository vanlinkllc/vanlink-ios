import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { StateView } from '@/components/StateView';
import {
  acceptJob,
  confirmJobPayment,
  createBid,
  fetchBidsForJob,
  fetchJob,
  type Bid,
  type Job,
} from '@/lib/api';
import type { CustomerStackParamList, DriverStackParamList } from '@/types/navigation';
import { formatCurrency, formatDateTime, titleCase } from '@/utils/format';

type Props =
  | NativeStackScreenProps<CustomerStackParamList, 'JobDetails'>
  | NativeStackScreenProps<DriverStackParamList, 'JobDetails'>;

const bidPricingModels = new Set(['bid', 'bidding', 'auction']);

const JobDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bidsError, setBidsError] = useState<string | null>(null);
  const mode = route.params.mode ?? 'customer';

  const load = useCallback(async () => {
    try {
      setError(null);
      const loadedJob = await fetchJob(route.params.jobId);
      setJob(loadedJob);
      if (mode === 'customer') {
        try {
          setBidsError(null);
          const loadedBids = await fetchBidsForJob(route.params.jobId);
          setBids(Array.isArray(loadedBids) ? loadedBids : []);
        } catch (bidError) {
          setBids([]);
          setBidsError(
            bidError instanceof Error ? bidError.message : 'Unable to load bids for this job.'
          );
        }
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load job details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mode, route.params.jobId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async () => {
    if (!job) return;
    setSubmitting(true);
    try {
      const accepted = await acceptJob(job.id);
      setJob(accepted);
      Alert.alert('Job accepted', 'This job is now assigned to you.');
    } catch (acceptError) {
      Alert.alert(
        'Accept failed',
        acceptError instanceof Error ? acceptError.message : 'Unable to accept this job.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBid = () => {
    if (!job) return;
    if (!bidPricingModels.has(job.pricingModel)) {
      Alert.alert('Bidding unavailable', 'This job is not configured for bids by the backend.');
      return;
    }

    Alert.prompt(
      'Place bid',
      'Enter your bid amount.',
      async amountText => {
        const amount = Number(amountText);
        if (!Number.isFinite(amount) || amount <= 0) {
          Alert.alert('Invalid bid', 'Enter a valid bid amount.');
          return;
        }
        setSubmitting(true);
        try {
          await createBid(job.id, amount);
          Alert.alert('Bid submitted', 'Your bid was sent to the backend.');
        } catch (bidError) {
          Alert.alert(
            'Bid failed',
            bidError instanceof Error ? bidError.message : 'Unable to submit this bid.'
          );
        } finally {
          setSubmitting(false);
        }
      },
      'plain-text',
      '',
      'decimal-pad'
    );
  };

  const handleConfirmWalletPayment = async () => {
    if (!job) return;
    setSubmitting(true);
    try {
      const confirmed = await confirmJobPayment(job.id, null);
      setJob(confirmed);
      Alert.alert('Payment confirmed', 'The backend locked this job using wallet funds.');
    } catch (paymentError) {
      Alert.alert(
        'Payment confirmation failed',
        paymentError instanceof Error
          ? paymentError.message
          : 'Unable to confirm payment for this job.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openRoute = () => {
    const driverNavigation = navigation as NativeStackNavigationProp<DriverStackParamList>;
    driverNavigation.navigate('Route', { jobId: route.params.jobId });
  };

  if (loading) return <StateView title="Loading job" loading />;
  if (error) return <StateView title="Could not load job" message={error} actionLabel="Retry" onAction={load} />;
  if (!job) return <StateView title="Job not found" message="The backend did not return this job." />;

  const canDriverAct = mode === 'driver';
  const isAssigned = Boolean(job.driverId);

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
        <View style={styles.card}>
          <Text style={styles.status}>{titleCase(job.status)}</Text>
          <Text style={styles.title}>{job.itemDescription || 'Delivery job'}</Text>
          <Text style={styles.price}>{formatCurrency(job.finalPrice ?? job.budget)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>{job.pickupAddress || 'Missing pickup address'}</Text>
          <Text style={styles.label}>Dropoff</Text>
          <Text style={styles.value}>{job.dropoffAddress || 'Missing dropoff address'}</Text>
          <Text style={styles.label}>Scheduled</Text>
          <Text style={styles.value}>{formatDateTime(job.scheduledTime)}</Text>
          <Text style={styles.label}>Pricing</Text>
          <Text style={styles.value}>{titleCase(job.pricingModel)}</Text>
        </View>

        {mode === 'customer' ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Bids</Text>
            {bids.length === 0 ? (
              <Text style={styles.muted}>
                {bidsError ?? 'No bids returned by the backend for this job.'}
              </Text>
            ) : (
              bids.map(bid => (
                <Text key={bid.id} style={styles.value}>
                  {formatCurrency(bid.amount)} - {titleCase(bid.status)}
                </Text>
              ))
            )}
          </View>
        ) : null}

        {mode === 'customer' && job.paymentStatus === 'pending_stripe' ? (
          <View style={styles.actions}>
            <Button
              title={submitting ? 'Confirming...' : 'Confirm wallet payment'}
              onPress={handleConfirmWalletPayment}
              loading={submitting}
              disabled={submitting}
            />
            <Text style={styles.muted}>
              Wallet confirmation is handled by the backend. Card payments are started from
              booking so the backend can create the correct Stripe intent for the job.
            </Text>
          </View>
        ) : null}

        {canDriverAct ? (
          <View style={styles.actions}>
            {!isAssigned ? (
              <Button
                title={submitting ? 'Accepting...' : 'Accept job'}
                onPress={handleAccept}
                loading={submitting}
                disabled={submitting}
              />
            ) : (
              <Button title="Open route" onPress={openRoute} disabled={submitting} />
            )}
            <Button
              title="Place bid"
              onPress={handleBid}
              variant="secondary"
              disabled={submitting}
            />
          </View>
        ) : null}
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
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  price: {
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
  value: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  muted: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 12,
  },
});

export default JobDetailsScreen;
