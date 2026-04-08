import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock } from 'lucide-react';

export default function ArtistCard({ artist }) {
  const {
    slug,
    profile_image,
    display_name,
    short_bio,
    location,
    portrait_styles,
    base_price,
    min_delivery_days,
    max_delivery_days,
    rating,
    total_completed_orders,
    portfolio_items = [],
  } = artist;

  const featuredPortfolio = portfolio_items.find(item => item.is_featured);
  const displayImage = featuredPortfolio?.image || (portfolio_items.length > 0 ? portfolio_items[0].image : null) || profile_image || '/api/placeholder/400/300';

  return (
    <div className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full overflow-hidden">
      
      <div className="w-full h-48 bg-gray-100 overflow-hidden relative border-b border-gray-200">
        <img 
          src={displayImage} 
          alt={displayImage === profile_image ? `${display_name} Profile` : `${display_name} Portfolio`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-semibold flex items-center gap-1 shadow-sm border border-gray-100">
          <Star size={14} className="text-yellow-500 fill-current" />
          <span className="text-gray-900">{rating ?? 'New'}</span>
          {total_completed_orders > 0 && <span className="text-xs text-gray-500">({total_completed_orders})</span>}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
            {display_name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin size={14} />
            <span className="truncate">{location}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
          {short_bio}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {portrait_styles.slice(0, 3).map(style => (
            <span key={style} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-semibold uppercase tracking-wider rounded-md">
              {style}
            </span>
          ))}
          {portrait_styles.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-semibold rounded-md">
              +{portrait_styles.length - 3}
            </span>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col gap-4 mt-auto">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Starting at</p>
              <p className="text-lg font-extrabold text-gray-900">Rs {base_price}</p>
            </div>
            <div className="flex items-center text-sm text-gray-500 font-medium mb-1">
              <Clock size={14} className="mr-1 mt-0.5" />
              <span>{min_delivery_days}-{max_delivery_days}d</span>
            </div>
          </div>
          
          <Link 
            to={`/artists/${slug}`}
            className="w-full text-center px-4 py-2 border border-gray-300 rounded-md font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
      
    </div>
  );
}
