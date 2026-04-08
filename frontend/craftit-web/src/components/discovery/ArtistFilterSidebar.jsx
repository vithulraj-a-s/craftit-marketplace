import React from 'react';
import { Filter, X } from 'lucide-react';

const STYLES = ['PENCIL', 'WATERCOLOR', 'DIGITAL', 'COUPLE', 'FAMILY', 'PET', 'WEDDING', 'FRAMED', 'CUSTOM'];

export default function ArtistFilterSidebar({ filters, updateFilter, clearFilters, isOpen, onClose }) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-80px)] z-50 lg:z-10 bg-white
        w-80 lg:w-64 border-r lg:border-none border-gray-200 shadow-2xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col lg:rounded-2xl lg:bg-transparent
      `}>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-8 lg:mb-6 lg:bg-white lg:p-4 lg:rounded-2xl lg:shadow-[0_2px_10px_rgb(0,0,0,0.02)] lg:border lg:border-white">
            <h2 className="text-xl lg:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Filter size={18} className="text-indigo-600" />
              Filters
            </h2>
            <button onClick={onClose} className="p-2 lg:hidden text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-8 lg:bg-white lg:p-6 lg:rounded-2xl lg:shadow-[0_2px_10px_rgb(0,0,0,0.02)] lg:border lg:border-white">
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Style</label>
              <select
                value={filters.portrait_style || ''}
                onChange={(e) => updateFilter('portrait_style', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 min-h-[44px]"
              >
                <option value="">All Styles</option>
                {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Price Range ($)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price || ''}
                  onChange={(e) => updateFilter('min_price', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
                <span className="text-gray-400 font-medium">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price || ''}
                  onChange={(e) => updateFilter('max_price', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Delivery Time</label>
              <select
                value={filters.max_delivery_days || ''}
                onChange={(e) => updateFilter('max_delivery_days', e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700 min-h-[44px]"
              >
                <option value="">Any Time</option>
                <option value="3">Up to 3 days</option>
                <option value="7">Up to 7 days</option>
                <option value="14">Up to 14 days</option>
                <option value="30">Up to 30 days</option>
              </select>
            </div>

          </div>
        </div>

        <div className="p-6 border-t border-gray-100 lg:border-none lg:bg-white lg:rounded-2xl lg:mt-6 lg:shadow-[0_2px_10px_rgb(0,0,0,0.02)] bg-white mt-auto">
           <button
            onClick={clearFilters}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors min-h-[48px]"
          >
            Clear All Filters
          </button>
        </div>

      </aside>
    </>
  );
}
