import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientProfileForm from '../../components/profile/ClientProfileForm';
import { createClientProfile } from '../../services/clientService';

export default function CompleteClientProfilePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await createClientProfile(formData);
      navigate('/artists'); 
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-3xl w-full mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Complete Your Client Profile</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}
        <ClientProfileForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
