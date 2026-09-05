import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { forgotPassword } from '@/lib/api';
import type { AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const role = route.params.role;

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Email required', 'Enter the email address on your VanLink account.');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(trimmedEmail);
      Alert.alert(
        'Check your email',
        response.message,
        [
          {
            text: 'Enter token',
            onPress: () =>
              navigation.navigate('ResetPassword', {
                role,
                email: trimmedEmail,
              }),
          },
          {
            text: 'Back to login',
            onPress: () => navigation.navigate('Login', { role }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Reset request failed',
        error instanceof Error ? error.message : 'Unable to request a password reset.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Enter your email. VanLink will send a reset link from the backend.
        </Text>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          <Button
            title={loading ? 'Sending...' : 'Send reset instructions'}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
          <Button
            title="I already have a token"
            onPress={() => navigation.navigate('ResetPassword', { role })}
            variant="secondary"
            disabled={loading}
          />
          <Button
            title="Back to login"
            onPress={() => navigation.navigate('Login', { role })}
            variant="secondary"
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    color: '#111827',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  form: {
    gap: 18,
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

export default ForgotPasswordScreen;
