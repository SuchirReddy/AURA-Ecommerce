import React from 'react';
import { Package, Tag, Heart } from 'lucide-react';
import './Notifications.css';

const Notifications = () => {
  return (
    <div className="notifications-page fade-in">
      <h1 className="account-section-title">Notifications</h1>

      <div className="notifications-list">
        
        {/* Unread Notification */}
        <div className="notification-card unread">
          <div className="notif-icon order"><Package size={20} /></div>
          <div className="notif-content">
            <div className="notif-header">
              <h3>Order Shipped</h3>
              <span className="notif-time">2 hours ago</span>
            </div>
            <p>Your order #AURA-84729 has been shipped and is on its way. Track your package in the Orders tab.</p>
          </div>
          <span className="unread-dot"></span>
        </div>

        {/* Read Notification */}
        <div className="notification-card">
          <div className="notif-icon promo"><Tag size={20} /></div>
          <div className="notif-content">
            <div className="notif-header">
              <h3>Exclusive Early Access</h3>
              <span className="notif-time">Yesterday</span>
            </div>
            <p>AURA Members get 24-hour early access to the new Fall Collection. Shop now before it sells out.</p>
          </div>
        </div>

        {/* Wishlist Notification */}
        <div className="notification-card">
          <div className="notif-icon wishlist"><Heart size={20} /></div>
          <div className="notif-content">
            <div className="notif-header">
              <h3>Item Back in Stock</h3>
              <span className="notif-time">Oct 12, 2025</span>
            </div>
            <p>The 'Classic Aviator Sunglasses' from your wishlist is back in stock. Grab it now!</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Notifications;
