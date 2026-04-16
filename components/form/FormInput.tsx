import clsx from "clsx";
import React from "react";
import { Text, TextInput, View } from "react-native";

const FormInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  error,
  enabled = true,
  editable = true,
}: FormInputProps) => {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <TextInput
        className={clsx("auth-input", error && "auth-input-error")}
        placeholder={placeholder}
        placeholderTextColor="rgba(0, 0, 0, 0.4)"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={editable && enabled}
        autoCapitalize="none"
      />
      {error && <Text className="auth-error">{error}</Text>}
    </View>
  );
};

export default FormInput;
