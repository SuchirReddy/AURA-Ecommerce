import React, { useState, useEffect } from 'react';
import { Camera, Eye, EyeOff } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile } from '../../services/userService';
import { supabase } from '../../lib/supabase';
import ImageUploader from '../../components/ImageUploader';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const Settings = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const p = await syncUserProfile(user);
          setProfile(p);
        } catch (error) {
          console.error("Error loading profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadProfile();
  }, [user]);

  const handleUploadAvatarComplete = async (newUrl) => {
    // Update local state for immediate feedback
    setProfile(prev => ({ ...prev, avatar_url: newUrl }));
    
    // Save to Supabase
    if (profile?.id) {
      try {
        await supabase
          .from('profiles')
          .update({ avatar_url: newUrl })
          .eq('id', profile.id);
      } catch (err) {
        console.error("Error saving avatar to database:", err);
        alert("Error saving your new profile picture.");
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading settings...</div>;
  }

  return (
    <div className="settings-page fade-in">
      <h1 className="account-section-title">Account Settings</h1>

      <div className="dashboard-section" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '32px' }}>
        <div className="profile-photo-section" style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
          <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem', overflow: 'hidden', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (profile?.full_name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div className="photo-actions" style={{ maxWidth: '300px' }}>
            <ImageUploader 
              folder="avatars"
              maxFiles={1}
              buttonText="Change Photo"
              compact={true}
              onUploadComplete={handleUploadAvatarComplete}
            />
          </div>
        </div>

        <h2>Personal Information</h2>
        <form className="settings-form" style={{ maxWidth: '600px' }}>
          <div className="input-row" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" className="checkout-input" defaultValue={profile?.full_name || ''} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Name is managed via Clerk Auth.</p>
            </div>
          </div>
          
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', marginTop: '16px', color: 'var(--text-secondary)' }}>Email Address</label>
          <input type="email" className="checkout-input" defaultValue={profile?.email || ''} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
        </form>
      </div>
    </div>
  );
};

export default Settings;
