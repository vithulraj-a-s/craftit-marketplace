import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArtistProfileForm from '../../components/profile/ArtistProfileForm';
import { createArtistProfile } from '../../services/artistService';

export default function CompleteArtistProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createArtistProfile(formData);
      navigate('/dashboard/artist');
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-5xl w-full mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Complete Your Artist Profile</h1>
        <p className="mt-2 text-lg text-gray-600">
          This is the first thing clients will see. Make it impressive.
        </p>
      </div>

      {error && (
        <div className="max-w-2xl w-full mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="w-full max-w-5xl">
        <ArtistProfileForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
