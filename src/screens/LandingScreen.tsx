import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthRole, AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

interface RoleAction {
  title: string;
  description: string;
  role: AuthRole;
}

const actions: RoleAction[] = [
  {
    title: 'Find a van',
    description: 'Book transport and manage your VanLink jobs.',
    role: 'customer',
  },
  {
    title: 'Drive with us',
    description: 'Sign in or apply to accept VanLink driver jobs.',
    role: 'driver',
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
          <Text style={styles.title}>VanLink</Text>
          <Text style={styles.subtitle}>Logistics made easy</Text>
        </View>

        <View style={styles.actions}>
          {actions.map(action => (
            <TouchableOpacity
              key={action.role}
              style={styles.actionCard}
              activeOpacity={0.75}
              onPress={() => openLogin(action.role)}
            >
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>
                {action.description}
              </Text>
              <View style={styles.actionFooter}>
                <Text style={styles.actionLink}>Continue</Text>
              </View>
            </TouchableOpacity>
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
    paddingTop: 48,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  actions: {
    gap: 16,
  },
  actionCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 20,
  },
  actionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#d1d5db',
  },
  actionFooter: {
    marginTop: 18,
  },
  actionLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  signupSection: {
    marginTop: 32,
    gap: 14,
  },
  signupPrompt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
  },
  signupButtons: {
    gap: 12,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
});

export default LandingScreen;
