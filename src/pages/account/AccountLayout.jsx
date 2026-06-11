import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { SignOutButton, useUser } from '@clerk/clerk-react';
import { LayoutDashboard, Package, Heart, MapPin, Settings, Bell, LogOut, Menu, X } from 'lucide-react';
import { syncUserProfile } from '../../services/userService';
import './AccountLayout.css';

const AccountLayout = () => {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const { user } = useUser();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const p = await syncUserProfile(user);
        setProfile(p);
      }
    };
    fetchProfile();
  }, [user]);

  const navItems = [
    { name: 'Dashboard', path: '/account', icon: <LayoutDashboard size={20} />, end: true },
    { name: 'My Orders', path: '/account/orders', icon: <Package size={20} /> },
    { name: 'Wishlist', path: '/account/wishlist', icon: <Heart size={20} /> },
    { name: 'Addresses', path: '/account/addresses', icon: <MapPin size={20} /> },
    { name: 'Settings', path: '/account/settings', icon: <Settings size={20} /> },
    { name: 'Notifications', path: '/account/notifications', icon: <Bell size={20} /> }
  ];

  return (
    <div className="account-page">
      <div className="container account-container">
        
        {/* Mobile Title */}
        <div className="account-mobile-header">
          <h1 className="account-mobile-title">My Account</h1>
        </div>

        {/* Desktop Sidebar */}
        <div className="account-sidebar desktop-sidebar">
          <div className="sidebar-user-info">
            <div className="user-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{(profile?.full_name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="user-details" style={{ overflow: 'hidden' }}>
              <h3 style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{profile?.full_name || 'Loading...'}</h3>
              <p style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{profile?.email}</p>
            </div>
          </div>

          <nav className="account-nav">
            {navItems.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.path} 
                end={item.end}
                className={({ isActive }) => `account-nav-link ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
            
            <div className="nav-divider"></div>
            
            <SignOutButton redirectUrl="/">
              <button className="account-nav-link logout-btn" style={{ width: '100%' }}>
                <LogOut size={20} />
                <span>Log out</span>
              </button>
            </SignOutButton>
          </nav>
        </div>

        {/* Floating FAB Menu (Mobile Only) */}
        <div className="fab-container">
          {isFabOpen && (
            <div className="fab-backdrop" onClick={() => setIsFabOpen(false)}></div>
          )}

          <div className={`fab-menu ${isFabOpen ? 'open' : ''}`}>
            {navItems.map((item, index) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `fab-menu-item ${isActive ? 'active' : ''}`}
                style={{ transitionDelay: isFabOpen ? `${index * 40}ms` : '0ms' }}
                onClick={() => setIsFabOpen(false)}
              >
                <span className="fab-menu-label">{item.name}</span>
                <span className="fab-menu-icon">{item.icon}</span>
              </NavLink>
            ))}
            <SignOutButton redirectUrl="/">
              <button 
                className="fab-menu-item logout"
                style={{ transitionDelay: isFabOpen ? `${navItems.length * 40}ms` : '0ms' }}
                onClick={() => setIsFabOpen(false)}
              >
                <span className="fab-menu-label">Log out</span>
                <span className="fab-menu-icon"><LogOut size={20} /></span>
              </button>
            </SignOutButton>
          </div>

          <button 
            className={`fab-toggle ${isFabOpen ? 'open' : ''}`}
            onClick={() => setIsFabOpen(!isFabOpen)}
            aria-label="Toggle account menu"
          >
            {isFabOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="account-main-content">
          <Outlet />
        </div>

      </div>
    </div>
  );
};

export default AccountLayout;
