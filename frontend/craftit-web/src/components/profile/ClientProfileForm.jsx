import React, { useState } from 'react';
import { Loader } from '../ui/Loader';
import ProfileImageUpload from './ProfileImageUpload';

export default function ClientProfileForm({ initialData = {}, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });

    if (profileImage) {
      submitData.append('profile_image', profileImage);
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 flex flex-col items-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Personalize your Profile</h2>
        <p className="text-gray-500 mb-6 text-sm">Add a photo and your full name to connect with artists.</p>
        
        <div className="w-32 mb-6">
          <ProfileImageUpload 
            initialImage={initialData.profile_image}
            onImageChange={setProfileImage}
            error={errors.profile_image}
          />
        </div>

        <div className="w-full space-y-1">
          <label className="block text-sm font-semibold text-gray-700">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-colors"
            placeholder="e.g. Jane Doe"
          />
          {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
        </div>

        <div className="w-full mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-md font-semibold hover:bg-black transition-colors disabled:opacity-70 w-full sm:w-auto"
          >
            {isSubmitting ? <Loader size={18} /> : null}
            {initialData?.full_name ? 'Save Changes' : 'Complete Setup'}
          </button>
        </div>

      </div>
    </form>
  );
}
