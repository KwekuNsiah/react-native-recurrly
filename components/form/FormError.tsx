import React from "react";
import { Text, View } from "react-native";

const FormError = ({ error, testID }: FormErrorProps) => {
  if (!error) return null;

  return (
    <View
      testID={testID}
      className="mb-4 rounded-2xl border border-destructive bg-destructive/10 p-3"
    >
      <Text className="text-sm font-sans-semibold text-destructive">
        {error}
      </Text>
    </View>
  );
};

export default FormError;
