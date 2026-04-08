import React from 'react';
import clsx from 'clsx';

export default function AvailabilityToggle({ isAvailable, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div>
        <h4 className="text-sm font-semibold text-gray-900">Available for Commission</h4>
        <p className="text-xs text-gray-500 mt-1">Turn this off if you are currently too busy to take new requests.</p>
      </div>
      
      <button
        type="button"
        onClick={() => onChange(!isAvailable)}
        className={clsx(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
          isAvailable ? 'bg-indigo-600' : 'bg-gray-200'
        )}
        role="switch"
        aria-checked={isAvailable}
      >
        <span
          aria-hidden="true"
          className={clsx(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            isAvailable ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}
