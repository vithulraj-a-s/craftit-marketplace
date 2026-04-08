import React, { useEffect, useState } from 'react';
import { getCurrentClient, updateClientProfile } from '../../services/clientService';
import ClientProfileForm from '../../components/profile/ClientProfileForm';
import { Loader } from '../../components/ui/Loader';

export default function ClientProfileSettingsPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentClient();
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await updateClientProfile(formData);
      setProfile(data);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size={48} />
      </div>
    );
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full">
      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-gray-900">Client Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information.</p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {profile && (
        <ClientProfileForm 
          key={profile.updated_at || Date.now()}
          initialData={profile} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      )}
    </div>
  );
}
