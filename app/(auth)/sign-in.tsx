import AuthButton from "@/components/form/AuthButton";
import FormError from "@/components/form/FormError";
import FormInput from "@/components/form/FormInput";
import "@/global.css";
import { getClerkErrorMessage } from "@/lib/clerkErrors";
import {
  validateSignInEmail,
  validateSignInPassword,
  validateVerificationCode,
} from "@/lib/validation";
import { useSignIn } from "@clerk/expo";
import { Link, useRouter, type Href } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useSignIn();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>(
    {},
  );
  const [showMFACode, setShowMFACode] = useState(false);

  // Validation errors
  const emailError = fieldErrors.email || null;
  const passwordError = fieldErrors.password || null;
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

  const handleCodeChange = (text: string) => {
    setCode(text);
    if (fieldErrors.code) {
      setFieldErrors((prev) => ({ ...prev, code: null }));
    }
    if (formError) setFormError(null);
  };

  // Handle sign-in submission
  const handleSignIn = async () => {
    setFormError(null);
    setFieldErrors({});

    // Validate inputs
    const emailValidation = validateSignInEmail(email);
    const passwordValidation = validateSignInPassword(password);

    if (emailValidation || passwordValidation) {
      const errors: Record<string, string> = {};
      if (emailValidation) {
        errors.email = emailValidation.message;
      }
      if (passwordValidation) {
        errors.password = passwordValidation.message;
      }
      setFieldErrors(errors);
      return;
    }

    if (!signIn) return;

    setIsLoading(true);
    try {
      const result = await signIn.password({
        emailAddress: email,
        password: password,
      });

      if (result?.status === "complete") {
        // Sign-in successful
        await result.finalize({
          navigate: ({ session, decorateUrl }: any) => {
            if (session?.currentTask) {
              console.log("Session task:", session.currentTask);
              return;
            }
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              (window as any).location.href = url;
            } else {
              router.push(url as Href);
            }
          },
        });
      } else if (result?.status === "needs_client_trust") {
        // MFA required - send email code
        setShowMFACode(true);
        const emailCodeFactor = result.supportedSecondFactors?.find(
          (factor: any) => factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          try {
            await signIn.mfa.sendEmailCode();
          } catch (error: any) {
            const friendlyError = getClerkErrorMessage(error);
            setFormError(friendlyError.message);
          }
        }
      } else if (result?.status === "needs_second_factor") {
        // Handle other second factor strategies
        setShowMFACode(true);
        const emailCodeFactor = result.supportedSecondFactors?.find(
          (factor: any) => factor.strategy === "email_code",
        );

        if (emailCodeFactor) {
          try {
            await signIn.mfa.sendEmailCode();
          } catch (error: any) {
            const friendlyError = getClerkErrorMessage(error);
            setFormError(friendlyError.message);
          }
        }
      } else {
        // Unexpected status
        setFormError("Sign-in failed. Please try again.");
      }
    } catch (error: any) {
      const friendlyError = getClerkErrorMessage(error);
      if (friendlyError.field) {
        setFieldErrors((prev) => ({
          ...prev,
          [friendlyError.field!]: friendlyError.message,
        }));
      } else {
        setFormError(friendlyError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle MFA code submission
  const handleVerifyMFA = async () => {
    setFormError(null);
    setFieldErrors({});

    const codeValidation = validateVerificationCode(code);
    if (codeValidation) {
      setFieldErrors({ code: codeValidation.message });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn.mfa.verifyEmailCode({
        code: code,
      });

      if (result?.status === "complete") {
        // MFA verification successful
        await result.finalize({
          navigate: ({ session, decorateUrl }: any) => {
            if (session?.currentTask) {
              console.log("Session task:", session.currentTask);
              return;
            }
            const url = decorateUrl("/");
            if (url.startsWith("http")) {
              (window as any).location.href = url;
            } else {
              router.push(url as Href);
            }
          },
        });
      } else {
        setFormError("MFA verification failed. Please try again.");
      }
    } catch (error: any) {
      const friendlyError = getClerkErrorMessage(error);
      if (friendlyError.field) {
        setFieldErrors((prev) => ({
          ...prev,
          [friendlyError.field!]: friendlyError.message,
        }));
      } else {
        setFormError(friendlyError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend MFA code
  const handleResendMFACode = async () => {
    setFormError(null);
    try {
      await signIn.mfa.sendEmailCode();
    } catch (error: any) {
      const friendlyError = getClerkErrorMessage(error);
      setFormError(friendlyError.message);
    }
  };

  // Go back to email/password screen
  const handleBackToSignIn = () => {
    setShowMFACode(false);
    setCode("");
    setFormError(null);
    setFieldErrors({});
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
            {showMFACode ? "Verify Your Identity" : "Sign in"}
          </Text>
          <Text className="auth-subtitle">
            {showMFACode
              ? "Enter the 6-digit code sent to your email"
              : "Enter your credentials to continue"}
          </Text>

          {/* Error Alert */}
          <FormError error={formError} />

          {/* Form Card */}
          <View className="auth-card">
            {!showMFACode ? (
              // Sign-in form
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
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry
                  error={passwordError}
                  enabled={!isLoading}
                />

                <AuthButton
                  label="Continue"
                  onPress={handleSignIn}
                  loading={isLoading}
                  disabled={!email || !password || isLoading}
                />
              </View>
            ) : (
              // MFA verification form
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
                  onPress={handleVerifyMFA}
                  loading={isLoading}
                  disabled={!code || isLoading}
                />

                <AuthButton
                  label="Resend Code"
                  onPress={handleResendMFACode}
                  loading={isLoading}
                  variant="secondary"
                  disabled={isLoading}
                />

                <AuthButton
                  label="Start Over"
                  onPress={handleBackToSignIn}
                  loading={isLoading}
                  variant="secondary"
                  disabled={isLoading}
                />
              </View>
            )}
          </View>

          {/* Link to Sign Up */}
          {!showMFACode && (
            <View className="auth-link-row">
              <Text className="auth-link-copy">Don't have an account? </Text>
              <Link href="/(auth)/sign-up">
                <Text className="auth-link">Sign up</Text>
              </Link>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
