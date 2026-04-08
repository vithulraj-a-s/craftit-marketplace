import React from 'react';
import { Edit2, Trash2, Star } from 'lucide-react';
import clsx from 'clsx';

export default function PortfolioItemCard({ item, onEdit, onDelete }) {
  const { title, description, portrait_style, image, is_featured } = item;

  return (
    <div className={clsx(
      "group bg-white rounded-xl border overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow relative",
      is_featured ? "border-indigo-300 ring-1 ring-indigo-50" : "border-gray-200"
    )}>
      
      {is_featured && (
        <div className="absolute top-3 left-3 z-10 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
          <Star size={12} className="fill-current" />
          Featured
        </div>
      )}

      <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={onEdit} 
          className="bg-white/90 backdrop-blur-sm p-1.5 rounded-md shadow-sm hover:bg-white text-gray-700 hover:text-indigo-600 transition-colors"
          title="Edit item"
        >
          <Edit2 size={16} />
        </button>
        <button 
          onClick={onDelete}
          className="bg-white/90 backdrop-blur-sm p-1.5 rounded-md shadow-sm hover:bg-white text-gray-700 hover:text-red-600 transition-colors"
          title="Delete item"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="w-full h-48 bg-gray-100 overflow-hidden relative border-b border-gray-100">
        <img 
          src={image || '/api/placeholder/400/300'} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 mb-1 leading-tight line-clamp-1">{title}</h3>
        <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-semibold uppercase tracking-wider rounded-md w-max mb-3">
          {portrait_style}
        </span>
        <p className="text-sm text-gray-600 line-clamp-3 mb-1 flex-1">
          {description}
        </p>
      </div>
    </div>
  );
}
