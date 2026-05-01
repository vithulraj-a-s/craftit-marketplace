import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

const ChatMessages = ({ messages, currentUserRole }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto flex flex-col space-y-2">
        {messages.map((msg, index) => (
          <MessageBubble 
            key={msg.id || index} 
            message={msg} 
            currentUserRole={currentUserRole}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
