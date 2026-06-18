import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, Plus, User, Check, CheckCheck, Trash2, Package, AlertTriangle, ShoppingCart, X } from 'lucide-react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, clearAllNotifications } from '../../services/notificationService';
import './AdminNavbar.css';

const NOTIF_ICONS = {
  new_order: <ShoppingCart size={16} />,
  low_stock: <AlertTriangle size={16} />,
  order_status: <Package size={16} />,
};

const NOTIF_COLORS = {
  new_order: '#007aff',
  low_stock: '#ff9500',
  order_status: '#34c759',
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const AdminNavbar = ({ isSidebarOpen, setIsSidebarOpen, setIsMobileOpen }) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  // Fetch unread count on mount and on interval
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    if (showNotifs) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifs]);

  const fetchUnreadCount = async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    const data = await getNotifications(30);
    setNotifications(data);
    setLoading(false);
  };

  const handleTogglePanel = () => {
    if (!showNotifs) {
      fetchNotifications();
    }
    setShowNotifs(!showNotifs);
  };

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">

        
        {/* Desktop Toggle */}
        <button 
          className="admin-icon-btn desktop-only" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{ marginRight: '24px' }}
        >
          <Menu size={20} />
        </button>

        <div className="admin-search-container hidden-mobile">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search orders, products, or customers..." className="admin-search-input" />
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>

      <div className="admin-navbar-right">
        <button className="admin-quick-action-btn hidden-mobile">
          <Plus size={16} /> New Product
        </button>
        
        <button className="admin-icon-btn mobile-only">
          <Search size={20} />
        </button>

        {/* Notification Bell */}
        <div className="notif-wrapper" ref={panelRef}>
          <button className="admin-icon-btn notification-btn" onClick={handleTogglePanel}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Panel */}
          {showNotifs && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <h3>Notifications</h3>
                <div className="notif-panel-actions">
                  {unreadCount > 0 && (
                    <button className="notif-header-btn" onClick={handleMarkAllRead} title="Mark all as read">
                      <CheckCheck size={15} />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button className="notif-header-btn" onClick={handleClearAll} title="Clear all">
                      <Trash2 size={15} />
                    </button>
                  )}
                  <button className="notif-header-btn" onClick={() => setShowNotifs(false)} title="Close">
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="notif-panel-body">
                {loading ? (
                  <div className="notif-empty">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Bell size={32} strokeWidth={1.2} />
                    <span>No notifications yet</span>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                      onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                    >
                      <div 
                        className="notif-icon" 
                        style={{ backgroundColor: `${NOTIF_COLORS[notif.type] || '#86868b'}15`, color: NOTIF_COLORS[notif.type] || '#86868b' }}
                      >
                        {NOTIF_ICONS[notif.type] || <Bell size={16} />}
                      </div>
                      <div className="notif-content">
                        <span className="notif-title">{notif.title}</span>
                        <span className="notif-message">{notif.message}</span>
                        <span className="notif-time">{timeAgo(notif.created_at)}</span>
                      </div>
                      {!notif.is_read && <div className="notif-unread-dot"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="admin-profile-menu">
          <div className="admin-avatar">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
