import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { VanLinkLogo } from '@/components/VanLinkLogo';
import { colors, radii } from '@/constants/theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthRole, AuthStackParamList } from '@/types/navigation';

type Props = NativeStackScreenProps<AuthStackParamList, 'Landing'>;

interface LandingConfig {
  role: AuthRole;
  label: string;
  eyebrow: string;
  headline: string;
  accent: string;
  subheadingBold: string;
  subheadingMuted: string;
  cta: string;
  signInTarget: string;
  features: string[];
  ctaSubtext: string[];
  bottomHeading: string;
  bottomText: string;
}

const configs: Record<AuthRole, LandingConfig> = {
  customer: {
    role: 'customer',
    label: 'Customer',
    eyebrow: 'For customers',
    headline: 'Need a',
    accent: 'Van?',
    subheadingBold: 'Move anything without the hassle.',
    subheadingMuted: 'Book a trusted local driver in minutes.',
    cta: 'Find a Van',
    signInTarget: 'Sign in',
    features: ['Furniture', 'Collections', 'House Moves', '& More'],
    ctaSubtext: ['Takes ~60 seconds', 'No commitment'],
    bottomHeading: 'Simple. Fast. Reliable.',
    bottomText: 'Tell us what you need moved, get matched with the right driver, and track every step of the way.',
  },
  driver: {
    role: 'driver',
    label: 'Driver',
    eyebrow: 'For drivers',
    headline: 'Have a',
    accent: 'Van?',
    subheadingBold: 'Turn your spare capacity into earnings.',
    subheadingMuted: 'Choose your jobs. Work on your terms.',
    cta: 'Start Driving',
    signInTarget: 'Driver sign in',
    features: ['Local Jobs', 'Flexible Schedule', 'Choose Jobs', 'Fast Payouts'],
    ctaSubtext: ['Fast payouts', 'Choose your jobs', 'Work on your terms'],
    bottomHeading: 'Drive. Earn. Be in Control.',
    bottomText: "You're in charge. Pick the jobs that work for you and get paid fast.",
  },
};

const trustBadges = ['ID-verified drivers', 'Secure payments', 'GPS tracking'];

const LandingScreen: React.FC<Props> = ({ navigation }) => {
  const [activeRole, setActiveRole] = useState<AuthRole>('customer');
  const config = configs[activeRole];
  const accentColor = activeRole === 'driver' ? colors.driver : colors.customer;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <View style={styles.roleToggle}>
            {(['customer', 'driver'] as const).map(role => {
              const selected = activeRole === role;
              const selectedColor = role === 'driver' ? colors.driver : colors.customer;
              return (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleToggleItem,
                    selected && { backgroundColor: selectedColor },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setActiveRole(role)}
                >
                  <Text style={[styles.roleToggleText, selected && styles.roleToggleTextActive]}>
                    {configs[role].label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.logoWrap}>
          <VanLinkLogo />
          <Text style={styles.tagline}>Move anything. Anywhere.</Text>
        </View>

        <View style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: withAlpha(accentColor, 0.12) }]}>
            <Text style={[styles.heroIconText, { color: accentColor }]}>
              {activeRole === 'driver' ? 'DR' : 'CU'}
            </Text>
          </View>
          <Text style={[styles.eyebrow, { color: accentColor }]}>{config.eyebrow}</Text>
          <Text style={styles.title}>
            {config.headline} <Text style={{ color: accentColor }}>{config.accent}</Text>
          </Text>
          <Text style={styles.subheadingBold}>{config.subheadingBold}</Text>
          <Text style={styles.subheadingMuted}>{config.subheadingMuted}</Text>
        </View>

        <View style={styles.featureGrid}>
          {config.features.map(feature => (
            <View key={feature} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: withAlpha(accentColor, 0.1) }]} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.ctaBlock}>
          <Button
            title={`${config.cta}  >`}
            onPress={() => navigation.navigate('Login', { role: config.role })}
            style={[styles.primaryButton, { backgroundColor: accentColor }]}
          />
          <View style={styles.ctaMetaRow}>
            {config.ctaSubtext.map(text => (
              <Text key={text} style={styles.ctaMeta}>{text}</Text>
            ))}
          </View>
        </View>

        <View style={styles.trustRow}>
          {trustBadges.map(badge => (
            <Text key={badge} style={[styles.trustText, { color: accentColor }]}>
              {badge}
            </Text>
          ))}
        </View>

        <View style={styles.signInBlock}>
          <Text style={styles.signInPrompt}>Already have an account?</Text>
          <Button
            title={config.signInTarget}
            onPress={() => navigation.navigate('Login', { role: config.role })}
            variant="secondary"
            style={styles.signInButton}
          />
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.bottomHeading}>{config.bottomHeading}</Text>
          <Text style={styles.bottomText}>{config.bottomText}</Text>
        </View>

        {__DEV__ ? (
          <TouchableOpacity
            style={styles.qaButton}
            activeOpacity={0.75}
            onPress={() => navigation.navigate('DevQa')}
          >
            <Text style={styles.qaButtonText}>Development QA</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const withAlpha = (hex: string, alpha: number) => {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    paddingTop: 20,
    paddingBottom: 32,
  },
  topBar: {
    alignItems: 'flex-start',
  },
  roleToggle: {
    backgroundColor: colors.secondary,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 4,
  },
  roleToggleItem: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  roleToggleText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '800',
  },
  roleToggleTextActive: {
    color: colors.primaryText,
  },
  logoWrap: {
    alignItems: 'center',
    paddingTop: 24,
  },
  tagline: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 28,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    marginBottom: 10,
    width: 36,
  },
  heroIconText: {
    fontSize: 11,
    fontWeight: '900',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
    textAlign: 'center',
  },
  subheadingBold: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },
  subheadingMuted: {
    color: colors.mutedText,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 24,
  },
  featureCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.card,
    borderWidth: 1,
    gap: 9,
    justifyContent: 'center',
    minHeight: 92,
    padding: 12,
    width: '48.5%',
  },
  featureIcon: {
    borderRadius: 10,
    height: 36,
    width: 36,
  },
  featureText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  ctaBlock: {
    marginTop: 24,
  },
  primaryButton: {
    borderRadius: 16,
    height: 50,
  },
  ctaMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 16,
  },
  ctaMeta: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginTop: 18,
  },
  trustText: {
    fontSize: 12,
    fontWeight: '800',
  },
  signInBlock: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 30,
  },
  signInPrompt: {
    color: colors.mutedText,
    fontSize: 14,
  },
  signInButton: {
    alignSelf: 'stretch',
  },
  bottomSection: {
    borderColor: colors.border,
    borderTopWidth: 1,
    marginTop: 34,
    paddingTop: 32,
  },
  bottomHeading: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  bottomText: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  qaButton: {
    alignItems: 'center',
    backgroundColor: colors.warningBackground,
    borderColor: colors.warningBorder,
    borderRadius: radii.control,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    marginTop: 24,
  },
  qaButtonText: {
    color: colors.warningText,
    fontSize: 14,
    fontWeight: '800',
  },
});

export default LandingScreen;
