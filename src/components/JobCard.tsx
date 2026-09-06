import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from '@/constants/theme';
import type { Job } from '@/lib/api';
import { formatCurrency, formatDateTime, titleCase } from '@/utils/format';

interface JobCardProps {
  job: Job;
  onPress: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => (
  <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={onPress}>
    <View style={styles.row}>
      <Text style={styles.title} numberOfLines={1}>
        {job.pickupAddress || 'Pickup address missing'}
      </Text>
      <Text style={styles.status}>{titleCase(job.status)}</Text>
    </View>
    {job.paymentStatus ? (
      <Text style={styles.paymentStatus}>Payment {titleCase(job.paymentStatus)}</Text>
    ) : null}
    <Text style={styles.route} numberOfLines={1}>
      To {job.dropoffAddress || 'dropoff address missing'}
    </Text>
    <Text style={styles.description} numberOfLines={2}>
      {job.itemDescription || 'No item description'}
    </Text>
    <View style={styles.metaRow}>
      <Text style={styles.meta}>{formatCurrency(job.finalPrice ?? job.budget)}</Text>
      <Text style={styles.meta}>{formatDateTime(job.scheduledTime ?? job.createdAt)}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  status: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  paymentStatus: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
  route: {
    color: colors.text,
    fontSize: 14,
  },
  description: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  meta: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
});
