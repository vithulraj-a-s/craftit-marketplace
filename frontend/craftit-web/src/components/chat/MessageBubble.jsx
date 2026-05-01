import React from 'react';

const MessageBubble = ({ message, currentUserRole }) => {
  const isOwnMessage = message?.sender_role?.toUpperCase() === currentUserRole?.toUpperCase();
  
  return (
    <div className={`flex w-full mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
          isOwnMessage 
            ? 'bg-blue-600 text-white rounded-br-sm' 
            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message?.message || ''}</p>
        <div className={`text-[11px] mt-1 text-right ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
          {message?.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
