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
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{roleLabel} signup</Text>
        <Text style={styles.subtitle}>
          Create your VanLink account with the Railway backend.
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
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 12,
    marginBottom: 24,
  },
  backButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '700',
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
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  verificationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 12,
  },
  verificationTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
  },
  verificationText: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 19,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default SignupScreen;
