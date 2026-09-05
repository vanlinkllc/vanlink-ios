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
  const [pricingModel, setPricingModel] = useState<'fixed' | 'bid'>('fixed');
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

  const handleSubmit = async () => {
    const parsedBudget = Number(budget);
    const parsedValue = Number(itemValue);
    const parsedHelpers = Number(helpersRequired || 0);

    if (!pickupPlace || !dropoffPlace) {
      Alert.alert(
        'Select addresses',
        'Choose pickup and destination addresses from the VanLink address search results.'
      );
      return;
    }

    if (!itemDescription.trim()) {
      Alert.alert('Missing details', 'Item details are required.');
      return;
    }

    if (distanceLoading) {
      Alert.alert('Route still loading', 'Wait for the backend route distance before submitting.');
      return;
    }

    if (!distance) {
      Alert.alert(
        'Route unavailable',
        distanceError || 'The backend could not calculate distance for these addresses.'
      );
      return;
    }

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      Alert.alert('Invalid item value', 'Enter a valid item value. Use 0 only if the item has no declared value.');
      return;
    }

    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      Alert.alert('Invalid budget', 'Enter a valid delivery budget.');
      return;
    }

    setLoading(true);
    let createdJob: Job | null = null;
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
      });
      createdJob = job;

      const totalAmount = job._totalAmount ?? parsedBudget;
      const paymentIntent = await createJobPaymentIntent(
        totalAmount,
        itemDescription.trim(),
        job.id
      );

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
          text: 'View delivery',
          onPress: () =>
            navigation.replace('JobDetails', { jobId: confirmedJob.id, mode: 'customer' }),
        },
      ]);
    } catch (error) {
      if (createdJob) {
        const pendingJob = createdJob;
        Alert.alert(
          'Payment not completed',
          error instanceof Error
            ? error.message
            : 'The delivery was created but payment could not be confirmed.',
          [
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
            <Text style={styles.label}>Helpers required</Text>
            <TextInput
              value={helpersRequired}
              onChangeText={setHelpersRequired}
              keyboardType="number-pad"
              editable={!loading}
            />
          </View>
          <Button
            title={loading ? 'Submitting...' : 'Submit delivery'}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
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
  },
  segmentButton: {
    flex: 1,
  },
});

export default BookDeliveryScreen;
