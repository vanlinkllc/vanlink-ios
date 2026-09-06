import React from 'react';
import {
  StyleSheet,
  Pressable,
  Text,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, radii } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading,
  disabled,
  style,
  variant = 'primary',
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.primaryText : colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' ? styles.primaryText : styles.secondaryText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    borderRadius: radii.control,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
  },
  primaryText: {
    color: colors.primaryText,
  },
  secondaryText: {
    color: colors.text,
  },
});
