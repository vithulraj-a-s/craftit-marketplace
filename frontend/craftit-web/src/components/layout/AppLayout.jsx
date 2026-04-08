import React from 'react';
import Navbar from './Navbar';
import { Outlet, useLocation } from 'react-router-dom';

export default function AppLayout() {
  const location = useLocation();
  
  const hideNavbarRoutes = ['/login', '/register', '/verify-otp', '/forgot-password', '/'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {!shouldHideNavbar && <Navbar />}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}
