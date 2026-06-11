import React, { useEffect, useState } from 'react';
import { useAuth, RedirectToSignIn, useUser } from '@clerk/clerk-react';
import { Outlet, Link } from 'react-router-dom';
import { syncUserProfile } from '../../services/userService';

const AdminRoute = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const checkRole = async () => {
      if (isSignedIn && user) {
        try {
          const profile = await syncUserProfile(user);
          setIsAdmin(profile?.role === 'admin');
          setDebugInfo({
            clerkId: user.id,
            envAdminId: import.meta.env.VITE_ADMIN_CLERK_ID,
            profileRole: profile?.role,
            error: null
          });
        } catch (error) {
          console.error("Error checking role:", error);
          setIsAdmin(false);
          setDebugInfo({
            clerkId: user.id,
            envAdminId: import.meta.env.VITE_ADMIN_CLERK_ID,
            profileRole: null,
            error: error.message || error.toString()
          });
        }
      }
      setCheckingRole(false);
    };

    if (isLoaded) {
      checkRole();
    }
  }, [isLoaded, isSignedIn, user]);

  if (!isLoaded || checkingRole) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading Admin...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  if (isAdmin === false) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You do not have permission to view the Admin Dashboard.</p>
        
        {/* DEBUG INFO VISIBLE TO USER */}
        <div style={{ padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', textAlign: 'left', marginBottom: '20px', color: '#991b1b' }}>
          <strong>Debug Info:</strong>
          <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
            <li><strong>Your Clerk ID:</strong> {debugInfo.clerkId}</li>
            <li><strong>.env Admin ID:</strong> {debugInfo.envAdminId || 'undefined (Refresh Page!)'}</li>
            <li><strong>Database Role:</strong> {debugInfo.profileRole || 'Not found'}</li>
            {debugInfo.error && <li><strong>Error:</strong> {debugInfo.error}</li>}
          </ul>
        </div>

        <Link to="/" className="btn-primary" style={{ padding: '10px 24px', textDecoration: 'none' }}>Return Home</Link>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default AdminRoute;
