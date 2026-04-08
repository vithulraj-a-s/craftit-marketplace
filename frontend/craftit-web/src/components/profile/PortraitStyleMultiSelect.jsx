import React from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';

const STYLES = [
  'PENCIL', 'WATERCOLOR', 'DIGITAL', 'COUPLE', 'FAMILY', 'PET', 'WEDDING', 'FRAMED', 'CUSTOM'
];

export default function PortraitStyleMultiSelect({ selectedStyles = [], onChange, error }) {
  const toggleStyle = (style) => {
    const isPresent = selectedStyles.some(s => s.toUpperCase() === style.toUpperCase());
    if (isPresent) {
      onChange(selectedStyles.filter(s => s.toUpperCase() !== style.toUpperCase()));
    } else {
       onChange([...selectedStyles, style]);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-wrap gap-2">
        {STYLES.map(style => {
          const isSelected = selectedStyles.some(s => s.toUpperCase() === style.toUpperCase());
          return (
            <button
              key={style}
              type="button"
              onClick={() => toggleStyle(style)}
              className={clsx(
                "px-3 py-1.5 text-sm font-medium rounded-full border transition-colors flex items-center gap-1.5 cursor-pointer outline-none",
                isSelected
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
              )}
            >
              {isSelected && <Check size={14} className="text-indigo-600" />}
              {style}
            </button>
          );
        })}
      </div>
      {error && <span className="text-sm text-red-500 mt-2">{error}</span>}
    </div>
  );
}
