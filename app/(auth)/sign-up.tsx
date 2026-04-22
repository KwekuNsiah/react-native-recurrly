import AuthButton from "@/components/form/AuthButton";
import FormError from "@/components/form/FormError";
import FormInput from "@/components/form/FormInput";
import "@/global.css";
import { getClerkErrorMessage } from "@/lib/clerkErrors";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateVerificationCode,
} from "@/lib/validation";
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, useRouter, type Href } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isLoaded, authIsLoaded } = useAuth();

  // const posthog = usePostHog();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>(
    {},
  );
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);

  // Validation errors
  const emailError = fieldErrors.email || null;
  const passwordError = fieldErrors.password || null;
  const confirmPasswordError = fieldErrors.confirmPassword || null;
  const codeError = fieldErrors.code || null;

  // Clear errors when user starts typing
  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: null }));
    }
    if (formError) setFormError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: null }));
    }
    if (formError) setFormError(null);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (fieldErrors.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
    }
    if (formError) setFormError(null);
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
    if (fieldErrors.code) {
      setFieldErrors((prev) => ({ ...prev, code: null }));
    }
    if (formError) setFormError(null);
  };

  // Handle sign-up submission (first step)
  const handleSignUp = async () => {
    setFormError(null);
    setFieldErrors({});

    // Validate inputs
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmValidation = validatePasswordConfirmation(
      password,
      confirmPassword,
    );

    if (emailValidation || passwordValidation || confirmValidation) {
      const errors: Record<string, string> = {};
      if (emailValidation) {
        errors.email = emailValidation.message;
      }
      if (passwordValidation) {
        errors.password = passwordValidation.message;
      }
      if (confirmValidation) {
        errors.confirmPassword = confirmValidation.message;
      }
      setFieldErrors(errors);
      return;
    }

    if (!isLoaded) return;

    setIsLoading(true);
    try {
      const result = await signUp.password({
        emailAddress: email,
        password: password,
      });

      console.log("the result", result);

      if (signUp.status === "complete") {
        // Account created and verified
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log("Session task:", session.currentTask);
              return;
            }
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              // Web platform handling
              window.location.href = url;
            } else {
              router.push(url as Href);
            }
          },
        });
      } else if (signUp.status === "missing_requirements") {
        // Need to verify
        setVerificationCodeSent(true);
        await signUp.verifications.sendEmailCode();
      }
    } catch (error: any) {
      const friendlyError = getClerkErrorMessage(error);
      if (friendlyError.field) {
        setFieldErrors((prev) => ({
          ...prev,
          [friendlyError.field]: friendlyError.message,
        }));
      } else {
        setFormError(friendlyError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission (second step)
  const handleVerifyCode = async () => {
    setFormError(null);
    setFieldErrors({});

    const codeValidation = validateVerificationCode(code);
    if (codeValidation) {
      setFieldErrors({ code: codeValidation.message });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp.verifications.verifyEmailCode({
        code: code,
      });

      if (signUp.status === "complete") {
        // Verification successful, finalize sign-up
        await signUp.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log("Session task:", session.currentTask);
              return;
            }
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              window.location.href = url;
            } else {
              router.push(url as Href);
            }
          },
        });
      }
    } catch (error: any) {
      const friendlyError = getClerkErrorMessage(error);
      if (friendlyError.field) {
        setFieldErrors((prev) => ({
          ...prev,
          [friendlyError.field]: friendlyError.message,
        }));
      } else {
        setFormError(friendlyError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    setFormError(null);
    try {
      await signUp.verifications.sendEmailCode();
    } catch (error: any) {
      const friendlyError = getClerkErrorMessage(error);
      setFormError(friendlyError.message);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <ScrollView showsVerticalScrollIndicator={false} className="auth-scroll">
        <View className="auth-content">
          {/* Brand Section */}
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurrly</Text>
                <Text className="auth-wordmark-sub">Authentication</Text>
              </View>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text className="auth-title">
            {verificationCodeSent ? "Verify Your Email" : "Create Account"}
          </Text>
          <Text className="auth-subtitle">
            {verificationCodeSent
              ? "Enter the 6-digit code sent to your email"
              : "Sign up to manage your subscriptions"}
          </Text>

          {/* Error Alert */}
          <FormError error={formError} />

          {/* Form Card */}
          <View className="auth-card">
            {!verificationCodeSent ? (
              // Sign-up form
              <View className="auth-form">
                <FormInput
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  error={emailError}
                  enabled={!isLoading}
                />

                <FormInput
                  label="Password"
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  error={passwordError}
                  enabled={!isLoading}
                />

                <FormInput
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry
                  error={confirmPasswordError}
                  enabled={!isLoading}
                />

                <AuthButton
                  label="Create Account"
                  onPress={handleSignUp}
                  loading={isLoading}
                  disabled={
                    !email || !password || !confirmPassword || isLoading
                  }
                />
              </View>
            ) : (
              // Verification code form
              <View className="auth-form">
                <FormInput
                  label="Verification Code"
                  placeholder="000000"
                  value={code}
                  onChangeText={handleCodeChange}
                  keyboardType="numeric"
                  error={codeError}
                  enabled={!isLoading}
                />

                <AuthButton
                  label="Verify"
                  onPress={handleVerifyCode}
                  loading={isLoading}
                  disabled={!code || isLoading}
                />

                <AuthButton
                  label="Resend Code"
                  onPress={handleResendCode}
                  loading={isLoading}
                  variant="secondary"
                  disabled={isLoading}
                />
              </View>
            )}
          </View>

          {/* Link to Sign In */}
          {!verificationCodeSent && (
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account? </Text>
              <Link href="/(auth)/sign-in">
                <Text className="auth-link">Sign in</Text>
              </Link>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
