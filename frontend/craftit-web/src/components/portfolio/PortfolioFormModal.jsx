import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Loader } from '../ui/Loader';
import clsx from 'clsx';

export default function PortfolioFormModal({ isOpen, onClose, initialData, onSubmit, availableStyles }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    portrait_style: initialData?.portrait_style || '',
    is_featured: initialData?.is_featured || false,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) setErrors(prev => ({ ...prev, image: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.portrait_style) newErrors.portrait_style = 'Style is required';
    if (!initialData && !imageFile) newErrors.image = 'Image is required for new items';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const submitData = new FormData();
    submitData.append('title', formData.title.trim());
    submitData.append('description', formData.description.trim());
    submitData.append('portrait_style', formData.portrait_style.toLowerCase());
    submitData.append('is_featured', formData.is_featured);

    if (imageFile) {
      submitData.append('image', imageFile);
    }

    try {
      await onSubmit(submitData);
    } catch (err) {
      const errRes = err.response?.data;
      if (typeof errRes === 'object' && errRes !== null) {
        if (errRes.detail) setServerError(errRes.detail);
        else {
          const firstKey = Object.keys(errRes)[0];
          setServerError(`${firstKey}: ${errRes[firstKey][0]}`);
        }
      } else {
        setServerError('Something went wrong matching response bounds.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-6 sm:p-8 shadow-2xl">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Portfolio Item' : 'Add to Portfolio'}
          </h2>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Image Col */}
            <div className="w-full sm:w-1/2 flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Artwork Image</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors group relative bg-gray-50 text-gray-400",
                  errors.image ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-indigo-400"
                )}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 items-center justify-center hidden group-hover:flex transition-all">
                      <span className="text-white text-sm font-medium">Change Image</span>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon size={32} className="mb-2 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-sm font-medium">Click to upload</span>
                  </>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-xs font-medium">{errors.image}</p>}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              
              <div className="mt-4">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Featured Piece</p>
                    <p className="text-xs text-gray-500">Show this primarily on your profile</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="w-full sm:w-1/2 flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Vintage Anime Sketch"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                />
                {errors.title && <p className="text-red-500 text-xs font-medium mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Style</label>
                <select
                  name="portrait_style"
                  value={formData.portrait_style}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors appearance-none capitalize"
                >
                  <option value="" disabled>Select Style...</option>
                  {availableStyles.map(style => (
                    <option key={style} value={style} className="capitalize">{style}</option>
                  ))}
                </select>
                {errors.portrait_style && <p className="text-red-500 text-xs font-medium mt-1">{errors.portrait_style}</p>}
                {availableStyles.length === 0 && (
                  <p className="text-orange-500 text-xs mt-1">No styles defined in your profile.</p>
                )}
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell clients about this specific artwork..."
                  className="w-full flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors resize-none"
                />
                {errors.description && <p className="text-red-500 text-xs font-medium mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? <Loader size={18} /> : (initialData ? <CheckCircle2 size={18}/> : null)}
              {initialData ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
