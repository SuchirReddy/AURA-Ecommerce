import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Heart, Menu, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile } from '../services/userService';
import { getCartItems } from '../services/cartService';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const [cartCount, setCartCount] = useState(0);

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
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Men', path: '/category/menswear' },
    { name: 'Women', path: '/category/womenswear' },
    { name: 'Accessories', path: '/category/accessories' },
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
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className="navbar-logo">
          <img src="/logo-white.png" alt="AURA Logo" className="navbar-logo-img" />
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="nav-link">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Icons */}
        <div className="navbar-icons">
          <button className="icon-btn" onClick={toggleSearch} aria-label="Toggle search">
            {isSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>
          <Link to="/account" className="icon-btn hidden-mobile"><User size={20} /></Link>
          <Link to="/account/wishlist" className="icon-btn hidden-mobile"><Heart size={20} /></Link>
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
        <div className="mobile-links">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className="mobile-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
        <div className="mobile-actions">
          <Link to="/account" className="mobile-action-btn" onClick={() => setIsMobileMenuOpen(false)}><User size={20} /> Account</Link>
          <Link to="/account/wishlist" className="mobile-action-btn" onClick={() => setIsMobileMenuOpen(false)}><Heart size={20} /> Wishlist</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
