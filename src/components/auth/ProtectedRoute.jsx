import React from 'react';
import { useAuth, RedirectToSignIn } from '@clerk/clerk-react';
import { Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    // Basic loading state to prevent flash of login redirect
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
