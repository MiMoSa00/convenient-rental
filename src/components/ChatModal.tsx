"use client";
import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Send, Smile, Paperclip } from 'lucide-react';
import { useMessages } from '@/context/MessageContext';

const ChatModal: React.FC = () => {
  const { activeChat, messages, isModalOpen, closeChat, sendMessage } = useMessages();
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isModalOpen]);

  // Reset expanded state when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setIsExpanded(false);
    }
  }, [isModalOpen]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(date);
    }
  };

  if (!isModalOpen || !activeChat) return null;

  const otherParticipant = Object.entries(activeChat.participantDetails).find(
    ([id]) => id !== 'current-user'
  )?.[1];

  return (
    <div className={`fixed inset-0 z-50 bg-black backdrop-blur-sm transition-all duration-300 ${
      isExpanded 
        ? 'bg-opacity-20 flex items-center justify-center' 
        : 'bg-opacity-30 flex items-end justify-center'
    }`}>
      <div 
        className={`
          bg-white shadow-2xl transform transition-all duration-300 ease-out flex flex-col
          ${isModalOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
          ${isExpanded 
            ? 'w-full h-full max-w-none mx-0 my-0 rounded-none' 
            : 'w-full max-w-md mx-4 mb-4 h-[70vh] rounded-t-2xl sm:max-w-lg md:max-w-xl lg:max-w-2xl'
          }
        `}
        style={{
          animation: isModalOpen ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-in'
        }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0 ${
          isExpanded ? 'rounded-none' : 'rounded-t-2xl'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {otherParticipant?.name?.[0] || 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                {otherParticipant?.name || 'Unknown User'}
              </h3>
              <p className="text-xs text-gray-500">
                {otherParticipant?.occupation || 'Unknown'}, {otherParticipant?.age || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={isExpanded ? 'Minimize' : 'Expand to Fullscreen'}
            >
              {isExpanded ? (
                <Minimize2 className="h-5 w-5 text-gray-600" />
              ) : (
                <Maximize2 className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={closeChat}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Close"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto space-y-4 bg-gray-50 ${
          isExpanded ? 'p-6' : 'p-4'
        }`}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                {otherParticipant?.name?.[0] || 'U'}
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">
                {otherParticipant?.name || 'Unknown User'}
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                {otherParticipant?.occupation || 'Unknown'} • {otherParticipant?.age || 'N/A'} years old
              </p>
              <p className="text-sm text-gray-400">
                Start your conversation with {otherParticipant?.name?.split(' ')[0] || 'them'}
              </p>
            </div>
          ) : (
            <div className={`space-y-4 ${isExpanded ? 'max-w-4xl mx-auto' : ''}`}>
              {messages.map((message, index) => {
                const isCurrentUser = message.senderId === 'current-user';
                const showDate = index === 0 || 
                  formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`
                        px-4 py-2 rounded-2xl shadow-sm
                        ${isExpanded 
                          ? 'max-w-[60%] sm:max-w-[50%]' 
                          : 'max-w-[75%] sm:max-w-[70%]'
                        }
                        ${isCurrentUser 
                          ? 'bg-blue-500 text-white rounded-br-md' 
                          : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                        }
                      `}>
                        <p className={`leading-relaxed ${isExpanded ? 'text-base' : 'text-sm'}`}>
                          {message.content}
                        </p>
                        <p className={`
                          mt-1 
                          ${isExpanded ? 'text-sm' : 'text-xs'}
                          ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}
                        `}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Reduced padding and better positioning */}
        <div className={`border-t border-gray-200 bg-white flex-shrink-0 ${
          isExpanded ? 'px-6 py-3 rounded-none' : 'px-4 py-3 rounded-b-2xl'
        }`}>
          <div className={`flex items-center space-x-3 ${
            isExpanded ? 'max-w-4xl mx-auto' : ''
          }`}>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Paperclip className="h-5 w-5 text-gray-500" />
            </button>
            
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${otherParticipant?.name?.split(' ')[0] || 'them'}...`}
                className={`
                  w-full px-4 py-2 pr-10 border border-gray-300 rounded-full 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  ${isExpanded ? 'text-base py-3' : 'text-sm'}
                `}
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                <Smile className={`text-gray-500 ${isExpanded ? 'h-5 w-5' : 'h-4 w-4'}`} />
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className={`
                rounded-full transition-all duration-200
                ${isExpanded ? 'p-3' : 'p-2'}
                ${newMessage.trim() 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Send className={`${isExpanded ? 'h-6 w-6' : 'h-5 w-5'}`} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatModal;