import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

interface VanLinkLogoProps {
  compact?: boolean;
}

export const VanLinkLogo: React.FC<VanLinkLogoProps> = ({ compact }) => (
  <View style={styles.container}>
    <View style={styles.mark}>
      <Text style={styles.markText}>VL</Text>
    </View>
    {!compact ? <Text style={styles.wordmark}>VanLink</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  markText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: '900',
  },
  wordmark: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
});
