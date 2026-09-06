import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { VanLinkLogo } from '@/components/VanLinkLogo';
import { colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { sendEmailCode, verifyEmailCode } from '@/lib/api';
import type { AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const SignupScreen: React.FC<Props> = ({ navigation, route }) => {
  const role = route.params.role;
  const { signUp } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleLabel = role === 'driver' ? 'Driver' : 'Customer';
  const accentColor = role === 'driver' ? colors.driver : colors.customer;

  const trimmedEmail = email.trim().toLowerCase();

  const validateAccountFields = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      Alert.alert('Missing details', 'Please complete all required fields.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use a password with at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    if (!validateAccountFields()) return;
    setLoading(true);
    try {
      const response = await sendEmailCode(trimmedEmail);
      setCodeSent(true);
      setEmailVerified(false);
      Alert.alert('Verification code sent', response.message);
    } catch (sendError) {
      Alert.alert(
        'Could not send code',
        sendError instanceof Error ? sendError.message : 'Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.trim();
    if (code.length !== 6) {
      Alert.alert('Invalid code', 'Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      const response = await verifyEmailCode(trimmedEmail, code);
      setEmailVerified(true);
      Alert.alert('Email verified', response.message);
    } catch (verifyError) {
      Alert.alert(
        'Verification failed',
        verifyError instanceof Error ? verifyError.message : 'Please request a new code.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateAccountFields()) return;
    if (!emailVerified) {
      Alert.alert('Verify email first', 'Enter the 6-digit code sent to your email before creating the account.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(trimmedEmail, password, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      role,
    });
    setLoading(false);

    if (error) Alert.alert('Signup failed', error);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <VanLinkLogo />
        </View>

        <Text style={styles.title}>{roleLabel} signup</Text>
        <Text style={styles.subtitle}>
          {role === 'driver'
            ? 'Create your driver profile and start earning with VanLink.'
            : 'Book trusted local drivers in minutes.'}
        </Text>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
                editable={!loading}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
                editable={!loading}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="your@email.com"
              value={email}
              onChangeText={text => {
                setEmail(text);
                setEmailVerified(false);
                setCodeSent(false);
                setVerificationCode('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.verificationCard}>
            <Text style={styles.verificationTitle}>Email verification</Text>
            <Text style={styles.verificationText}>
              VanLink sends a 6-digit code before account creation.
            </Text>
            <Button
              title={codeSent ? 'Send new code' : 'Send verification code'}
              onPress={handleSendCode}
              loading={loading && !codeSent}
              disabled={loading}
              variant="secondary"
            />
            {codeSent ? (
              <View style={styles.formGroup}>
                <Text style={styles.label}>6-digit code</Text>
                <TextInput
                  placeholder="123456"
                  value={verificationCode}
                  onChangeText={text => {
                    setVerificationCode(text);
                    setEmailVerified(false);
                  }}
                  keyboardType="number-pad"
                  editable={!loading}
                />
                <Button
                  title={emailVerified ? 'Email verified' : 'Verify code'}
                  onPress={handleVerifyCode}
                  loading={loading && codeSent && !emailVerified}
                  disabled={loading || emailVerified}
                  style={{ backgroundColor: accentColor }}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              placeholder="Phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <Button
            title={loading ? 'Creating account...' : `Create ${roleLabel} account`}
            onPress={handleSignup}
            loading={loading}
            disabled={loading || !emailVerified}
            style={{ backgroundColor: accentColor }}
          />

          <TouchableOpacity
            style={styles.switchButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login', { role })}
          >
            <Text style={styles.switchButtonText}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
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
  container: {
    flex: 1,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 8,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
  },
  verificationCard: {
    backgroundColor: colors.secondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 12,
  },
  verificationTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  verificationText: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default SignupScreen;
