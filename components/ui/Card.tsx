import { ReactNode } from "react";
import { StyleSheet, View, ViewProps } from "react-native";

import { Colors } from "@/constants/colors";

interface CardProps extends ViewProps {
  children: ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "small" | "medium" | "large";
}

export const Card = ({
  children,
  variant = "default",
  padding = "medium",
  style,
  ...props
}: CardProps) => {
  return (
    <View
      style={[
        styles.card,
        styles[variant],
        padding === 'none' ? styles.paddingNone : 
        padding === 'small' ? styles.paddingSmall : 
        padding === 'medium' ? styles.paddingMedium : 
        styles.paddingLarge,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: Colors.background.primary,
  },
  default: {},
  elevated: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: 8,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },
});