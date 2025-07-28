import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Send } from "lucide-react-native";
import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Colors } from "@/constants/colors";
import { useConversations } from "@/context/StylistContext";
import { Message } from "@/types";

export default function ConversationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConversationById, sendMessage } = useConversations();
  
  const conversation = getConversationById(id!);
  const [messageText, setMessageText] = useState("");
  
  if (!conversation) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Conversation not found</Text>
      </View>
    );
  }
  
  const customer = conversation.participants.find((p) => p.type === "customer");
  
  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    try {
      await sendMessage(conversation.id, {
        id: Date.now().toString(),
        text: messageText.trim(),
        senderId: "stylist",
        timestamp: new Date().toISOString(),
        type: "text",
      });
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  const renderMessage = ({ item }: { item: Message }) => {
    const isFromStylist = item.senderId === "stylist";
    
    return (
      <View style={[
        styles.messageContainer,
        isFromStylist ? styles.stylistMessage : styles.customerMessage,
      ]}>
        {!isFromStylist && (
          <View style={styles.messageAvatar}>
            <Avatar 
              uri={customer?.avatar} 
              name={customer?.name || "Customer"} 
              size="small" 
            />
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isFromStylist ? styles.stylistBubble : styles.customerBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isFromStylist ? styles.stylistMessageText : styles.customerMessageText,
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            isFromStylist ? styles.stylistMessageTime : styles.customerMessageTime,
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Avatar 
          uri={customer?.avatar} 
          name={customer?.name || "Customer"} 
          size="medium" 
        />
        <View style={styles.headerInfo}>
          <Text style={styles.customerName}>{customer?.name}</Text>
          <Text style={styles.customerStatus}>Online</Text>
        </View>
      </View>
      
      <FlatList
        data={conversation.messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        inverted
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.text.secondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            !messageText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Send size={20} color={messageText.trim() ? Colors.text.light : Colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  customerStatus: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  stylistMessage: {
    justifyContent: "flex-end",
  },
  customerMessage: {
    justifyContent: "flex-start",
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  stylistBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  customerBubble: {
    backgroundColor: Colors.background.secondary,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  stylistMessageText: {
    color: Colors.text.light,
  },
  customerMessageText: {
    color: Colors.text.primary,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  stylistMessageTime: {
    color: Colors.text.light + "80",
  },
  customerMessageTime: {
    color: Colors.text.secondary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.background.primary,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.background.secondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginTop: 100,
  },
});