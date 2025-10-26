import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendMessageToAI } from '../services/aiChatService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hi! I'm your AI assistant for art tools. I can help you find products, compare brands, or answer questions about our art tools catalog. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
      products: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
        // Account for tab bar height and add more padding above keyboard
        const tabBarHeight = 80;
        const extraPadding = 30; // Increased padding above keyboard
        setKeyboardHeight(Math.max(0, e.endCoordinates.height - tabBarHeight + extraPadding));
      });
      const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardHeight(0);
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      products: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendMessageToAI(userMessage.text);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        products: response.products || []
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Show a more helpful error message
      let errorMessage = 'Failed to send message. Please try again.';
      if (error.message && error.message.includes('404')) {
        errorMessage = 'API endpoint not found. Please check your Gemini API configuration.';
      } else if (error.message && error.message.includes('401') || error.message.includes('403')) {
        errorMessage = 'Invalid API key. Please check your Gemini API key configuration.';
      }
      
      Alert.alert('Error', errorMessage);
      
      // Remove the user message if it failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const renderProductCard = ({ item }) => (
    <Pressable
      style={styles.productCard}
      onPress={() => navigation.navigate('Detail', { artTool: item })}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={4}>
          {item.artName}
        </Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>${Number(item.price) || 0}</Text>
          {Number(item.limitedTimeDeal) > 0 && (
            <Text style={styles.originalPrice}>
              ${(Number(item.price) / (1 - Number(item.limitedTimeDeal))).toFixed(2)}
            </Text>
          )}
        </View>
        {Number(item.limitedTimeDeal) > 0 && (
          <Text style={styles.productDeal}>
            {Math.round(Number(item.limitedTimeDeal) * 100)}% OFF
          </Text>
        )}
      </View>
    </Pressable>
  );

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.isUser ? styles.userMessage : styles.aiMessage]}>
      <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, item.isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
        
        {item.products && item.products.length > 0 && (
          <View style={styles.productsSection}> 
            <Text style={styles.productsTitle}>Related Products:</Text>
            <FlatList
              data={item.products}
              renderItem={renderProductCard}
              keyExtractor={(product) => product.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
            />
          </View>
        )}
        
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView 
          behavior="padding"
          keyboardVerticalOffset={-insets.bottom - 20}
        >
          <View style={[styles.inputContainer, { paddingBottom: Math.max(12, insets.bottom) }]}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about art tools..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
              blurOnSubmit={false}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={(!inputText.trim() || isLoading) ? "#9ca3af" : "#ffffff"} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        <>
          <View style={[styles.inputContainer, { 
            paddingBottom: Math.max(12, insets.bottom),
            marginBottom: keyboardHeight,
          }]}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask about art tools..."
              placeholderTextColor="#9ca3af"
              multiline
              maxLength={500}
              blurOnSubmit={false}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={(!inputText.trim() || isLoading) ? "#9ca3af" : "#ffffff"} 
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'right',
  },
  productsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    height: 260,
    overflow: 'hidden',
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 8,
  },
  productsList: {
    paddingRight: 16,
  },
  productsFlatList: {
    // Removed explicit height here, now controlled by productsSection
  },
  productCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    width: 140,
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: 104,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    lineHeight: 14,
    height: 28,
    numberOfLines: 2,
  },
  productBrand: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 6,
    height: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    height: 16,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  productDeal: {
    fontSize: 11,
    color: '#ffffff',
    backgroundColor: '#ff4757',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#ff3742',
    letterSpacing: 0.5,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    minHeight: 60,
  },
  inputContainerFixed: {
  },
  keyboardSpacer: {
    height: 0,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
});

export default ChatScreen;