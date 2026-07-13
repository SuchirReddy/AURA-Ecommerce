import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, User, Heart, Search } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { getCartItems } from '../../services/cartService';
import { syncUserProfile } from '../../services/userService';
import './MobileFloatingBar.css';

const MobileFloatingBar = () => {
  const location = useLocation();
  const { user } = useUser();
  const [cartCount, setCartCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const fetchCartCount = async () => {
    try {
      if (user) {
        const profile = await syncUserProfile(user);
        if (profile) {
          const items = await getCartItems(profile.id);
          const count = items.reduce((acc, item) => acc + item.quantity, 0);
          setCartCount(count);
        }
      } else {
        const items = await getCartItems(null);
        const count = items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => window.removeEventListener('cartUpdated', fetchCartCount);
  }, [user]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Special logic for homepage: hide it entirely when above the fold
      if (location.pathname === '/') {
        if (currentScrollY <= window.innerHeight - 80) {
          setIsVisible(false);
          lastScrollY = currentScrollY;
          return;
        }
      }

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down (and past the very top)
        setIsVisible(false);
      } else {
        // Scrolling up (or at the top)
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  if (location.pathname.startsWith('/product/')) {
    return null;
  }

  return (
    <div className={`mobile-floating-bar-wrapper ${!isVisible ? 'hidden' : ''}`}>
      
      <div className="mfb-glass-pill">
        <Link to="/shop" className={`mfb-item ${location.pathname.includes('/shop') ? 'active' : ''}`}>
          <div className="mfb-icon-bg">
            <Store size={24} />
          </div>
        </Link>
        
        <Link to="/account" className={`mfb-item ${location.pathname.includes('/account') ? 'active' : ''}`}>
          <div className="mfb-icon-bg">
            <User size={24} />
          </div>
        </Link>

        <Link to="/account/wishlist" className={`mfb-item ${location.pathname.includes('/wishlist') ? 'active' : ''}`}>
          <div className="mfb-icon-bg">
            <Heart size={24} />
          </div>
        </Link>

        <div onClick={() => window.dispatchEvent(new CustomEvent('toggleMobileSearch'))} className="mfb-item" style={{ cursor: 'pointer' }}>
          <div className="mfb-icon-bg">
            <Search size={24} />
          </div>
        </div>
      </div>

      <Link to="/" className="mfb-logo-circle">
        <img src="/logo-black.png" alt="Logo" onError={(e) => { e.target.onerror = null; e.target.src = '/logo-white.png'; e.target.style.filter = 'invert(1)'; }} />
      </Link>

    </div>
  );
};

export default MobileFloatingBar;
