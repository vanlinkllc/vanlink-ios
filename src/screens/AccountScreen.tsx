import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import { StateView } from '@/components/StateView';
import { titleCase } from '@/utils/format';

const AccountScreen: React.FC = () => {
  const { profile, signOut, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeNumber = (value: number | undefined) =>
    Number.isFinite(value) ? Number(value) : 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      setError(null);
      await refreshProfile();
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Unable to refresh account.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
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
      <StateView
        title="Account unavailable"
        message="Your profile could not be loaded."
        actionLabel="Retry"
        onAction={handleRefresh}
      />
    );
  }

  const firstInitial = profile.firstName?.charAt(0) || 'V';
  const lastInitial = profile.lastName?.charAt(0) || 'L';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {firstInitial}
            {lastInitial}
          </Text>
        </View>
        <Text style={styles.name}>
          {profile.firstName || 'VanLink'} {profile.lastName || 'User'}
        </Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>

      {error ? (
        <View style={styles.errorSection}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>VanLink ID</Text>
          <Text style={styles.infoValue}>{profile.vanlinkId}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role</Text>
          <Text style={styles.infoValue}>{titleCase(profile.role)}</Text>
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
          <Text style={styles.infoValue}>{safeNumber(profile.rating).toFixed(1)} stars</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Total Ratings</Text>
          <Text style={styles.infoValue}>{profile.totalRatings}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Jobs Completed</Text>
          <Text style={styles.infoValue}>{safeNumber(profile.jobsCompleted)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Acceptance Rate</Text>
          <Text style={styles.infoValue}>
            {(safeNumber(profile.acceptanceRate) * 100).toFixed(0)}%
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cancellation Rate</Text>
          <Text style={styles.infoValue}>
            {(safeNumber(profile.cancellationRate) * 100).toFixed(0)}%
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
  errorSection: {
    margin: 16,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
    lineHeight: 20,
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
