import React from 'react';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ComingSoonPlaceholder({ title }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
        <Clock size={32} className="text-indigo-600" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{title}</h1>
      <p className="text-lg text-gray-500 max-w-md mx-auto mb-8">
        We're working hard to bring you this feature. Check back soon!
      </p>
      <Link 
        to="/dashboard/artist" 
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
