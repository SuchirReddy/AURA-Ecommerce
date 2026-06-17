import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Tag, Layers, ShoppingCart, 
  Users, Box, TicketPercent, Star, 
  BarChart3, FileText, Settings, Truck 
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }) => {
  
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
        { name: 'Shipping & Returns', path: '/admin/shipping', icon: <Truck size={20} /> },
      ]
    }
  ];

  return (
    <aside className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="admin-sidebar-header">
        <NavLink to="/admin" className="admin-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'flex-start' : 'center', width: '100%' }}>
          {isOpen ? (
            <img src="/logo-white.png" alt="AURA Admin" style={{ height: '28px' }} />
          ) : (
            <img src="/logo-white.png" alt="A" style={{ height: '24px', width: '24px', objectFit: 'cover', objectPosition: 'left' }} />
          )}
        </NavLink>
      </div>

      <nav className="admin-sidebar-nav">
        {navGroups.map((group, index) => (
          <div key={group.title} className="admin-nav-group" style={{ marginBottom: isOpen ? '16px' : '8px' }}>
            {isOpen && <div className="admin-nav-group-title" style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', padding: '0 var(--spacing-xl)', marginBottom: '8px', fontWeight: '600' }}>{group.title}</div>}
            <ul className="admin-nav-list">
              {group.links.map((link) => (
                <li key={link.name}>
                  <NavLink 
                    to={link.path}
                    end={link.end}
                    className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                    title={!isOpen ? link.name : ''}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <span className="admin-nav-icon">{link.icon}</span>
                    {isOpen && <span className="admin-nav-text">{link.name}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ flexGrow: 1 }}></div>

        <div className="admin-nav-divider"></div>

        <ul className="admin-nav-list">
          <li>
            <NavLink 
              to="/admin/settings" 
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              title={!isOpen ? 'Settings' : ''}
              onClick={() => setIsMobileOpen(false)}
            >
              <span className="admin-nav-icon"><Settings size={20} /></span>
              {isOpen && <span className="admin-nav-text">Settings</span>}
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
