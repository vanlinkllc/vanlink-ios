import React from 'react';
import {
  SafeAreaView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radii } from '@/constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthRole, AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

interface RoleAction {
  title: string;
  description: string;
  role: AuthRole;
  meta: string;
}

const actions: RoleAction[] = [
  {
    title: 'Find a van',
    description: 'Get trusted local transport for furniture, store collections, and single-item moves.',
    role: 'customer',
    meta: 'Customer',
  },
  {
    title: 'Drive with us',
    description: 'Build your driver profile, set your availability, and find better local work.',
    role: 'driver',
    meta: 'Driver',
  },
];

const LandingScreen: React.FC<Props> = ({ navigation }) => {
  const openLogin = (role: AuthRole) => {
    navigation.navigate('Login', { role });
  };

  const openSignup = (role: AuthRole) => {
    navigation.navigate('Signup', { role });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>The smarter way to move</Text>
          <Text style={styles.title}>Move it your way.</Text>
          <Text style={styles.subtitle}>
            Book transport or drive with VanLink using the native app and Railway backend.
          </Text>
        </View>

        <View style={styles.actions}>
          {actions.map(action => (
            <Pressable
              key={action.role}
              style={({ pressed }) => [
                styles.actionCard,
                action.role === 'driver' && styles.driverCard,
                pressed && styles.actionCardPressed,
              ]}
              onPress={() => openLogin(action.role)}
            >
              <View style={styles.actionTopRow}>
                <Text style={styles.actionMeta}>{action.meta}</Text>
                <View style={styles.actionIcon}>
                  <Text style={styles.actionIconText}>{'>'}</Text>
                </View>
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>
                {action.description}
              </Text>
              <View style={styles.actionFooter}>
                <Text style={styles.actionLink}>Continue</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.signupSection}>
          <Text style={styles.signupPrompt}>New to VanLink?</Text>
          <View style={styles.signupButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.75}
              onPress={() => openSignup('customer')}
            >
              <Text style={styles.secondaryButtonText}>Customer signup</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.75}
              onPress={() => openSignup('driver')}
            >
              <Text style={styles.secondaryButtonText}>Driver signup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {__DEV__ ? (
          <View style={styles.qaSection}>
            <TouchableOpacity
              style={styles.qaButton}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('DevQa')}
            >
              <Text style={styles.qaButtonText}>Development QA</Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 36,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    textAlign: 'center',
    lineHeight: 23,
  },
  actions: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: colors.primary,
    borderRadius: radii.card,
    padding: 20,
    borderWidth: 1,
    borderColor: '#263740',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4,
  },
  driverCard: {
    backgroundColor: '#23343d',
  },
  actionCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  actionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  actionMeta: {
    color: '#b9c4c7',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  actionIconText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '900',
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryText,
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#d9dedc',
  },
  actionFooter: {
    marginTop: 18,
  },
  actionLink: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryText,
  },
  signupSection: {
    marginTop: 32,
    gap: 14,
  },
  signupPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedText,
    textAlign: 'center',
  },
  signupButtons: {
    gap: 12,
  },
  secondaryButton: {
    height: 48,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  qaSection: {
    marginTop: 20,
  },
  qaButton: {
    height: 44,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warningBackground,
  },
  qaButtonText: {
    color: colors.warningText,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LandingScreen;
