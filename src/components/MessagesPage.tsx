"use client";
import React, { useState } from 'react';
import { Search, MessageSquare, CheckCheck } from 'lucide-react';
import { useMessages } from '@/context/MessageContext';

// Define the participant type for better TypeScript support
interface ParticipantDetails {
  name: string;
  avatar?: string;
  occupation: string;
  age: number;
}

const MessagesPage: React.FC = () => {
  const { chats, openChat } = useMessages();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? 'Yesterday' : `${diffInDays}d ago`;
    }
  };

  const getOtherParticipant = (chat: any): ParticipantDetails | null => {
    const entry = Object.entries(chat.participantDetails).find(
      ([id]) => id !== 'current-user'
    );
    return entry ? entry[1] as ParticipantDetails : null;
  };

  const filteredChats = chats
    .filter(chat => {
      const otherParticipant = getOtherParticipant(chat);
      
      const matchesSearch = !searchQuery || 
        otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage?.content?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
        (filter === 'unread' && chat.unreadCount > 0);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

  const handleChatClick = (chat: any) => {
    const otherParticipant = getOtherParticipant(chat);
    
    if (otherParticipant) {
      const roommateMatch = {
        id: Object.keys(chat.participantDetails).find(id => id !== 'current-user') || '',
        name: otherParticipant.name || 'Unknown User',
        occupation: otherParticipant.occupation || 'Unknown',
        age: otherParticipant.age || 0
      };
      openChat(roommateMatch);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Messages</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {chats.length} conversation{chats.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors relative ${
                filter === 'unread'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread
              {chats.filter(chat => chat.unreadCount > 0).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
                  {chats.filter(chat => chat.unreadCount > 0).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-border bg-card text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Start messaging your roommate matches to see conversations here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredChats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);

              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="p-3 sm:p-4 md:p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold text-base sm:text-lg">
                        {otherParticipant?.name?.[0] || 'U'}
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start sm:items-center justify-between gap-2 mb-1">
                        <h3 className={`font-semibold text-sm sm:text-base truncate ${
                          chat.unreadCount > 0 ? 'text-foreground' : 'text-foreground/90'
                        }`}>
                          {otherParticipant?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {chat.lastMessage?.senderId === 'current-user' && (
                            <CheckCheck className={`h-3 w-3 sm:h-4 sm:w-4 ${
                              chat.lastMessage.isRead ? 'text-primary' : 'text-muted-foreground'
                            }`} />
                          )}
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatLastActivity(chat.lastActivity)}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-xs sm:text-sm truncate ${
                        chat.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                      }`}>
                        {chat.lastMessage?.content || 'No messages yet'}
                      </p>
                      
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {otherParticipant?.occupation || 'Unknown'} • {otherParticipant?.age || 'N/A'} years old
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;