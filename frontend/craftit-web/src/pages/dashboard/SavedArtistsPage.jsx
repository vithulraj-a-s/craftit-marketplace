import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSavedArtists, removeSavedArtist } from '../../services/savedArtistService';
import { Loader } from '../../components/ui/Loader';
import { MapPin, BookmarkMinus, Bookmark } from 'lucide-react';

export default function SavedArtistsPage() {
  const [savedArtists, setSavedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await getSavedArtists();
        setSavedArtists(data);
      } catch (err) {
        console.error("Failed to fetch saved artists", err);
        setError("Unable to load saved artists.");
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const handleRemove = async (slug) => {
    try {
      await removeSavedArtist(slug);
      setSavedArtists(prev => prev.filter(item => item.artist.slug !== slug));
    } catch (err) {
      console.error("Failed to remove artist", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500 font-medium text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Artists</h1>
          <p className="text-sm text-gray-500">Artists you have bookmarked for future portrait commissions.</p>
        </div>
      </div>

      {savedArtists.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Bookmark size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No saved artists yet.</h3>
          <p className="text-gray-500 max-w-sm mb-6">Browse artists and save the ones you want to revisit later.</p>
          <Link
            to="/artists"
            className="text-indigo-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
          >
            Find Artists
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedArtists.map((item) => {
            const { artist } = item;
            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                <div className="w-full h-40 bg-gray-100 overflow-hidden relative border-b border-gray-200">
                  <img 
                    src={artist.profile_image || '/api/placeholder/400/300'} 
                    alt={artist.display_name}
                    className="w-full h-full object-cover"
                  />
                  {artist.is_available_for_commission && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                      Available
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{artist.display_name}</h3>
                  <div className="flex items-center gap-1 text-gray-500 text-xs font-medium mb-3 mt-1">
                    <MapPin size={12} />
                    <span>{artist.location}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {artist.portrait_styles?.map(style => (
                      <span key={style} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded border border-gray-200">
                        {style}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4">
                    <span className="text-gray-500 text-xs">Starts at</span>
                    <p className="text-lg font-bold text-gray-900">${artist.base_price}</p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                    <Link 
                      to={`/artists/${artist.slug}`}
                      className="flex-1 text-center bg-gray-900 text-white text-sm font-bold py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      View Profile
                    </Link>
                    <button 
                      onClick={() => handleRemove(artist.slug)}
                      className="px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center border border-red-100"
                      title="Remove from saved"
                    >
                      <BookmarkMinus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
