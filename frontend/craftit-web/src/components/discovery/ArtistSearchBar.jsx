import React from 'react';
import { Search } from 'lucide-react';

export default function ArtistSearchBar({ value, onChange, onSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={18} className="text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow shadow-sm hover:shadow-md"
        placeholder="Search styles, themes, portrait ideas..."
      />
      <button 
        type="button"
        onClick={onSearch}
        className="absolute inset-y-1.5 right-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 text-sm font-medium transition-colors"
      >
        Search
      </button>
    </form>
  );
}
