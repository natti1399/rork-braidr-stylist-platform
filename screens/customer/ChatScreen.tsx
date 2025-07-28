import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  TextInput, 
  Image, 
  StatusBar, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Sample messages data
const initialMessages = [
  {
    id: '1',
    text: 'Hi! I saw your portfolio and I love your work. I\'m interested in getting box braids.',
    sender: 'customer',
    timestamp: new Date('2024-01-28T09:30:00'),
    status: 'read'
  },
  {
    id: '2',
    text: 'Thank you so much! I\'d love to help you with box braids. What length are you thinking?',
    sender: 'stylist',
    timestamp: new Date('2024-01-28T09:32:00'),
    status: 'read'
  },
  {
    id: '3',
    text: 'I\'m thinking medium length, maybe shoulder length? How long would that take?',
    sender: 'customer',
    timestamp: new Date('2024-01-28T09:35:00'),
    status: 'read'
  },
  {
    id: '4',
    text: 'Perfect! Medium box braids usually take about 4-6 hours. I charge $180 for that length. Would you like to schedule an appointment?',
    sender: 'stylist',
    timestamp: new Date('2024-01-28T09:38:00'),
    status: 'read'
  },
  {
    id: '5',
    text: 'That sounds great! What\'s your availability like this week?',
    sender: 'customer',
    timestamp: new Date('2024-01-28T09:40:00'),
    status: 'read'
  },
  {
    id: '6',
    text: 'I have openings Thursday at 10 AM or Friday at 2 PM. Would either of those work for you?',
    sender: 'stylist',
    timestamp: new Date('2024-01-28T09:45:00'),
    status: 'delivered'
  }
];

interface ChatScreenProps {
  route?: {
    params?: {
      conversationId?: string;
      stylistName?: string;
      stylistAvatar?: string;
    };
  };
  navigation?: any;
}

export default function ChatScreen({ route, navigation }: ChatScreenProps) {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  
  // Get conversation details from navigation params
  const conversationId = route?.params?.conversationId || '1';
  const stylistName = route?.params?.stylistName || 'Maya Johnson';
  const stylistAvatar = route?.params?.stylistAvatar || 'https://images.unsplash.com/photo-1544725176-7c40e5a2c9f4?auto=format&fit=crop&w=200&q=50';
  
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim().length === 0) return;

    const message = {
      id: (messages.length + 1).toString(),
      text: newMessage.trim(),
      sender: 'customer',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate message being sent
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1000);
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp: Date) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderMessage = ({ item, index }) => {
    const isCustomerMessage = item.sender === 'customer';
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateSeparator = previousMessage && 
      formatDate(previousMessage.timestamp) !== formatDate(item.timestamp);

    return (
      <View>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        )}
        <View style={[
          styles.messageContainer,
          isCustomerMessage ? styles.customerMessageContainer : styles.stylistMessageContainer
        ]}>
          <View style={[
            styles.messageBubble,
            isCustomerMessage ? styles.customerMessage : styles.stylistMessage
          ]}>
            <Text style={[
              styles.messageText,
              isCustomerMessage ? styles.customerMessageText : styles.stylistMessageText
            ]}>
              {item.text}
            </Text>
          </View>
          <View style={[
            styles.messageInfo,
            isCustomerMessage ? styles.customerMessageInfo : styles.stylistMessageInfo
          ]}>
            <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
            {isCustomerMessage && (
              <Ionicons 
                name={item.status === 'read' ? 'checkmark-done' : 'checkmark'} 
                size={14} 
                color={item.status === 'read' ? '#4267FF' : '#8E8E93'} 
                style={styles.messageStatus}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  const showBookingOptions = () => {
    Alert.alert(
      'Booking Options',
      'Would you like to book an appointment with this stylist?',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Book Appointment', 
          onPress: () => {
            // Navigate to booking flow
            navigation?.navigate('BookingDetails', { stylistId: conversationId });
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation?.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#4267FF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Image source={{ uri: stylistAvatar }} style={styles.headerAvatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{stylistName}</Text>
            <Text style={styles.headerStatus}>Active now</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionButton}>
            <Ionicons name="videocam-outline" size={22} color="#4267FF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={showBookingOptions}
          >
            <Ionicons name="calendar-outline" size={22} color="#4267FF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
          <Text style={styles.typingText}>{stylistName} is typing...</Text>
        </View>
      )}

      {/* Input Container */}
      <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add" size={22} color="#4267FF" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#8E8E93"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              newMessage.trim().length > 0 && styles.sendButtonActive
            ]}
            onPress={sendMessage}
            disabled={newMessage.trim().length === 0}
          >
            <Ionicons 
              name="send" 
              size={18} 
              color={newMessage.trim().length > 0 ? 'white' : '#8E8E93'} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginBottom: 2,
  },
  headerStatus: {
    fontSize: 13,
    color: '#34C759',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(66, 103, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#8E8E93',
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  customerMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  stylistMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  customerMessage: {
    backgroundColor: '#4267FF',
    borderBottomRightRadius: 8,
  },
  stylistMessage: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  customerMessageText: {
    color: 'white',
  },
  stylistMessageText: {
    color: '#222',
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerMessageInfo: {
    justifyContent: 'flex-end',
  },
  stylistMessageInfo: {
    justifyContent: 'flex-start',
  },
  messageTime: {
    fontSize: 11,
    color: '#8E8E93',
  },
  messageStatus: {
    marginLeft: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8E8E93',
    marginHorizontal: 1,
  },
  typingDot1: {
    animationDelay: '0s',
  },
  typingDot2: {
    animationDelay: '0.2s',
  },
  typingDot3: {
    animationDelay: '0.4s',
  },
  typingText: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f1f3f4',
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 48,
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonActive: {
    backgroundColor: '#4267FF',
    shadowColor: '#4267FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});