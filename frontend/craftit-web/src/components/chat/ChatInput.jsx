import React, { useState, useRef } from 'react';
import axios from 'axios';

const ChatInput = ({ onSendMessage }) => {
  console.log("chat input rendered ... ")
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingLocal = useRef(false);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    
    // Clear typing indicator on send
    clearTimeout(typingTimeoutRef.current);
    if (isTypingLocal.current) {
      isTypingLocal.current = false;
      onSendMessage({ type: 'stop_typing' });
    }
    
    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const response = await axios.post(
              '/api/chat-image/upload/',
              formData,
              {
                withCredentials: true,

                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              }
            );
        
        const { file_url, file_name } = response.data;
        const isImage = selectedFile.type.startsWith("image/");
        
        onSendMessage({
          type: isImage ? "image" : "document",
          message: message.trim(),
          file_url,
          file_name
        });
        
        setSelectedFile(null);
        setMessage('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        console.error("Upload failed", error);
      } finally {
        setIsUploading(false);
      }
    } else if (message.trim()) {
      onSendMessage({ type: 'text', message: message.trim() });
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() || selectedFile) {
        handleSend(e);
      }
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    
    if (!isTypingLocal.current) {
      isTypingLocal.current = true;
      onSendMessage({ type: 'typing' });
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingLocal.current = false;
      onSendMessage({ type: 'stop_typing' });
    }, 1000);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-4xl mx-auto">
        {selectedFile && (
          <div className="mb-2 flex items-center p-2 bg-blue-50 rounded-lg max-w-sm">
            <span className="text-xl mr-2">📄</span>
            <div className="flex-1 truncate text-sm font-medium text-blue-900">
              {selectedFile.name}
            </div>
            <button 
              onClick={handleClearFile}
              className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
            >
              ✕
            </button>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-end space-x-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-3 text-gray-500 hover:text-blue-600 focus:outline-none disabled:opacity-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-gray-800 text-sm py-2 outline-none disabled:opacity-50"
              placeholder={isUploading ? "Uploading..." : "Type your message..."}
              rows="1"
              value={message}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
              disabled={isUploading}
            />
          </div>
          <button
            type="submit"
            disabled={(!message.trim() && !selectedFile) || isUploading}
            className="bg-blue-600 text-white rounded-full p-3 flex-shrink-0 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {isUploading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
