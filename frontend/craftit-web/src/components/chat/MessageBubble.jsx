import React, { useState, useEffect } from 'react';

const MessageBubble = ({ message, currentUserRole }) => {
  const isOwnMessage = message?.sender_role?.toUpperCase() === currentUserRole?.toUpperCase();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);
  
  const renderContent = () => {
    // Render Image
    if (message?.type === 'image' || (message?.file_url && message?.file_url.match(/\.(jpeg|jpg|gif|png|webp)$/i))) {
      return (
        <div className="flex flex-col">
          <img 
            src={message.file_url} 
            alt={message.file_name || 'chat image'} 
            className="max-w-[250px] rounded-xl mb-1 cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => setIsModalOpen(true)} 
          />
          {message.message && <p className="text-sm whitespace-pre-wrap mt-1">{message.message}</p>}
        </div>
      );
    } 
    
    // Render Document
    if (message?.type === 'document' || message?.file_url) {
      return (
        <div className="flex flex-col">
          <div className="flex items-center space-x-3 bg-black/5 p-3 rounded-xl mb-1 border border-black/5">
            <span className="text-2xl" role="img" aria-label="document">📄</span>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm truncate font-medium max-w-[150px]" title={message.file_name}>
                {message.file_name || 'Document'}
              </span>
            </div>
            <a 
              href={message.file_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs bg-white text-gray-800 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow transition-all font-medium whitespace-nowrap"
            >
              Download
            </a>
          </div>
          {message.message && <p className="text-sm whitespace-pre-wrap mt-1">{message.message}</p>}
        </div>
      );
    }
    
    // Fallback: Render Text
    return <p className="text-sm whitespace-pre-wrap">{message?.message || ''}</p>;
  };

  return (
    <div className={`flex w-full mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
          isOwnMessage 
            ? 'bg-blue-600 text-white rounded-br-sm' 
            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
        }`}
      >
        {renderContent()}
        <div className={`text-[11px] mt-1.5 text-right ${isOwnMessage ? 'text-blue-100' : 'text-gray-400'}`}>
          {message?.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </div>
      </div>

      {/* Image Modal Preview */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 focus:outline-none transition-colors z-[110]"
              onClick={() => setIsModalOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={message.file_url} 
              alt={message.file_name || 'fullscreen preview'} 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
