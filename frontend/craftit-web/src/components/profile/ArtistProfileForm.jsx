import React, { useState } from 'react';
import { Loader } from '../ui/Loader';
import ProfileImageUpload from './ProfileImageUpload';
import PortraitStyleMultiSelect from './PortraitStyleMultiSelect';
import AvailabilityToggle from './AvailabilityToggle';

export default function ArtistProfileForm({ initialData = {}, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    display_name: initialData.display_name || '',
    short_bio: initialData.short_bio || '',
    location: initialData.location || '',
    base_price: initialData.base_price || '',
    years_of_experience: initialData.years_of_experience || '',
    portrait_styles: initialData.portrait_styles || [],
    min_delivery_days: initialData.min_delivery_days || '',
    max_delivery_days: initialData.max_delivery_days || '',
    is_available_for_commission: initialData.is_available_for_commission ?? true,
  });

  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.display_name) newErrors.display_name = 'Display name is required';
    if (!formData.location) newErrors.location = 'Location is required';
    if (Number(formData.min_delivery_days) > Number(formData.max_delivery_days)) {
      newErrors.delivery_range = 'Min delivery days cannot be greater than Max delivery days';
    }
    if (formData.portrait_styles.length === 0) {
      newErrors.portrait_styles = 'Select at least one style';
    }

    if (Object.keys(newErrors).length > 0){
      setErrors(newErrors);
      return;
    }

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'portrait_styles') {
        const uniqueStyles = [...new Set(value)];
        submitData.append(
          "portrait_styles",
          JSON.stringify(uniqueStyles.map(style => style.toLowerCase()))
        );
      } else {
        submitData.append(key, value);
      }
    });

    if (profileImage) {
      submitData.append('profile_image', profileImage);
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex-col lg:flex-row flex gap-8">
      {/* Left Profile Panel */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Image</h2>
          <ProfileImageUpload 
            initialImage={initialData.profile_image}
            onImageChange={setProfileImage}
            error={errors.profile_image}
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col gap-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Basic Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
              placeholder="e.g. Leonardo da Vinci"
            />
            {errors.display_name && <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
              placeholder="e.g. Florence, Italy"
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Availability</label>
            <AvailabilityToggle 
              isAvailable={formData.is_available_for_commission}
              onChange={(val) => setFormData(prev => ({...prev, is_available_for_commission: val}))}
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Profile</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Bio</label>
            <textarea
              name="short_bio"
              value={formData.short_bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors resize-y"
              placeholder="Tell clients about your artistic journey..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portrait Styles</label>
            <PortraitStyleMultiSelect 
              selectedStyles={formData.portrait_styles}
              onChange={(styles) => {
                setFormData(prev => ({...prev, portrait_styles: styles}));
                if (errors.portrait_styles) setErrors(prev => ({...prev, portrait_styles: null}))
              }}
              error={errors.portrait_styles}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Base Price ($)</label>
              <input
                type="number"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <input
                type="number"
                name="years_of_experience"
                value={formData.years_of_experience}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Delivery Timelines</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Days</label>
              <input
                type="number"
                name="min_delivery_days"
                value={formData.min_delivery_days}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Days</label>
              <input
                type="number"
                name="max_delivery_days"
                value={formData.max_delivery_days}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                placeholder="7"
              />
            </div>
          </div>
          {errors.delivery_range && <p className="text-red-500 text-sm mt-1">{errors.delivery_range}</p>}
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-md font-semibold hover:bg-black transition-colors disabled:opacity-70 cursor-pointer min-w-[200px]"
          >
            {isSubmitting ? <Loader size={18} /> : null}
            {initialData?.display_name ? 'Save Changes' : 'Complete Profile'}
          </button>
        </div>
      </div>
    </form>
  );
}
