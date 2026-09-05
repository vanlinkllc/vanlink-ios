import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStripe } from '@stripe/stripe-react-native';
import { AddressAutocomplete } from '@/components/AddressAutocomplete';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { colors, radii } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import {
  confirmJobPayment,
  cancelJob,
  createJob,
  createJobPaymentIntent,
  fetchDistance,
  type DistanceResult,
  type Job,
  type PlaceDetails,
} from '@/lib/api';
import { requireStripePublishableKey, STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';
import type { CustomerStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<CustomerStackParamList, 'BookDelivery'>;

const BookDeliveryScreen: React.FC<Props> = ({ navigation }) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupPlace, setPickupPlace] = useState<PlaceDetails | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<PlaceDetails | null>(null);
  const [distance, setDistance] = useState<DistanceResult | null>(null);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState<string | null>(null);
  const [itemDescription, setItemDescription] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [budget, setBudget] = useState('');
  const [helpersRequired, setHelpersRequired] = useState('0');
  const [scheduledTime, setScheduledTime] = useState('');
  const [vehicleClass, setVehicleClass] = useState('small_van');
  const [deliveryTier, setDeliveryTier] = useState<'standard' | 'same_day' | '2_hour' | '1_hour'>('standard');
  const [pricingModel, setPricingModel] = useState<'fixed' | 'bid'>('fixed');
  const [reviewing, setReviewing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { profile } = useAuth();

  useEffect(() => {
    if (!pickupPlace || !dropoffPlace) {
      setDistance(null);
      setDistanceError(null);
      setDistanceLoading(false);
      return;
    }

    let active = true;
    setDistanceLoading(true);
    setDistanceError(null);
    fetchDistance(
      {
        lat: pickupPlace.lat,
        lng: pickupPlace.lng,
        address: pickupPlace.formattedAddress,
      },
      {
        lat: dropoffPlace.lat,
        lng: dropoffPlace.lng,
        address: dropoffPlace.formattedAddress,
      }
    )
      .then(result => {
        if (active) setDistance(result);
      })
      .catch(error => {
        if (active) {
          setDistance(null);
          setDistanceError(
            error instanceof Error ? error.message : 'Unable to calculate route distance.'
          );
        }
      })
      .finally(() => {
        if (active) setDistanceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dropoffPlace, pickupPlace]);

  const validateForm = (): {
    parsedBudget: number;
    parsedValue: number;
    parsedHelpers: number;
    scheduledIso?: string;
  } | null => {
    const parsedBudget = Number(budget);
    const parsedValue = Number(itemValue);
    const parsedHelpers = Number(helpersRequired || 0);
    const scheduledIso = parseScheduledTime(scheduledTime);

    if (!pickupPlace || !dropoffPlace) {
      Alert.alert(
        'Select addresses',
        'Choose pickup and destination addresses from the VanLink address search results.'
      );
      return null;
    }

    if (scheduledTime.trim() && !scheduledIso) {
      Alert.alert('Invalid schedule', 'Enter date and time as YYYY-MM-DD HH:mm, or leave it blank.');
      return null;
    }

    if (!itemDescription.trim()) {
      Alert.alert('Missing details', 'Item details are required.');
      return null;
    }

    if (distanceLoading) {
      Alert.alert('Route still loading', 'Wait for the backend route distance before submitting.');
      return null;
    }

    if (!distance) {
      Alert.alert(
        'Route unavailable',
        distanceError || 'The backend could not calculate distance for these addresses.'
      );
      return null;
    }

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      Alert.alert('Invalid item value', 'Enter a valid item value. Use 0 only if the item has no declared value.');
      return null;
    }

    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      Alert.alert('Invalid budget', 'Enter a valid delivery budget.');
      return null;
    }

    if (!Number.isFinite(parsedHelpers) || parsedHelpers < 0) {
      Alert.alert('Invalid helpers', 'Enter 0 or a valid number of helpers.');
      return null;
    }

    return { parsedBudget, parsedValue, parsedHelpers, scheduledIso };
  };

  const handleReview = () => {
    if (validateForm()) setReviewing(true);
  };

  const handleSubmit = async () => {
    const values = validateForm();
    if (!values || !pickupPlace || !dropoffPlace || !distance) return;
    const { parsedBudget, parsedValue, parsedHelpers, scheduledIso } = values;

    setLoading(true);
    let createdJob: Job | null = null;
    let paymentIntentId: string | null = null;
    try {
      if (!STRIPE_PUBLISHABLE_KEY && (profile?.walletBalance ?? 0) < parsedBudget) {
        throw new Error(
          'Stripe publishable key is not configured. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY before taking card payments.'
        );
      }

      const job = await createJob({
        pickupAddress: pickupPlace.formattedAddress,
        pickupLat: pickupPlace.lat,
        pickupLng: pickupPlace.lng,
        pickupEircode: pickupPlace.eircode,
        dropoffAddress: dropoffPlace.formattedAddress,
        dropoffLat: dropoffPlace.lat,
        dropoffLng: dropoffPlace.lng,
        dropoffEircode: dropoffPlace.eircode,
        distanceKm: distance.distanceKm,
        itemDescription: itemDescription.trim(),
        itemValue: parsedValue,
        budget: parsedBudget,
        pricingModel,
        helpersRequired: Number.isFinite(parsedHelpers) ? parsedHelpers : 0,
        vehicleClass,
        scheduledTime: scheduledIso,
        deliveryTier: deliveryTier === 'standard' ? undefined : deliveryTier,
        isSameDay: deliveryTier !== 'standard',
      });
      createdJob = job;

      const totalAmount = job._totalAmount ?? parsedBudget;
      const paymentIntent = await createJobPaymentIntent(
        totalAmount,
        itemDescription.trim(),
        job.id
      );
      paymentIntentId = paymentIntent.paymentIntentId;

      const shouldContinue = await confirmBackendPaymentBreakdown(paymentIntent);
      if (!shouldContinue) {
        const cancelled = await cancelJob(job.id, 'Customer cancelled before payment confirmation.');
        Alert.alert('Booking cancelled', 'No funds were locked for this delivery.', [
          {
            text: 'View delivery',
            onPress: () => navigation.replace('JobDetails', { jobId: cancelled.id, mode: 'customer' }),
          },
        ]);
        return;
      }

      if (!paymentIntent.walletOnly) {
        requireStripePublishableKey();
        if (!paymentIntent.clientSecret || !paymentIntent.paymentIntentId) {
          throw new Error('The backend did not return a Stripe client secret.');
        }

        const initResult = await initPaymentSheet({
          merchantDisplayName: 'VanLink',
          paymentIntentClientSecret: paymentIntent.clientSecret,
          returnURL: 'vanlink://stripe-redirect',
        });
        if (initResult.error) {
          throw new Error(initResult.error.message);
        }

        const paymentResult = await presentPaymentSheet();
        if (paymentResult.error) {
          throw new Error(paymentResult.error.message);
        }
      }

      const confirmedJob = await confirmJobPayment(job.id, paymentIntent.paymentIntentId);
      Alert.alert('Delivery booked', 'Your payment was confirmed by the backend.', [
        {
          text: 'All deliveries',
          onPress: () => navigation.replace('Deliveries'),
        },
        {
          text: 'View delivery',
          onPress: () =>
            navigation.replace('JobDetails', { jobId: confirmedJob.id, mode: 'customer' }),
        },
      ]);
    } catch (error) {
      if (createdJob) {
        const pendingJob = createdJob;
        const retryPaymentIntentId = paymentIntentId;
        Alert.alert(
          'Payment not completed',
          error instanceof Error
            ? error.message
            : 'The delivery was created but payment could not be confirmed.',
          [
            ...(retryPaymentIntentId
              ? [{
                  text: 'Retry confirmation',
                  onPress: () =>
                    retryConfirmPayment(
                      pendingJob.id,
                      retryPaymentIntentId,
                      (jobId) => navigation.replace('JobDetails', { jobId, mode: 'customer' })
                    ),
                }]
              : []),
            {
              text: 'View delivery',
              onPress: () =>
                navigation.replace('JobDetails', {
                  jobId: pendingJob.id,
                  mode: 'customer',
                }),
            },
            { text: 'Stay here', style: 'cancel' },
          ]
        );
        return;
      }
      Alert.alert(
        'Booking failed',
        error instanceof Error ? error.message : 'Unable to book delivery.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {reviewing ? (
            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>Review booking</Text>
              <Text style={styles.reviewLabel}>Pickup</Text>
              <Text style={styles.reviewText}>{pickupPlace?.formattedAddress}</Text>
              <Text style={styles.reviewLabel}>Destination</Text>
              <Text style={styles.reviewText}>{dropoffPlace?.formattedAddress}</Text>
              <Text style={styles.reviewLabel}>Backend route estimate</Text>
              <Text style={styles.reviewText}>
                {distance?.distanceKm.toFixed(2)} km · {distance?.durationText}
              </Text>
              <Text style={styles.reviewLabel}>Delivery</Text>
              <Text style={styles.reviewText}>
                {itemDescription.trim()} · {pricingModel === 'bid' ? 'Bid job' : 'Fixed price'} · {vehicleClassLabel(vehicleClass)}
              </Text>
              <Text style={styles.reviewLabel}>Timing</Text>
              <Text style={styles.reviewText}>
                {deliveryTierLabel(deliveryTier)}
                {scheduledTime.trim() ? ` · ${scheduledTime.trim()}` : ''}
              </Text>
              <Text style={styles.reviewLabel}>Helpers</Text>
              <Text style={styles.reviewText}>{helpersRequired || '0'}</Text>
              <Text style={styles.reviewLabel}>Budget</Text>
              <Text style={styles.reviewText}>€{Number(budget).toFixed(2)}</Text>
              <Text style={styles.reviewMeta}>
                The backend calculates the final payable amount, wallet contribution, card charge, and job status after you confirm.
              </Text>
              <View style={styles.segment}>
                <Button
                  title="Edit"
                  onPress={() => setReviewing(false)}
                  variant="secondary"
                  style={styles.segmentButton}
                  disabled={loading}
                />
                <Button
                  title={loading ? 'Confirming...' : 'Confirm & pay'}
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.segmentButton}
                />
              </View>
            </View>
          ) : null}
          {!reviewing ? (
            <>
              <AddressAutocomplete
                label="Pickup address"
                value={pickupAddress}
                selectedPlace={pickupPlace}
                disabled={loading}
                onChangeText={(text) => {
                  setPickupAddress(text);
                  setPickupPlace(null);
                }}
                onSelectPlace={(place) => {
                  setPickupPlace(place);
                  setPickupAddress(place.formattedAddress);
                }}
                onClearPlace={() => setPickupPlace(null)}
              />
              <AddressAutocomplete
                label="Destination address"
                value={dropoffAddress}
                selectedPlace={dropoffPlace}
                disabled={loading}
                onChangeText={(text) => {
                  setDropoffAddress(text);
                  setDropoffPlace(null);
                }}
                onSelectPlace={(place) => {
                  setDropoffPlace(place);
                  setDropoffAddress(place.formattedAddress);
                }}
                onClearPlace={() => setDropoffPlace(null)}
              />
              {pickupPlace && dropoffPlace ? (
                <View style={styles.routeCard}>
                  {distanceLoading ? (
                    <View style={styles.routeRow}>
                      <ActivityIndicator color={colors.primary} />
                      <Text style={styles.routeText}>Calculating route...</Text>
                    </View>
                  ) : distance ? (
                    <>
                      <Text style={styles.routeLabel}>Backend route estimate</Text>
                      <Text style={styles.routeValue}>
                        {distance.distanceKm.toFixed(2)} km · {distance.durationText}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.routeLabel}>Route unavailable</Text>
                      <Text style={styles.routeError}>
                        {distanceError || 'The backend could not calculate this route.'}
                      </Text>
                    </>
                  )}
                </View>
              ) : null}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Item description</Text>
                <TextInput
                  value={itemDescription}
                  onChangeText={setItemDescription}
                  editable={!loading}
                  multiline
                  numberOfLines={4}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Item value</Text>
                <TextInput
                  value={itemValue}
                  onChangeText={setItemValue}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Delivery budget</Text>
                <TextInput
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Pricing model</Text>
                <View style={styles.segment}>
                  <Button
                    title="Fixed"
                    onPress={() => setPricingModel('fixed')}
                    variant={pricingModel === 'fixed' ? 'primary' : 'secondary'}
                    style={styles.segmentButton}
                    disabled={loading}
                  />
                  <Button
                    title="Bid"
                    onPress={() => setPricingModel('bid')}
                    variant={pricingModel === 'bid' ? 'primary' : 'secondary'}
                    style={styles.segmentButton}
                    disabled={loading}
                  />
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Vehicle requirement</Text>
                <View style={styles.segment}>
                  {['car', 'small_van', 'medium_van', 'large_van'].map(value => (
                    <Button
                      key={value}
                      title={vehicleClassLabel(value)}
                      onPress={() => setVehicleClass(value)}
                      variant={vehicleClass === value ? 'primary' : 'secondary'}
                      style={styles.wrapButton}
                      disabled={loading}
                    />
                  ))}
                </View>
              </View>
              <View style={styles.formGroup}>
            <Text style={styles.label}>Timing</Text>
            <View style={styles.segment}>
              {[
                { value: 'standard', label: 'Standard' },
                { value: 'same_day', label: 'Same day' },
                { value: '2_hour', label: '2 hour' },
                { value: '1_hour', label: '1 hour' },
              ].map(option => (
                <Button
                  key={option.value}
                  title={option.label}
                  onPress={() => setDeliveryTier(option.value as typeof deliveryTier)}
                  variant={deliveryTier === option.value ? 'primary' : 'secondary'}
                  style={styles.wrapButton}
                  disabled={loading}
                />
              ))}
            </View>
            {deliveryTier !== 'standard' ? (
              <Text style={styles.helperText}>
                The backend applies the VanLink priority delivery adjustment.
              </Text>
            ) : null}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Scheduled date/time</Text>
            <TextInput
              value={scheduledTime}
              onChangeText={setScheduledTime}
              placeholder="YYYY-MM-DD HH:mm"
              keyboardType="numbers-and-punctuation"
              editable={!loading}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Helpers required</Text>
            <TextInput
              value={helpersRequired}
              onChangeText={setHelpersRequired}
              keyboardType="number-pad"
              editable={!loading}
            />
          </View>
          <Button
            title="Review booking"
            onPress={handleReview}
            disabled={loading}
          />
          </>
          ) : null}
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
  form: {
    gap: 16,
  },
  routeCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  routeText: {
    color: colors.mutedText,
    fontSize: 13,
  },
  routeValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  routeError: {
    color: colors.dangerText,
    fontSize: 13,
    lineHeight: 18,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  segment: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  segmentButton: {
    flex: 1,
  },
  wrapButton: {
    minWidth: '47%',
    flexGrow: 1,
  },
  helperText: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  reviewTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  reviewLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  reviewText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  reviewMeta: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
});

function vehicleClassLabel(value: string): string {
  switch (value) {
    case 'car':
      return 'Car';
    case 'medium_van':
      return 'Medium van';
    case 'large_van':
      return 'Large van';
    case 'small_van':
    default:
      return 'Small van';
  }
}

function deliveryTierLabel(value: string): string {
  switch (value) {
    case 'same_day':
      return 'Same day';
    case '2_hour':
      return '2 hour priority';
    case '1_hour':
      return '1 hour priority';
    case 'standard':
    default:
      return 'Standard';
  }
}

function parseScheduledTime(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);
  if (!match) return undefined;
  const [, year, month, day, hour, minute] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function confirmBackendPaymentBreakdown(paymentIntent: {
  walletOnly: boolean;
  walletContribution: number;
  cardCharge: number;
  totalAmount: number;
}): Promise<boolean> {
  return new Promise(resolve => {
    Alert.alert(
      'Confirm payment',
      [
        `Total: €${paymentIntent.totalAmount.toFixed(2)}`,
        `Wallet: €${paymentIntent.walletContribution.toFixed(2)}`,
        `Card: €${paymentIntent.cardCharge.toFixed(2)}`,
        paymentIntent.walletOnly
          ? 'VanLink will lock funds from your wallet.'
          : 'VanLink will open Stripe to collect the card portion.',
      ].join('\n'),
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continue', onPress: () => resolve(true) },
      ]
    );
  });
}

async function retryConfirmPayment(
  jobId: string,
  paymentIntentId: string,
  onConfirmed: (jobId: string) => void
): Promise<void> {
  try {
    const confirmedJob = await confirmJobPayment(jobId, paymentIntentId);
    Alert.alert('Payment confirmed', 'The backend confirmed and locked funds for this delivery.', [
      { text: 'View delivery', onPress: () => onConfirmed(confirmedJob.id) },
    ]);
  } catch (error) {
    Alert.alert(
      'Still not confirmed',
      error instanceof Error
        ? error.message
        : 'The backend still could not confirm this payment.'
    );
  }
}

export default BookDeliveryScreen;
