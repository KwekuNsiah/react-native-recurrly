import clsx from "clsx";
import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

const AuthButton = ({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  testID,
}: AuthButtonProps) => {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      className={clsx(
        isPrimary ? "auth-button" : "auth-secondary-button",
        (disabled || loading) && isPrimary && "auth-button-disabled",
      )}
      onPress={onPress}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? "#081126" : "#ea7a53"} />
      ) : (
        <Text
          className={
            isPrimary ? "auth-button-text" : "auth-secondary-button-text"
          }
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

export default AuthButton;
