// screens/MessagesScreen.js - With direct chat support (FIXED)
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useLanguage } from '../context/LanguageContext';

const API_URL = 'https://smart-rental-cqr0.onrender.com';

export default function MessagesScreen({ navigation, route }) {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const flatListRef = useRef();

  // Handle direct chat from navigation params
  useEffect(() => {
    const params = route.params;
    console.log('MessagesScreen params:', params);
    
    if (params && params.startChat === true && params.userId) {
      console.log('Starting direct chat with user ID:', params.userId);
      const otherUser = {
        id: params.userId,
        name: params.userName || 'Landlord',
        role: 'landlord',
        propertyTitle: params.propertyTitle || 'property',
      };
      setSelectedChat(otherUser);
      setMessages([]);
    }
  }, [route.params]);

  useEffect(() => {
    loadUser();
    fetchConversations();
    const interval = setInterval(() => {
      if (selectedChat && selectedChat.id) {
        fetchMessages(selectedChat.id);
      }
      fetchConversations();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  const loadUser = async () => {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        setUser(JSON.parse(userData));
        console.log('User loaded:', userData);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConversations = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId) => {
    if (!otherUserId) return;

    try {
      const token = await SecureStore.getItemAsync('token');
      const response = await axios.get(`${API_URL}/messages/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const messagesList = response.data.messages || [];
      setMessages(messagesList);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    setSending(true);
    try {
      const token = await SecureStore.getItemAsync('token');
      await axios.post(
        `${API_URL}/messages`,
        {
          receiver_id: selectedChat.id,
          message: newMessage.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewMessage('');
      await fetchMessages(selectedChat.id);
      scrollToBottom();
      fetchConversations();
    } catch (error) {
      Alert.alert(t('common.error'), t('errors.something_wrong'));
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const getOtherUser = (conversation) => {
    if (!user) return null;
    if (conversation.sender_id === user.id) {
      return {
        id: conversation.receiver_id,
        name: conversation.receiver_name,
        role: conversation.receiver_role,
      };
    } else {
      return {
        id: conversation.sender_id,
        name: conversation.sender_name,
        role: conversation.sender_role,
      };
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderConversation = ({ item }) => {
    const otherUser = getOtherUser(item);
    if (!otherUser) return null;

    const unreadCount = item.unread_count || 0;

    return (
      <TouchableOpacity
        style={[
          styles.conversationItem,
          selectedChat?.id === otherUser.id && styles.activeConversation,
        ]}
        onPress={() => setSelectedChat(otherUser)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{otherUser.name?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.conversationInfo}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationName}>{otherUser.name}</Text>
            <Text style={styles.conversationTime}>{formatTime(item.created_at)}</Text>
          </View>
          <Text style={styles.conversationMessage} numberOfLines={1}>
            {item.message || 'No messages yet'}
          </Text>
          <Text style={styles.conversationRole}>{t('common.role')}: {otherUser.role}</Text>
        </View>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.sender_id === user?.id;
    return (
      <View style={[styles.messageRow, isOwn ? styles.messageRight : styles.messageLeft]}>
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, isOwn ? styles.ownTime : styles.otherTime]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!selectedChat ? (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t('messages.no_conversations')}</Text>
              <Text style={styles.emptySubtext}>
                {t('messages.start_chat_hint')}
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setSelectedChat(null)} style={styles.backButton}>
              <Text style={styles.backButtonText}>← {t('messages.back')}</Text>
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatName}>{selectedChat.name}</Text>
              <Text style={styles.chatRole}>{selectedChat.role || 'Landlord'}</Text>
              {selectedChat.propertyTitle && (
                <Text style={styles.chatProperty}>🏠 {selectedChat.propertyTitle}</Text>
              )}
            </View>
          </View>

          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeEmoji}>💬</Text>
              <Text style={styles.welcomeTitle}>Start a conversation</Text>
              <Text style={styles.welcomeText}>
                Send a message to {selectedChat.name} about {selectedChat.propertyTitle || 'the property'}
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => scrollToBottom()}
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('messages.enter_message')}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendDisabled]}
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
            >
              <Text style={styles.sendButtonText}>{t('messages.send')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activeConversation: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  conversationTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  conversationRole: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  unreadBadge: {
    backgroundColor: '#2563EB',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chatRole: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  chatProperty: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageRow: {
    marginBottom: 12,
  },
  messageLeft: {
    alignItems: 'flex-start',
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    marginBottom: 4,
  },
  ownText: {
    color: 'white',
  },
  otherText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 10,
  },
  ownTime: {
    color: '#BFDBFE',
    textAlign: 'right',
  },
  otherTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'white',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
