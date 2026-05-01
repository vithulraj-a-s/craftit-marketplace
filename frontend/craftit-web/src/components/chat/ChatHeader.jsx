import React from 'react';

const ChatHeader = ({ orderId, otherUserName, otherUserRole }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
          {otherUserName?.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{otherUserName}</h2>
          <p className="text-sm text-gray-500 capitalize">{otherUserRole}</p>
        </div>
      </div>
      <div>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Order #{orderId}
        </span>
      </div>
    </div>
  );
};

export default ChatHeader;
