import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Flashlight, ShoppingBag, User, Heart, Menu, X, Sun, Moon, Plus, Bookmark, Home, Compass, Mail, Store } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile } from '../services/userService';
import { getCartItems } from '../services/cartService';
import { useTheme } from '../contexts/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const [cartCount, setCartCount] = useState(0);
  const { theme, toggleTheme } = useTheme();

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
    const handleScroll = () => {
      const threshold = location.pathname === '/' ? window.innerHeight - 80 : 20;
      setIsScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Catalog', path: '/shop' },
    { name: 'Contact', path: '/contact' },
  ];

  const toggleSearch = () => {
    setIsSearchOpen(prev => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      return !prev;
    });
  };

  useEffect(() => {
    const handleToggleMobileSearch = () => toggleSearch();
    window.addEventListener('toggleMobileSearch', handleToggleMobileSearch);
    return () => window.removeEventListener('toggleMobileSearch', handleToggleMobileSearch);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const trimmed = searchQuery.trim();
      if (trimmed && isSearchOpen) {
        navigate(`/shop?search=${encodeURIComponent(trimmed)}`);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isSearchOpen, navigate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/shop?search=${encodeURIComponent(trimmed)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${location.pathname === '/shop' ? 'shop-mode' : ''}`}>
      <div className="container navbar-container">

        {/* Left Side: Menu + Links */}
        <div className="navbar-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X size={20} />
            ) : (
              <>
                <span className="mobile-only-icon"><Plus size={20} /></span>
                <span className="desktop-only-icon"><Menu size={20} /></span>
              </>
            )}
          </button>

          <div className="navbar-links desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '4px' }}>
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Home size={16} /> Home
            </Link>
            <Link to="/shop" className={`nav-link ${location.pathname.startsWith('/shop') ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={16} /> Shop
            </Link>
          </div>

          <Link to="/" className="navbar-logo mobile-only-logo" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/logo-white.png" alt="AURA Logo" className="navbar-logo-img" />
          </Link>
        </div>

        {/* Center: Logo (Hidden when transparent at top) */}
        <Link to="/" className={`navbar-logo desktop-only-logo ${!isScrolled ? 'logo-hidden' : ''}`}>
          <img src="/logo-white.png" alt="AURA Logo" className="navbar-logo-img" />
        </Link>

        {/* Right Side: Search + Icons */}
        <div className="navbar-icons">
          {location.pathname === '/shop' && (
            <div id="navbar-shop-controls" className="navbar-shop-controls"></div>
          )}

          <button className="icon-btn" onClick={toggleSearch} aria-label="Toggle search">
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          <Link to="/account" className="icon-btn hidden-mobile" aria-label="Profile">
            <User size={20} />
          </Link>

          <Link to="/account/wishlist" className="icon-btn" aria-label="Wishlist">
            <Heart size={20} />
          </Link>
          <Link to="/cart" className="icon-btn cart-btn">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>

      </div>

      {/* Search Overlay */}
      <div className={`navbar-search-overlay ${isSearchOpen ? 'open' : ''}`}>
        <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
          <Search size={20} className="navbar-search-icon" />
          <input
            ref={searchInputRef}
            type="text"
            className="navbar-search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button type="submit" className="navbar-search-submit" aria-label="Submit search">
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-grid">
          <Link to="/" className="mobile-menu-box" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="mobile-menu-icon"><Home size={24} /></div>
            <span>Home</span>
          </Link>
          <Link to="/shop" className="mobile-menu-box" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="mobile-menu-icon"><Compass size={24} /></div>
            <span>Catalog</span>
          </Link>
          <Link to="/contact" className="mobile-menu-box" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="mobile-menu-icon"><Mail size={24} /></div>
            <span>Contact</span>
          </Link>
          <Link to="/account" className="mobile-menu-box" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="mobile-menu-icon"><User size={24} /></div>
            <span>Account</span>
          </Link>
          <Link to="/account/wishlist" className="mobile-menu-box" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="mobile-menu-icon"><Heart size={24} /></div>
            <span>Wishlist</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
