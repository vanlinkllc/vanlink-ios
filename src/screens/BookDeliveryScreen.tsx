import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStripe } from '@stripe/stripe-react-native';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { useAuth } from '@/hooks/useAuth';
import { confirmJobPayment, createJob, createJobPaymentIntent } from '@/lib/api';
import { requireStripePublishableKey, STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';
import type { CustomerStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<CustomerStackParamList, 'BookDelivery'>;

const BookDeliveryScreen: React.FC<Props> = ({ navigation }) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [budget, setBudget] = useState('');
  const [helpersRequired, setHelpersRequired] = useState('0');
  const [pricingModel, setPricingModel] = useState<'fixed' | 'bid'>('fixed');
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { profile } = useAuth();

  const handleSubmit = async () => {
    const parsedBudget = Number(budget);
    const parsedValue = Number(itemValue);
    const parsedHelpers = Number(helpersRequired || 0);

    if (!pickupAddress.trim() || !dropoffAddress.trim() || !itemDescription.trim()) {
      Alert.alert('Missing details', 'Pickup, dropoff, and item details are required.');
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
    try {
      if (!STRIPE_PUBLISHABLE_KEY && (profile?.walletBalance ?? 0) < parsedBudget) {
        throw new Error(
          'Stripe publishable key is not configured. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY before taking card payments.'
        );
      }

      const paymentIntent = await createJobPaymentIntent(
        parsedBudget,
        itemDescription.trim()
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

      const job = await createJob({
        pickupAddress: pickupAddress.trim(),
        dropoffAddress: dropoffAddress.trim(),
        itemDescription: itemDescription.trim(),
        itemValue: parsedValue,
        budget: parsedBudget,
        pricingModel,
        helpersRequired: Number.isFinite(parsedHelpers) ? parsedHelpers : 0,
        stripePaymentIntentId: paymentIntent.paymentIntentId ?? undefined,
      });
      const confirmedJob = await confirmJobPayment(job.id, paymentIntent.paymentIntentId);
      Alert.alert('Delivery booked', 'Your payment was confirmed by the backend.', [
        {
          text: 'View delivery',
          onPress: () =>
            navigation.replace('JobDetails', { jobId: confirmedJob.id, mode: 'customer' }),
        },
      ]);
    } catch (error) {
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
          <View style={styles.blockedCard}>
            <Text style={styles.blockedTitle}>Google address tools pending</Text>
            <Text style={styles.blockedText}>
              Address autocomplete, geocoding, and route distance are blocked until
              backend-controlled Google endpoints are added. Enter addresses manually.
            </Text>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Pickup address</Text>
            <TextInput value={pickupAddress} onChangeText={setPickupAddress} editable={!loading} />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Dropoff address</Text>
            <TextInput value={dropoffAddress} onChangeText={setDropoffAddress} editable={!loading} />
          </View>
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
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  blockedCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    padding: 14,
    gap: 6,
  },
  blockedTitle: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '800',
  },
  blockedText: {
    color: '#92400e',
    fontSize: 13,
    lineHeight: 19,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    color: '#111827',
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
