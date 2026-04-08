import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ErrorMessage({ message, className }) {
  if (!message) return null;
  
  return (
    <div className={cn("flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100", className)}>
      <AlertCircle size={16} />
      <span>{message}</span>
    </div>
  );
}
