import type { ImageSourcePropType } from "react-native";

declare global {
  interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
  }

  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }

  interface Subscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    plan?: string;
    category?: string;
    paymentMethod?: string;
    status?: string;
    startDate?: string;
    price: number;
    currency?: string;
    billing: string;
    renewalDate?: string;
    color?: string;
  }

  interface SubscriptionCardProps extends Omit<Subscription, "id"> {
    expanded: boolean;
    onPress: () => void;
    onCancelPress?: () => void;
    isCancelling?: boolean;
  }

  interface UpcomingSubscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    price: number;
    currency?: string;
    daysLeft: number;
  }

  interface UpcomingSubscriptionCardProps extends Omit<
    UpcomingSubscription,
    "id"
  > {}

  interface ListHeadingProps {
    title: string;
  }

  // Auth Form Types
  interface SignUpFormData {
    email: string;
    password: string;
    confirmPassword: string;
  }

  interface SignInFormData {
    email: string;
    password: string;
  }

  interface VerificationFormData {
    code: string;
  }

  interface AuthError {
    message: string;
    code?: string;
    field?: string;
  }

  interface FormInputProps {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?:
      | "default"
      | "numeric"
      | "decimal-pad"
      | "email-address"
      | "phone-pad"
      | "url"
      | "web-search";
    secureTextEntry?: boolean;
    error?: string | null;
    enabled?: boolean;
    editable?: boolean;
  }

  interface AuthButtonProps {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: "primary" | "secondary";
    testID?: string;
  }

  interface FormErrorProps {
    error?: string | null;
    testID?: string;
  }
}

export {};
