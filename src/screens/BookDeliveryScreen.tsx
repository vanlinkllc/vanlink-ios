import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { createJob } from '@/lib/api';
import type { CustomerStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<CustomerStackParamList, 'BookDelivery'>;

const BookDeliveryScreen: React.FC<Props> = ({ navigation }) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [budget, setBudget] = useState('');
  const [helpersRequired, setHelpersRequired] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const parsedBudget = Number(budget);
    const parsedValue = Number(itemValue || 0);
    const parsedHelpers = Number(helpersRequired || 0);

    if (!pickupAddress.trim() || !dropoffAddress.trim() || !itemDescription.trim()) {
      Alert.alert('Missing details', 'Pickup, dropoff, and item details are required.');
      return;
    }

    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      Alert.alert('Invalid budget', 'Enter a valid delivery budget.');
      return;
    }

    setLoading(true);
    try {
      const job = await createJob({
        pickupAddress: pickupAddress.trim(),
        dropoffAddress: dropoffAddress.trim(),
        itemDescription: itemDescription.trim(),
        itemValue: Number.isFinite(parsedValue) ? parsedValue : 0,
        budget: parsedBudget,
        pricingModel: 'fixed',
        helpersRequired: Number.isFinite(parsedHelpers) ? parsedHelpers : 0,
      });
      Alert.alert('Delivery booked', 'Your delivery has been submitted.', [
        {
          text: 'View delivery',
          onPress: () => navigation.replace('JobDetails', { jobId: job.id, mode: 'customer' }),
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
  formGroup: {
    gap: 8,
  },
  label: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default BookDeliveryScreen;
