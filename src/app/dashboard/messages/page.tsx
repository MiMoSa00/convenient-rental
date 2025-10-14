"use client";
import React from 'react';
import { MessageProvider } from "@/context/MessageContext";
import MessagesPage from "@/components/MessagesPage";
import ChatModal from "@/components/ChatModal";

const Messages = () => {
  return (
    <MessageProvider>
      <div className="h-full">
        <MessagesPage />
        <ChatModal />
      </div>
    </MessageProvider>
  );
};

export default Messages;