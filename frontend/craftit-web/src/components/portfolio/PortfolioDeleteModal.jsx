import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Loader } from '../ui/Loader';

export default function PortfolioDeleteModal({ isOpen, onClose, onConfirm, itemName }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
    } catch {
      setError('Failed to delete item. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 p-6 shadow-2xl overflow-hidden">
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
            <Trash2 size={32} />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Portfolio Item?</h2>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{itemName}"</span>? This action cannot be undone.
          </p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 flex justify-center items-center gap-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
            >
              {isDeleting ? <Loader size={18} /> : null}
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
