import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';

const AccountScreen: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        onPress: async () => {
          setLoading(true);
          await signOut();
          setLoading(false);
        },
        style: 'destructive',
      },
    ]);
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.firstName.charAt(0)}
            {profile.lastName.charAt(0)}
          </Text>
        </View>
        <Text style={styles.name}>
          {profile.firstName} {profile.lastName}
        </Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>VanLink ID</Text>
          <Text style={styles.infoValue}>{profile.vanlinkId}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>
            {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
          </Text>
        </View>

        {profile.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{profile.phone}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Verified</Text>
          <Text style={styles.infoValue}>
            {profile.isVerified ? '✓ Verified' : 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rating</Text>
          <Text style={styles.infoValue}>{profile.rating.toFixed(1)} ⭐</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Ratings</Text>
          <Text style={styles.infoValue}>{profile.totalRatings}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jobs Completed</Text>
          <Text style={styles.infoValue}>{profile.jobsCompleted}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Acceptance Rate</Text>
          <Text style={styles.infoValue}>
            {(profile.acceptanceRate * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cancellation Rate</Text>
          <Text style={styles.infoValue}>
            {(profile.cancellationRate * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Button
          title={loading ? 'Signing out...' : 'Sign Out'}
          onPress={handleLogout}
          loading={loading}
          disabled={loading}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default AccountScreen;
