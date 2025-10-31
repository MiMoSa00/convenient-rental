// src/types/message.ts

// Message system types
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  messageType: 'text' | 'image' | 'file';
}

export interface ChatParticipant {
  name: string;
  avatar?: string;
  occupation: string;
  age: number;
}

export interface Chat {
  id: string;
  participants: string[];
  participantDetails: {
    [userId: string]: ChatParticipant;
  };
  lastMessage?: ChatMessage;
  lastActivity: Date;
  unreadCount: number;
  isActive: boolean;
}

export interface RoommateMatch {
  id: string;
  name: string;
  occupation: string;
  age: number;
}

// Export both names for compatibility
export interface MessageContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: ChatMessage[];
  isModalOpen: boolean;
  openChat: (roommateMatch: RoommateMatch) => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  markAsRead: (chatId: string) => void;
}

// Alias for backward compatibility
export type YourMessageInterface = MessageContextType;