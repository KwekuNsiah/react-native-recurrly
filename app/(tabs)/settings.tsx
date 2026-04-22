import AuthButton from "@/components/form/AuthButton";
import { useAuth } from "@clerk/expo";
import { styled } from "nativewind";
import React from "react";
import { Alert, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut, isLoaded } = useAuth();

  const handleLogout = async () => {
    if (!isLoaded) return;
    try {
      await signOut();
    } catch (err) {
      Alert.alert("Logout failed", "Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-2xl font-bold mb-8">Settings</Text>
      <View style={{ marginTop: 24 }}>
        <AuthButton label="Logout" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
};

export default Settings;
