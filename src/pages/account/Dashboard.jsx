import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, MapPin, CreditCard } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { syncUserProfile, getUserAddresses, getWishlist } from '../../services/userService';
import { getOrders } from '../../services/orderService';
import Loader from '../../components/Loader';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState({ orders: 0, wishlist: 0, addresses: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const userProfile = await syncUserProfile(user);
        setProfile(userProfile);

        if (userProfile?.id) {
          const [ordersResponse, addresses, wishlist] = await Promise.all([
            getOrders(userProfile.id),
            getUserAddresses(userProfile.id),
            getWishlist(userProfile.id)
          ]);

          setMetrics({
            orders: ordersResponse.count || (ordersResponse.data ? ordersResponse.data.length : 0),
            addresses: addresses.length,
            wishlist: wishlist.length
          });

          setRecentOrders(ordersResponse.data.slice(0, 2));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="dashboard-overview fade-in">
      <h1 className="account-section-title">Dashboard</h1>
      <p className="welcome-text">Welcome back, <strong>{profile?.full_name || 'User'}</strong>. Here's a snapshot of your account activity.</p>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <Link to="/account/orders" className="metric-card">
          <div className="metric-icon"><Package size={24} /></div>
          <div className="metric-info">
            <span className="metric-value">{metrics.orders}</span>
            <span className="metric-label">Total Orders</span>
          </div>
        </Link>
        <Link to="/account/wishlist" className="metric-card">
          <div className="metric-icon"><Heart size={24} /></div>
          <div className="metric-info">
            <span className="metric-value">{metrics.wishlist}</span>
            <span className="metric-label">Saved Items</span>
          </div>
        </Link>
        <Link to="/account/addresses" className="metric-card">
          <div className="metric-icon"><MapPin size={24} /></div>
          <div className="metric-info">
            <span className="metric-value">{metrics.addresses}</span>
            <span className="metric-label">Addresses</span>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="dashboard-section">
        <div className="section-header-flex">
          <h2>Recent Orders</h2>
          <Link to="/account/orders" className="view-all-link">View all orders</Link>
        </div>
        
        <div className="recent-orders-list">
          {recentOrders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>You haven't placed any orders yet.</p>
          ) : (
            recentOrders.map(order => (
              <div key={order.id} className="recent-order-card">
                <div className="order-summary-info">
                  <span className="order-id">Order #{order.order_number || order.id.substring(0,8)}</span>
                  <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className={`order-status-badge ${order.status === 'delivered' ? 'delivered' : 'preparing'}`}>{order.status}</div>
                <span className="order-total">₹{order.total_amount}</span>
                <Link to={`/account/orders`} className="btn-secondary small-btn">View Details</Link>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Account Summary</h2>
        <div className="account-summary-card">
          <div className="summary-info-row">
            <span className="label">Name:</span>
            <span className="value">{profile?.full_name || 'Not set'}</span>
          </div>
          <div className="summary-info-row">
            <span className="label">Email:</span>
            <span className="value">{profile?.email}</span>
          </div>
          <div className="summary-info-row">
            <span className="label">Role:</span>
            <span className="value" style={{textTransform: 'capitalize'}}>{profile?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
