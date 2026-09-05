import React from 'react';
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInputFocusEventData,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  ViewStyle,
} from 'react-native';
import { colors, radii } from '@/constants/theme';

interface TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  editable?: boolean;
  style?: ViewStyle;
  keyboardType?: RNTextInputProps['keyboardType'];
  autoCapitalize?: RNTextInputProps['autoCapitalize'];
  multiline?: boolean;
  numberOfLines?: number;
  onFocus?: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  returnKeyType?: RNTextInputProps['returnKeyType'];
}

export const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  editable,
  style,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline,
  numberOfLines,
  onFocus,
  returnKeyType,
}) => {
  return (
    <RNTextInput
      style={[styles.input, multiline && styles.multilineInput, style]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      editable={editable}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      multiline={multiline}
      numberOfLines={numberOfLines}
      placeholderTextColor={colors.mutedText}
      onFocus={onFocus}
      returnKeyType={returnKeyType}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: radii.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'System',
  },
  multilineInput: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
});
