"use client";
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Chat, ChatMessage, MessageContextType } from '@/types/message';

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

interface MessageProviderProps {
  children: ReactNode;
}

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('roommate-chats');
    const savedMessages = localStorage.getItem('roommate-messages');
    
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        setChats(parsedChats.map((chat: any) => ({
          ...chat,
          lastActivity: new Date(chat.lastActivity),
          lastMessage: chat.lastMessage ? {
            ...chat.lastMessage,
            timestamp: new Date(chat.lastMessage.timestamp)
          } : undefined
        })));
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    }

    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('roommate-chats', JSON.stringify(chats));
    }
  }, [chats]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('roommate-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const markAsRead = useCallback((chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, unreadCount: 0 }
        : chat
    ));

    setMessages(prev => prev.map(msg => 
      msg.chatId === chatId && msg.receiverId === 'current-user'
        ? { ...msg, isRead: true }
        : msg
    ));
  }, []);

  const openChat = useCallback((roommateMatch: any) => {
    const chatId = `chat-${Date.now()}-${roommateMatch.id}`;
    
    // Check if chat already exists
    let existingChat = chats.find(chat => 
      chat.participants.includes(roommateMatch.id.toString())
    );

    if (!existingChat) {
      // Create new chat
      const newChat: Chat = {
        id: chatId,
        participants: ['current-user', roommateMatch.id.toString()],
        participantDetails: {
          'current-user': {
            name: 'You',
            occupation: 'User',
            age: 25
          },
          [roommateMatch.id.toString()]: {
            name: roommateMatch.name,
            occupation: roommateMatch.occupation,
            age: roommateMatch.age
          }
        },
        lastActivity: new Date(),
        unreadCount: 0,
        isActive: true
      };

      setChats(prev => [newChat, ...prev]);
      existingChat = newChat;
    }

    setActiveChat(existingChat);
    setIsModalOpen(true);
    
    // Mark as read when opening chat
    if (existingChat.unreadCount > 0) {
      markAsRead(existingChat.id);
    }
  }, [chats, markAsRead]);

  const closeChat = useCallback(() => {
    setIsModalOpen(false);
    setActiveChat(null);
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!activeChat || !content.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      chatId: activeChat.id,
      senderId: 'current-user',
      receiverId: activeChat.participants.find(p => p !== 'current-user') || '',
      content: content.trim(),
      timestamp: new Date(),
      isRead: false,
      messageType: 'text'
    };

    setMessages(prev => [...prev, newMessage]);

    // Update chat's last message and activity
    setChats(prev => prev.map(chat => 
      chat.id === activeChat.id 
        ? {
            ...chat,
            lastMessage: newMessage,
            lastActivity: new Date()
          }
        : chat
    ));

    // Simulate receiving a response after 2-5 seconds
    setTimeout(() => {
      const responses = [
        "That sounds great! When would be a good time to meet?",
        "I'm interested! Can you tell me more about the place?",
        "Thanks for reaching out. I'd love to discuss this further.",
        "Hi! I saw your message. Let's chat about the roommate arrangement.",
        "That works for me. What's the next step?",
        "Perfect! I'd love to learn more about your living preferences.",
        "Great to hear from you! Are you available for a quick call?",
        "Thanks for messaging! When are you looking to move in?",
        "Sounds like we could be a good match! Let's discuss details.",
        "I'm definitely interested. What's your timeline for moving?"
      ];

      const responseMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        chatId: activeChat.id,
        senderId: activeChat.participants.find(p => p !== 'current-user') || '',
        receiverId: 'current-user',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        isRead: false,
        messageType: 'text'
      };

      setMessages(prev => [...prev, responseMessage]);
      
      // Update unread count only if modal is not open or if it's a different chat
      setChats(prev => prev.map(chat => 
        chat.id === activeChat.id 
          ? {
              ...chat,
              lastMessage: responseMessage,
              lastActivity: new Date(),
              // Only increment unread count if modal is closed OR if this isn't the active chat
              unreadCount: (!isModalOpen || activeChat.id !== chat.id) ? chat.unreadCount + 1 : 0
            }
          : chat
      ));
    }, Math.random() * 3000 + 2000);
  }, [activeChat, isModalOpen]);

  const value: MessageContextType = {
    chats,
    activeChat,
    messages: messages.filter(msg => msg.chatId === activeChat?.id),
    isModalOpen,
    openChat,
    closeChat,
    sendMessage,
    markAsRead
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};