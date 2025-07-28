import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: number;
  prefix?: string;
}

export const StatCard = ({ title, value, icon, change, prefix }: StatCardProps) => {
  const isPositiveChange = change && change > 0;
  const changeText = change ? `${isPositiveChange ? "+" : ""}${change}%` : undefined;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {prefix && <Text style={styles.prefix}>{prefix}</Text>}
          {value}
        </Text>
        {changeText && (
          <Text
            style={[
              styles.change,
              isPositiveChange ? styles.positiveChange : styles.negativeChange,
            ]}
          >
            {changeText}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  prefix: {
    fontSize: 16,
    fontWeight: "normal",
  },
  change: {
    fontSize: 12,
    fontWeight: "600",
  },
  positiveChange: {
    color: Colors.success,
  },
  negativeChange: {
    color: Colors.danger,
  },
});