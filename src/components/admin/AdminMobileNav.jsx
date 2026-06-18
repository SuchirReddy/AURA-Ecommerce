import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Tag, Layers, ShoppingCart, 
  Users, Box, TicketPercent, Star, 
  BarChart3, FileText, Settings, Truck,
  Menu, X, ChevronDown
} from 'lucide-react';
import './AdminMobileNav.css';

const AdminMobileNav = () => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const location = useLocation();

  const handleClose = () => setIsOverlayOpen(false);

  const navGroups = [
    {
      title: 'Overview',
      links: [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} />, end: true },
        { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
      ]
    },
    {
      title: 'Catalog',
      links: [
        { name: 'Products', path: '/admin/products', icon: <Tag size={20} /> },
        { name: 'Categories', path: '/admin/categories', icon: <Layers size={20} /> },
        { name: 'Inventory', path: '/admin/inventory', icon: <Box size={20} /> },
      ]
    },
    {
      title: 'Sales & Users',
      links: [
        { name: 'Orders', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
        { name: 'Customers', path: '/admin/customers', icon: <Users size={20} /> },
        { name: 'Reviews', path: '/admin/reviews', icon: <Star size={20} /> },
      ]
    },
    {
      title: 'Marketing & Content',
      links: [
        { name: 'Coupons', path: '/admin/coupons', icon: <TicketPercent size={20} /> },
        { name: 'Content', path: '/admin/content', icon: <FileText size={20} /> },
      ]
    },
    {
      title: 'Configuration',
      links: [
        { name: 'Shipping', path: '/admin/shipping', icon: <Truck size={20} /> },
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
      ]
    }
  ];

  return (
    <div className="admin-mobile-nav-container">
      {/* Overlay Menu */}
      <div className={`admin-mobile-overlay ${isOverlayOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 4px' }}>
          <img src="/logo-white.png" alt="AURA" style={{ height: '24px' }} />
        </div>
        
        {navGroups.map((group, index) => (
          <div key={group.title} className="admin-menu-group">
            <div className="admin-menu-group-title">
              {group.title}
              <ChevronDown size={14} style={{ opacity: 0.5 }} />
            </div>
            <div className="admin-menu-grid">
              {group.links.map(link => (
                <NavLink 
                  key={link.name}
                  to={link.path}
                  end={link.end}
                  className={({ isActive }) => `admin-menu-grid-btn ${isActive ? 'active' : ''}`}
                  onClick={handleClose}
                >
                  <span className="icon">{link.icon}</span>
                  <span>{link.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <nav className="admin-bottom-bar">
        <NavLink to="/admin" end className={({ isActive }) => `admin-bottom-btn ${isActive && !isOverlayOpen ? 'active' : ''}`} onClick={handleClose}>
          <div className="icon-wrapper"><LayoutDashboard size={20} /></div>
          <span>Home</span>
        </NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => `admin-bottom-btn ${isActive && !isOverlayOpen ? 'active' : ''}`} onClick={handleClose}>
          <div className="icon-wrapper"><Tag size={20} /></div>
          <span>Products</span>
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => `admin-bottom-btn ${isActive && !isOverlayOpen ? 'active' : ''}`} onClick={handleClose}>
          <div className="icon-wrapper"><ShoppingCart size={20} /></div>
          <span>Orders</span>
        </NavLink>
        <NavLink to="/admin/analytics" className={({ isActive }) => `admin-bottom-btn ${isActive && !isOverlayOpen ? 'active' : ''}`} onClick={handleClose}>
          <div className="icon-wrapper"><BarChart3 size={20} /></div>
          <span>Analytics</span>
        </NavLink>
        <button className={`admin-bottom-btn menu-btn ${isOverlayOpen ? 'active' : ''}`} onClick={() => setIsOverlayOpen(!isOverlayOpen)}>
          <div className="icon-wrapper">
            {isOverlayOpen ? <X size={20} /> : <Menu size={20} />}
          </div>
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminMobileNav;
