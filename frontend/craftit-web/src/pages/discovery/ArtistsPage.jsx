import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getArtists, semanticArtistSearch } from '../../services/artistService';
import ArtistCard from '../../components/discovery/ArtistCard';
import ArtistFilterSidebar from '../../components/discovery/ArtistFilterSidebar';
import ArtistSearchBar from '../../components/discovery/ArtistSearchBar';
import PaginationControls from '../../components/common/PaginationControls';
import EmptyState from '../../components/common/EmptyState';
import { Loader } from '../../components/ui/Loader';
import { Filter } from 'lucide-react';

export default function ArtistsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSemanticMode, setIsSemanticMode] = useState(false);

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    setFilters(params);
    setSearchTerm(params.search || '');
    setCurrentPage(Number(params.page) || 1);
    
  }, []);

  const fetchArtistsList = useCallback(async (paramsObj) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getArtists(paramsObj);
      setArtists(data.results || data); 
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 10));
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load artists. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = async () => {
    const query = searchTerm.trim();
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      setIsSemanticMode(true);
      const data = await semanticArtistSearch(query);
      setArtists(data.results || data);
    } catch (err) {
      console.error(err);
      setError("Semantic search failed.");
    } finally {
      setLoading(false);
    }
  };

  // Normal Browsing / Restoration Effect
  useEffect(() => {
    if (searchTerm.trim()) return;

    setIsSemanticMode(false);
    const currentParams = Object.fromEntries(searchParams.entries());
    fetchArtistsList(currentParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, fetchArtistsList, searchTerm]);

  const pushParams = (newParams) => {
    setSearchParams(newParams);
  };

  const updateFilter = (key, value) => {
    const newParams = { ...Object.fromEntries(searchParams.entries()), [key]: value, page: 1 };
    if (!value) delete newParams[key];
    pushParams(newParams);
    setFilters(prev => ({...prev, [key]: value}));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setSearchParams({});
    setIsSidebarOpen(false);
  };

  const handlePageChange = (newPage) => {
    const newParams = { ...Object.fromEntries(searchParams.entries()), page: newPage };
    pushParams(newParams);
    setCurrentPage(newPage);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Find the Perfect Portrait Artist
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mb-8">
            Commission hand-painted art from talented creators all over the world.
          </p>
          <div className="flex items-center gap-4">
            <ArtistSearchBar value={searchTerm} onChange={setSearchTerm} onSearch={handleSearch} />
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm"
            >
              <Filter size={20} className="text-gray-700" />
            </button>
          </div>
          {loading && isSemanticMode && (
            <div className="mt-4 flex items-center text-indigo-600">
               <span className="text-sm font-medium animate-pulse">Searching semantically...</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          
          <ArtistFilterSidebar 
            filters={filters} 
            updateFilter={updateFilter} 
            clearFilters={clearFilters}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="flex-1 w-full lg:min-w-0">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-24">
                <Loader size={48} />
              </div>
            ) : artists.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {artists.map(artist => (
                    <ArtistCard key={artist.slug} artist={artist} />
                  ))}
                </div>
                
                {!isSemanticMode && (
                  <PaginationControls 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
