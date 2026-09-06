import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Button } from '@/components/Button';
import { StateView } from '@/components/StateView';
import { TextInput } from '@/components/TextInput';
import { colors, radii } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import {
  cancelVlvSubscription,
  createStripeConnectAccountSession,
  createStripeConnectOnboarding,
  fetchStripeConnectStatus,
  fetchVlvStatus,
  fetchWalletBalance,
  fetchWalletTransactions,
  requestWalletPayout,
  subscribeToVlv,
  topUpWallet,
  type StripeConnectStatus,
  type VlvStatus,
  type WalletTransaction,
} from '@/lib/api';
import { requireStripePublishableKey } from '@/lib/stripe';
import { formatCurrency, formatDateTime, titleCase } from '@/utils/format';

const WalletScreen: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const isDriver = profile?.role === 'driver';
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [connectStatus, setConnectStatus] = useState<StripeConnectStatus | null>(null);
  const [vlvStatus, setVlvStatus] = useState<VlvStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const load = useCallback(async () => {
    try {
      setError(null);
      const [wallet, walletTransactions, subscription] = await Promise.all([
        fetchWalletBalance(),
        fetchWalletTransactions(),
        fetchVlvStatus().catch(() => null),
      ]);
      setBalance(Number.isFinite(wallet.balance) ? wallet.balance : 0);
      setTransactions(Array.isArray(walletTransactions) ? walletTransactions : []);
      setVlvStatus(subscription);

      if (isDriver) {
        const status = await fetchStripeConnectStatus().catch(() => null);
        setConnectStatus(status);
      } else {
        setConnectStatus(null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load wallet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isDriver]);

  useEffect(() => {
    load();
  }, [load]);

  const openUrl = async (url: string | null | undefined, title: string) => {
    if (!url) {
      Alert.alert(title, 'The backend did not return a URL for this action.');
      return;
    }
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert(title, 'This device cannot open the returned backend URL.');
      return;
    }
    await Linking.openURL(url);
  };

  const handleTopUp = async () => {
    const amount = Number(topUpAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a positive wallet top-up amount.');
      return;
    }

    setSubmitting(true);
    try {
      requireStripePublishableKey();
      const transaction = await topUpWallet(amount, 'stripe');
      if (transaction.clientSecret) {
        const initResult = await initPaymentSheet({
          merchantDisplayName: 'VanLink',
          paymentIntentClientSecret: transaction.clientSecret,
          returnURL: 'vanlink://stripe-redirect',
        });
        if (initResult.error) {
          throw new Error(initResult.error.message);
        }

        const paymentResult = await presentPaymentSheet();
        if (paymentResult.error) {
          throw new Error(paymentResult.error.message);
        }
        Alert.alert(
          'Top-up paid',
          'Stripe accepted the payment. The backend webhook will confirm your wallet balance.'
        );
      } else {
        Alert.alert(
          'Top-up started',
          transaction.message ?? 'The backend created a pending wallet top-up.'
        );
      }
      setTopUpAmount('');
      await load();
    } catch (topUpError) {
      Alert.alert(
        'Top-up failed',
        topUpError instanceof Error ? topUpError.message : 'Unable to start wallet top-up.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayout = async () => {
    const amount = Number(payoutAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter a positive payout amount.');
      return;
    }

    setSubmitting(true);
    try {
      const payout = await requestWalletPayout(amount, 'weekly');
      Alert.alert(
        'Payout requested',
        `Backend status: ${payout.status ?? 'submitted'}`
      );
      setPayoutAmount('');
      await Promise.all([load(), refreshProfile()]);
    } catch (payoutError) {
      Alert.alert(
        'Payout failed',
        payoutError instanceof Error ? payoutError.message : 'Unable to request payout.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleConnect = async () => {
    setSubmitting(true);
    try {
      const accountSession = await createStripeConnectAccountSession().catch(() => null);
      if (accountSession?.clientSecret) {
        Alert.alert(
          'Stripe Connect',
          'The backend created an embedded onboarding session. Native embedded onboarding requires Stripe Connect SDK support before it can render in-app.'
        );
      }

      const onboarding = await createStripeConnectOnboarding();
      await openUrl(onboarding.url, 'Stripe Connect');
      await load();
    } catch (connectError) {
      Alert.alert(
        'Stripe Connect failed',
        connectError instanceof Error ? connectError.message : 'Unable to start onboarding.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVlvSubscribe = async () => {
    setSubmitting(true);
    try {
      const session = await subscribeToVlv();
      await openUrl(session.url, 'VLV subscription');
      await load();
    } catch (subscriptionError) {
      Alert.alert(
        'Subscription failed',
        subscriptionError instanceof Error
          ? subscriptionError.message
          : 'Unable to start VLV subscription.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleVlvCancel = async () => {
    setSubmitting(true);
    try {
      const result = await cancelVlvSubscription();
      Alert.alert('Subscription updated', result.message);
      await load();
    } catch (cancelError) {
      Alert.alert(
        'Cancel failed',
        cancelError instanceof Error ? cancelError.message : 'Unable to cancel VLV.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <StateView title="Loading wallet" loading />;
  if (error) {
    return (
      <StateView
        title="Could not load wallet"
        message={error}
        actionLabel="Retry"
        onAction={load}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
      >
        <View style={styles.balanceCard}>
          <Text style={styles.label}>Wallet balance</Text>
          <Text style={styles.balance}>{formatCurrency(balance)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Top up wallet</Text>
          <TextInput
            value={topUpAmount}
            onChangeText={setTopUpAmount}
            placeholder="Amount"
            keyboardType="decimal-pad"
            editable={!submitting}
          />
          <Button
            title="Start Stripe top-up"
            onPress={handleTopUp}
            loading={submitting}
            disabled={submitting}
          />
        </View>

        {isDriver ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Driver payouts</Text>
            <Text style={styles.muted}>
              Stripe Connect status: {connectStatus?.status ?? 'not loaded'}
            </Text>
            <Button
              title="Set up Stripe Connect"
              onPress={handleConnect}
              disabled={submitting}
              variant="secondary"
            />
            <TextInput
              value={payoutAmount}
              onChangeText={setPayoutAmount}
              placeholder="Payout amount"
              keyboardType="decimal-pad"
              editable={!submitting}
            />
            <Button
              title="Request weekly payout"
              onPress={handlePayout}
              loading={submitting}
              disabled={submitting}
            />
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>VLV</Text>
          <Text style={styles.muted}>
            {vlvStatus?.isVlvSubscribed
              ? `Active: ${titleCase(vlvStatus.subscriptionTier ?? 'VLV')}`
              : `Not active${vlvStatus ? ` - ${formatCurrency(vlvStatus.price)}/mo` : ''}`}
          </Text>
          {vlvStatus?.isVlvSubscribed ? (
            <Button
              title="Cancel VLV"
              onPress={handleVlvCancel}
              disabled={submitting}
              variant="secondary"
            />
          ) : (
            <Button
              title="Subscribe to VLV"
              onPress={handleVlvSubscribe}
              disabled={submitting}
              variant="secondary"
            />
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Transactions</Text>
          {transactions.length === 0 ? (
            <Text style={styles.muted}>No wallet transactions returned by the backend.</Text>
          ) : (
            transactions.map(transaction => (
              <View key={transaction.id} style={styles.transaction}>
                <View style={styles.transactionHeader}>
                  <Text style={styles.transactionTitle}>{titleCase(transaction.type)}</Text>
                  <Text style={styles.transactionAmount}>
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
                <Text style={styles.muted}>{titleCase(transaction.status)}</Text>
                {transaction.description ? (
                  <Text style={styles.description}>{transaction.description}</Text>
                ) : null}
                <Text style={styles.date}>{formatDateTime(transaction.createdAt)}</Text>
              </View>
            ))
          )}
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
  content: {
    padding: 20,
    gap: 16,
  },
  balanceCard: {
    backgroundColor: colors.text,
    borderRadius: radii.card,
    padding: 18,
    gap: 8,
  },
  label: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '800',
  },
  balance: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  muted: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  transaction: {
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
    paddingTop: 12,
    gap: 4,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  transactionTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  transactionAmount: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  description: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  date: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default WalletScreen;
