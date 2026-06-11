import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile } from '../../services/userService';

const AuthSync = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      syncUserProfile(user).catch(err => {
        console.error("Failed to sync user profile to Supabase:", err);
      });
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
};

export default AuthSync;
