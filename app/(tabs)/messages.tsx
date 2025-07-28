import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { ConversationItem } from "@/components/ui/ConversationItem";
import { Colors } from "@/constants/colors";
import { useConversations } from "@/context/StylistContext";
import { Conversation } from "@/types";

export default function MessagesScreen() {
  const router = useRouter();
  const { conversations } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conversation) => {
    const customer = conversation.participants.find((p) => p.type === "customer");
    if (!customer) return false;
    
    return customer.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleConversationPress = (conversation: Conversation) => {
    router.push(`/conversation/${conversation.id}` as const);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={Colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.text.secondary}
        />
      </View>

      {filteredConversations.length > 0 ? (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              onPress={handleConversationPress}
            />
          )}
          contentContainerStyle={styles.conversationsList}
        />
      ) : (
        <View style={styles.emptyState}>
          {searchQuery ? (
            <>
              <Text style={styles.emptyStateTitle}>No results found</Text>
              <Text style={styles.emptyStateText}>
                No conversations match your search.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyStateTitle}>No messages yet</Text>
              <Text style={styles.emptyStateText}>
                When customers message you, they&apos;ll appear here.
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.text.primary,
  },
  conversationsList: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
  },
});