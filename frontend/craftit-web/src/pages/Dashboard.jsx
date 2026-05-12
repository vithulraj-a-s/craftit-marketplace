import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentArtist } from '../services/artistService';
import { getCurrentClient } from '../services/clientService';
import { Loader } from '../components/ui/Loader';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) return;

    const checkProfile = async () => {

      try {
        if (user.is_staff) {
          navigate('/admin/dashboard', {replace: true});
          return;
        }

        if (user.role === 'artist' || user.role === 'ARTIST') {
          await getCurrentArtist();
          navigate('/dashboard/artist', {replace: true});
          return;
        }

        if (user.role === 'client' || user.role === 'CLIENT') {
          await getCurrentClient();
          navigate('/artists', {replace: true});
          return;
        }

      } catch (err) {

        if (err?.response?.status === 404) {
          if (user.role === 'artist' || user.role === 'ARTIST') {
            navigate('/complete-artist-profile', { replace: true }
            );

          } else if (user.role === 'client' || user.role === 'CLIENT') {
            navigate('/complete-client-profile', { replace: true });
          }
        }

      } finally {
        setChecking(false);
      }
    };

    checkProfile();

  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {checking ? <Loader size={48} /> : null}
    </div>
  );
}
