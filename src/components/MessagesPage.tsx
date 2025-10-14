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
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600 mt-1">
              {chats.length} conversation{chats.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                filter === 'unread'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Unread
              {chats.filter(chat => chat.unreadCount > 0).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {chats.filter(chat => chat.unreadCount > 0).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h3>
            <p className="text-gray-600 max-w-sm">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Start messaging your roommate matches to see conversations here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => {
              const otherParticipant = getOtherParticipant(chat);

              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat)}
                  className="p-4 sm:p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {otherParticipant?.name?.[0] || 'U'}
                      </div>
                      {chat.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate ${
                          chat.unreadCount > 0 ? 'text-gray-900' : 'text-gray-800'
                        }`}>
                          {otherParticipant?.name || 'Unknown User'}
                        </h3>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          {chat.lastMessage?.senderId === 'current-user' && (
                            <CheckCheck className={`h-4 w-4 ${
                              chat.lastMessage.isRead ? 'text-blue-500' : 'text-gray-400'
                            }`} />
                          )}
                          <span className="text-xs text-gray-500">
                            {formatLastActivity(chat.lastActivity)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          chat.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
                        }`}>
                          {chat.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
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