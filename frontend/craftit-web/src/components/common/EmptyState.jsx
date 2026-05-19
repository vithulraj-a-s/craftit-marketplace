import React from 'react';
import { SearchX } from 'lucide-react';

export default function EmptyState({ title = "No matching artists found for this artistic style or concept.", message = "We couldn't find any artists matching your search." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 bg-gray-50/50 rounded-3xl w-full">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6">
        <SearchX size={32} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{message}</p>
    </div>
  );
}
