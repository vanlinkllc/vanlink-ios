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
import { VanLinkLogo } from '@/components/VanLinkLogo';
import { colors } from '@/constants/theme';
import { resetPassword } from '@/lib/api';
import type { AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const [token, setToken] = useState(route.params.token ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const role = route.params.role ?? 'customer';

  const handleSubmit = async () => {
    if (!token.trim() || password.length < 6) {
      Alert.alert(
        'Missing details',
        'Enter the reset token and a new password with at least 6 characters.'
      );
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token.trim(), password);
      Alert.alert('Password changed', 'You can now sign in with your new password.', [
        { text: 'Back to login', onPress: () => navigation.navigate('Login', { role }) },
      ]);
    } catch (error) {
      Alert.alert(
        'Reset failed',
        error instanceof Error ? error.message : 'Unable to reset your password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <VanLinkLogo />
        </View>
        <Text style={styles.title}>Enter reset token</Text>
        {route.params.email ? (
          <Text style={styles.subtitle}>Resetting password for {route.params.email}</Text>
        ) : (
          <Text style={styles.subtitle}>Use the token from your reset email.</Text>
        )}

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Reset token</Text>
            <TextInput
              placeholder="Token"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>New password</Text>
            <TextInput
              placeholder="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <Button
            title={loading ? 'Updating...' : 'Update password'}
            onPress={handleSubmit}
            loading={loading}
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
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
    textAlign: 'center',
  },
  form: {
    gap: 18,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
});

export default ResetPasswordScreen;
