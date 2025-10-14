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

export interface Chat {
  id: string;
  participants: string[];
  participantDetails: {
    [userId: string]: {
      name: string;
      avatar?: string;
      occupation: string;
      age: number;
    };
  };
  lastMessage?: ChatMessage;
  lastActivity: Date;
  unreadCount: number;
  isActive: boolean;
}

export interface MessageContextType {
  chats: Chat[];
  activeChat: Chat | null;
  messages: ChatMessage[];
  isModalOpen: boolean;
  openChat: (roommateMatch: any) => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
  markAsRead: (chatId: string) => void;
}