import React from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  ViewStyle,
} from 'react-native';

interface TextInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  editable?: boolean;
  style?: ViewStyle;
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'phone-pad'
    | 'decimal-pad'
    | 'visible-password';
}

export const TextInput: React.FC<TextInputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  editable,
  style,
  keyboardType = 'default',
}) => {
  return (
    <RNTextInput
      style={[styles.input, style]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      editable={editable}
      keyboardType={keyboardType}
      placeholderTextColor="#999"
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'System',
  },
});
