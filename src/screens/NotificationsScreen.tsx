import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from '@/components/Button';
import { StateView } from '@/components/StateView';
import {
  clearAllNotifications,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type Notification,
} from '@/lib/api';
import { formatDateTime, titleCase } from '@/utils/format';

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [items, unread] = await Promise.all([
        fetchNotifications(),
        fetchUnreadNotificationCount(),
      ]);
      setNotifications(Array.isArray(items) ? items : []);
      setUnreadCount(Number.isFinite(unread.count) ? unread.count : 0);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load notifications.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (notification: Notification) => {
    if (notification.isRead || submitting) return;
    setSubmitting(true);
    try {
      const updated = await markNotificationRead(notification.id);
      setNotifications(current =>
        current.map(item => (item.id === updated.id ? updated : item))
      );
      setUnreadCount(count => Math.max(0, count - 1));
    } catch (markError) {
      Alert.alert(
        'Could not mark read',
        markError instanceof Error ? markError.message : 'Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAllRead = async () => {
    setSubmitting(true);
    try {
      await markAllNotificationsRead();
      setNotifications(current => current.map(item => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (markError) {
      Alert.alert(
        'Could not update notifications',
        markError instanceof Error ? markError.message : 'Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearAll = async () => {
    Alert.alert('Clear notifications', 'Remove all notifications from your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear all',
        style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          try {
            await clearAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
          } catch (clearError) {
            Alert.alert(
              'Could not clear notifications',
              clearError instanceof Error ? clearError.message : 'Please try again.'
            );
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  if (loading) return <StateView title="Loading notifications" loading />;
  if (error) {
    return (
      <StateView
        title="Could not load notifications"
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
        <View style={styles.header}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>{unreadCount} unread</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Mark all read"
            onPress={handleMarkAllRead}
            disabled={submitting || unreadCount === 0}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="Clear all"
            onPress={handleClearAll}
            disabled={submitting || notifications.length === 0}
            variant="secondary"
            style={styles.actionButton}
          />
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>
              Updates from VanLink will appear here when the backend sends them.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map(notification => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.card,
                  !notification.isRead && styles.unreadCard,
                ]}
                activeOpacity={notification.isRead ? 1 : 0.75}
                onPress={() => handleMarkRead(notification)}
                disabled={notification.isRead || submitting}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{notification.title}</Text>
                  <Text style={styles.type}>{titleCase(notification.type)}</Text>
                </View>
                <Text style={styles.message}>{notification.message}</Text>
                <Text style={styles.date}>{formatDateTime(notification.createdAt)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 8,
  },
  unreadCard: {
    borderColor: '#111827',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  type: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '800',
  },
  message: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
  },
  date: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default NotificationsScreen;
