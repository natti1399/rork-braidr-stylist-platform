import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/colors";

interface AvatarProps {
  uri?: string;
  name: string;
  size?: "small" | "medium" | "large";
  style?: any;
}

export const Avatar = ({ uri, name, size = "medium", style }: AvatarProps) => {
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getSize = (): number => {
    switch (size) {
      case "small":
        return 32;
      case "medium":
        return 48;
      case "large":
        return 64;
      default:
        return 48;
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case "small":
        return 14;
      case "medium":
        return 18;
      case "large":
        return 24;
      default:
        return 18;
    }
  };

  const avatarSize = getSize();
  const fontSize = getFontSize();

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: avatarSize, height: avatarSize }]}
          contentFit="cover"
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    overflow: "hidden",
  },
  image: {
    borderRadius: 100,
  },
  placeholder: {
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: Colors.primary,
    fontWeight: "600",
  },
});