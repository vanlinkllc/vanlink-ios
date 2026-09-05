import React from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { colors, radii } from '@/constants/theme';

type DevQaArea = 'auth' | 'customer' | 'driver';

interface DevQaScreenProps {
  area: DevQaArea;
  navigation: {
    navigate: (screen: string, params?: object) => void;
    getParent?: () => { navigate: (screen: string, params?: object) => void } | undefined;
  };
}

const unavailable = (screen: string) => {
  Alert.alert(
    'Requires backend data',
    `${screen} needs a real backend record ID. Open it from the related list so navigation receives the correct route params.`
  );
};

const DevQaScreen: React.FC<DevQaScreenProps> = ({ area, navigation }) => {
  if (!__DEV__) return null;

  const openTab = (screen: string) => {
    const parent = navigation.getParent?.();
    if (parent) {
      parent.navigate(screen);
      return;
    }

    navigation.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Development only</Text>
          <Text style={styles.title}>QA Navigation</Text>
          <Text style={styles.subtitle}>
            Opens existing screens through React Navigation. Screens that require a backend ID
            must still be opened from real backend lists.
          </Text>
        </View>

        {area === 'auth' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Auth</Text>
            <Button title="Landing" onPress={() => navigation.navigate('Landing')} variant="secondary" />
            <Button title="Customer login" onPress={() => navigation.navigate('Login', { role: 'customer' })} />
            <Button title="Driver login" onPress={() => navigation.navigate('Login', { role: 'driver' })} />
            <Button title="Customer signup" onPress={() => navigation.navigate('Signup', { role: 'customer' })} variant="secondary" />
            <Button title="Driver signup" onPress={() => navigation.navigate('Signup', { role: 'driver' })} variant="secondary" />
            <Button title="Forgot password" onPress={() => navigation.navigate('ForgotPassword', { role: 'customer' })} variant="secondary" />
            <Button title="Reset password" onPress={() => navigation.navigate('ResetPassword', { role: 'customer' })} variant="secondary" />
          </View>
        ) : null}

        {area === 'customer' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <Button title="Customer home" onPress={() => navigation.navigate('CustomerHome')} variant="secondary" />
            <Button title="Book delivery" onPress={() => navigation.navigate('BookDelivery')} />
            <Button title="Deliveries" onPress={() => navigation.navigate('Deliveries')} variant="secondary" />
            <Button title="Wallet" onPress={() => openTab('Wallet')} variant="secondary" />
            <Button title="Notifications" onPress={() => openTab('Notifications')} variant="secondary" />
            <Button title="Account" onPress={() => openTab('Account')} variant="secondary" />
            <Button title="Delivery details" onPress={() => unavailable('Delivery details')} disabled />
          </View>
        ) : null}

        {area === 'driver' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver</Text>
            <Button title="Driver home" onPress={() => navigation.navigate('DriverHome')} variant="secondary" />
            <Button title="Available jobs" onPress={() => navigation.navigate('DriverJobs', { list: 'available' })} />
            <Button title="My jobs" onPress={() => navigation.navigate('DriverJobs', { list: 'mine' })} variant="secondary" />
            <Button title="Active job" onPress={() => navigation.navigate('ActiveJob')} variant="secondary" />
            <Button title="Wallet" onPress={() => openTab('Wallet')} variant="secondary" />
            <Button title="Notifications" onPress={() => openTab('Notifications')} variant="secondary" />
            <Button title="Account" onPress={() => openTab('Account')} variant="secondary" />
            <Button title="Job details" onPress={() => unavailable('Job details')} disabled />
            <Button title="Route" onPress={() => unavailable('Route')} disabled />
          </View>
        ) : null}
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
    gap: 18,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default DevQaScreen;
