import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { VanLinkLogo } from '@/components/VanLinkLogo';
import { colors } from '@/constants/theme';
import type { AuthRole, AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const role = route.params.role;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const roleLabel = role === 'driver' ? 'Driver' : 'Customer';
  const accentColor = role === 'driver' ? colors.driver : colors.customer;

  const switchRole = (nextRole: AuthRole) => {
    if (nextRole !== role) navigation.setParams({ role: nextRole });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const { error, role: backendRole } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error);
      return;
    }

    if (backendRole !== role) {
      Alert.alert(
        'Account type mismatch',
        `Signed in as ${backendRole}. VanLink will open your correct account area.`
      );
    }
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

        <View style={styles.roleToggle}>
          {(['customer', 'driver'] as const).map(option => {
            const selected = option === role;
            const optionColor = option === 'driver' ? colors.driver : colors.customer;
            return (
              <TouchableOpacity
                key={option}
                style={[styles.roleToggleItem, selected && { backgroundColor: optionColor }]}
                activeOpacity={0.75}
                onPress={() => switchRole(option)}
                disabled={loading}
              >
                <Text style={[styles.roleToggleText, selected && styles.roleToggleTextActive]}>
                  {option === 'driver' ? 'Driver' : 'Customer'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.title}>{roleLabel} login</Text>
        <Text style={styles.subtitle}>
          {role === 'driver' ? 'Access your driver portal & wallet' : 'Access your account & bookings'}
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

          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <Button
            title={loading ? 'Logging in...' : 'Sign In'}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={{ backgroundColor: accentColor }}
          />

          <TouchableOpacity
            style={styles.forgotButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ForgotPassword', { role })}
            disabled={loading}
          >
            <Text style={styles.forgotButtonText}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.signupPrompt}>
            Don't have an account?
          </Text>
          <TouchableOpacity
            style={styles.signupButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Signup', { role })}
          >
            <Text style={styles.signupButtonText}>
              Create {roleLabel.toLowerCase()} account
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
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 40,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 28,
  },
  roleToggle: {
    backgroundColor: colors.secondary,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    marginBottom: 28,
    padding: 4,
  },
  roleToggleItem: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  roleToggleText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '800',
  },
  roleToggleTextActive: {
    color: colors.primaryText,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    gap: 18,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.mutedText,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  forgotButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  forgotButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  signupPrompt: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
  },
  signupButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  signupButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LoginScreen;
