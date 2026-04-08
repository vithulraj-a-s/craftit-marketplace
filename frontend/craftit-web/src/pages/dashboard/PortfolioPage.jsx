import React, { useEffect, useState } from 'react';
import { getCurrentArtist } from '../../services/artistService';
import { 
  getArtistPortfolio, 
  createPortfolioItem, 
  updatePortfolioItem, 
  deletePortfolioItem 
} from '../../services/portfolioService';
import PortfolioItemCard from '../../components/portfolio/PortfolioItemCard';
import PortfolioFormModal from '../../components/portfolio/PortfolioFormModal';
import PortfolioDeleteModal from '../../components/portfolio/PortfolioDeleteModal';
import { Plus } from 'lucide-react';
import { Loader } from '../../components/ui/Loader';

export default function PortfolioPage() {
  const [artist, setArtist] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // null = Create, object = Edit or Delete

  useEffect(() => {
    const fetchData = async () => {
      try {
        const artistData = await getCurrentArtist();
        setArtist(artistData);
        if (artistData?.slug) {
          const portfolioData = await getArtistPortfolio(artistData.slug);
          const sorted = [...portfolioData].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
          setPortfolio(sorted);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load portfolio module.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreate = () => {
    setSelectedItem(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  };

  const handleDeleteRequest = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData, isEdit) => {
    if (isEdit && selectedItem) {
      const updatedItem = await updatePortfolioItem(selectedItem.id, formData);
      setPortfolio(prev => {
        let newPortfolio = prev.map(p => p.id === updatedItem.id ? updatedItem : p);
        if (updatedItem.is_featured) {
          newPortfolio = newPortfolio.map(p => p.id !== updatedItem.id ? { ...p, is_featured: false } : p);
        }
        return newPortfolio.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      });
    } else {
      const newItem = await createPortfolioItem(formData);
      setPortfolio(prev => {
        let newPortfolio = [newItem, ...prev];
        if (newItem.is_featured) {
          newPortfolio = newPortfolio.map(p => p.id !== newItem.id ? { ...p, is_featured: false } : p);
        }
        return newPortfolio.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      });
    }
    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    await deletePortfolioItem(selectedItem.id);
    setPortfolio(prev => prev.filter(p => p.id !== selectedItem.id));
    setIsDeleteModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader size={40} />
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="p-8 text-red-500 font-medium text-center">
        {error || 'Unable to load profile data.'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Portfolio</h1>
          <p className="text-sm text-gray-500">Showcase your best artwork to attract clients.</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          <span>Add Artwork</span>
        </button>
      </div>

      {portfolio.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Plus size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Your portfolio is empty</h3>
          <p className="text-gray-500 max-w-sm mb-6">Upload your first piece to show clients what you can do. Featured pieces appear on your main profile.</p>
          <button
            onClick={handleCreate}
            className="text-indigo-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors"
          >
            Create first item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map(item => (
            <PortfolioItemCard 
              key={item.id} 
              item={item} 
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDeleteRequest(item)}
            />
          ))}
        </div>
      )}

      {isFormModalOpen && (
        <PortfolioFormModal 
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          initialData={selectedItem}
          onSubmit={(formData) => handleFormSubmit(formData, !!selectedItem)}
          availableStyles={artist.portrait_styles || []}
        />
      )}

      {isDeleteModalOpen && (
        <PortfolioDeleteModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={selectedItem?.title}
        />
      )}
    </div>
  );
}
