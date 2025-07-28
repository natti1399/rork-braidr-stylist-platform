import { Image } from "expo-image";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/colors";
import { Conversation } from "@/types";

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
}

export const ConversationItem = ({ conversation, onPress }: ConversationItemProps) => {
  // Get the other participant (customer)
  const customer = conversation.participants.find((p) => p.type === "customer");
  
  // Format timestamp
  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    
    // If this week, show day name
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {customer?.avatar ? (
          <Image
            source={{ uri: customer.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Text style={styles.placeholderText}>
              {customer?.name.charAt(0) || "?"}
            </Text>
          </View>
        )}
        {conversation.unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{customer?.name || "Unknown"}</Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(conversation.lastMessage?.timestamp)}
          </Text>
        </View>
        
        <Text
          style={[
            styles.message,
            conversation.unreadCount > 0 && styles.unreadMessage,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {conversation.lastMessage?.content || "No messages yet"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  placeholderAvatar: {
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
  },
  badge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: Colors.text.light,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  message: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  unreadMessage: {
    fontWeight: "600",
    color: Colors.text.primary,
  },
});