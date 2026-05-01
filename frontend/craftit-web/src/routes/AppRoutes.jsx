import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


import RoleSelect from "../pages/RoleSelect";
import Register from "../pages/Register";
import VerifyOTP from "../pages/VerifyOTP";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import { Loader } from "../components/ui/Loader";


import ArtistsPage from '../pages/discovery/ArtistsPage';
import ArtistDetailPage from '../pages/discovery/ArtistDetailPage';
import CompleteArtistProfilePage from '../pages/profile/CompleteArtistProfilePage';
import CompleteClientProfilePage from '../pages/profile/CompleteClientProfilePage';
import ArtistProfileSettingsPage from '../pages/profile/ArtistProfileSettingsPage';
import ClientProfileSettingsPage from '../pages/profile/ClientProfileSettingsPage';


import AppLayout from '../components/layout/AppLayout';
import ArtistDashboard from '../pages/dashboard/ArtistDashboard';
import PortfolioPage from '../pages/dashboard/PortfolioPage';
import SavedArtistsPage from '../pages/dashboard/SavedArtistsPage';
import ClientRequestsPage from '../pages/dashboard/ClientRequestsPage';
import ArtistRequestsPage from '../pages/dashboard/ArtistRequestsPage';
import RequestDetailPage from '../pages/dashboard/RequestDetailPage';
import ClientOrdersPage from '../pages/dashboard/ClientOrdersPage';
import ArtistQuotesPage from '../pages/dashboard/ArtistQuotesPage';
import ClientQuotesPage from '../pages/dashboard/ClientQuotesPage';
import ArtistOrdersPage from '../pages/dashboard/ArtistOrdersPage';
import OrderDetailPage from '../pages/dashboard/OrderDetailPage';
import ChatPage from '../pages/chat/ChatPage';

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

//   if (user) { # you can remove this lock of commented code if you need 
//   if (user.role === "ARTIST") {
//     return <Navigate to="/artist/dashboard" replace />;
//   }

//   if (user.role === "CLIENT") {
//     return <Navigate to="/dashboard" replace />;
//   }

//   // fallback (in case something unexpected comes)
//   return <Navigate to="/" replace />;
// }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={32} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (only for login/register pages)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={32} />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>

      
      <Route
        path="/"
        element={
          <PublicRoute>
            <RoleSelect />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<AppLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/dashboard/artist" 
          element={
            <ProtectedRoute>
              <ArtistDashboard />
            </ProtectedRoute>
          } 
        />
        
        
        <Route path="/dashboard/artist/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
        <Route path="/dashboard/artist/requests" element={<ProtectedRoute><ArtistRequestsPage /></ProtectedRoute>} />
        <Route path="/dashboard/artist/requests/:id" element={<ProtectedRoute><RequestDetailPage /></ProtectedRoute>} />

        <Route path="/dashboard/artist/quotes" element={<ProtectedRoute><ArtistQuotesPage /></ProtectedRoute>} />
        <Route path="/dashboard/artist/orders" element={<ProtectedRoute><ArtistOrdersPage /></ProtectedRoute>} />
        <Route path="/dashboard/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        
        <Route
          path="/complete-artist-profile"
          element={
            <ProtectedRoute>
              <CompleteArtistProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/complete-client-profile"
          element={
            <ProtectedRoute>
              <CompleteClientProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/artist/profile"
          element={
            <ProtectedRoute>
              <ArtistProfileSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/profile"
          element={
            <ProtectedRoute>
              <ClientProfileSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/saved-artists"
          element={
            <ProtectedRoute>
              <SavedArtistsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/requests"
          element={
            <ProtectedRoute>
              <ClientRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/requests/:id"
          element={
            <ProtectedRoute>
              <RequestDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/quotes"
          element={
            <ProtectedRoute>
              <ClientQuotesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client/orders"
          element={
            <ProtectedRoute>
              <ClientOrdersPage />
            </ProtectedRoute>
          }
        />

        <Route path="/artists" element={<ArtistsPage />} />
        <Route path="/artists/:slug" element={<ArtistDetailPage />} />
      </Route>

      <Route 
        path="/chat/:orderId" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}