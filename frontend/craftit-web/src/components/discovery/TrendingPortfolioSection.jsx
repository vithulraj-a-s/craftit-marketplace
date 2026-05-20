import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingPortfolioItems } from '../../services/portfolioService';
import { Heart } from 'lucide-react';

export default function TrendingPortfolioSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchTrending = async () => {
      try {
        const data = await getTrendingPortfolioItems();
        if (isMounted) {
          setItems(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to fetch trending portfolio items:', err);
        if (isMounted) {
          setError('Could not load trending portraits.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTrending();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = (slug) => {
    if (slug) {
      navigate(`/artists/${slug}`);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trending Portraits</h2>
        <p className="text-gray-500 text-sm mb-6">Discover artwork people are loving</p>
        <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-x-visible md:pb-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="min-w-[240px] md:min-w-0 bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm animate-pulse">
              <div className="h-60 bg-gray-200 w-full" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    // Fail silently/subtly without breaking the page
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="w-full py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trending Portraits</h2>
        <p className="text-gray-500 text-sm mb-4">Discover artwork people are loving</p>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <p className="text-gray-500 font-medium">No trending artworks yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Trending Portraits</h2>
        <p className="text-gray-500 text-sm">Discover artwork people are loving</p>
      </div>

      {/* Grid on desktop, horizontal scroll on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-x-visible md:pb-0">
        {items.map((item) => {
          const artistSlug = item.artist?.slug;
          const artistName = item.artist?.display_name || 'Unknown Artist';
          const artistImg = item.artist?.profile_image || '/api/placeholder/100/100';

          return (
            <div
              key={item.id}
              onClick={() => handleCardClick(artistSlug)}
              className="min-w-[240px] md:min-w-0 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer group flex flex-col snap-start"
            >
              {/* Image Container with hover zoom and Heart likes count overlay */}
              <div className="h-60 bg-gray-50 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={`${artistName} Artwork`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Heart overlay top right */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm border border-gray-100">
                  <Heart size={13} className="text-rose-500 fill-rose-500" />
                  <span>{item.likes_count ?? 0}</span>
                </div>
              </div>

              {/* Card Footer with Artist info */}
              <div className="p-4 flex-1 flex flex-col justify-between bg-white border-t border-gray-50">
                <div className="flex items-center gap-2.5">
                  <img
                    src={artistImg}
                    alt={artistName}
                    className="w-8 h-8 rounded-full object-cover border border-gray-100"
                    onError={(e) => {
                      e.target.src = '/api/placeholder/100/100';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Artist</p>
                    <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                      {artistName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
