import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { getOrders, getAnalyticsStats } from '../../services/orderService';
import { getProducts } from '../../services/productService';
import { getCustomers } from '../../services/userService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    ordersCount: 0,
    customersCount: 0,
    productsSold: 0,
    trends: { revenue: null, orders: null, products: null }
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersData, productsData, customersData, stats] = await Promise.all([
          getOrders(),
          getProducts(),
          getCustomers(),
          getAnalyticsStats()
        ]);

        setMetrics({
          revenue: stats.totalRevenue,
          ordersCount: stats.totalOrders,
          customersCount: customersData.length,
          productsSold: stats.productsSold,
          trends: stats.trends || { revenue: null, orders: null, products: null }
        });

        setRecentOrders(ordersData.slice(0, 5));
        setLowStockProducts(productsData.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Dashboard Overview</h1>
        <div className="admin-date-picker">
          <select className="admin-select">
            <option>All Time</option>
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Revenue</span>
            <button className="kpi-more"><MoreHorizontal size={16} /></button>
          </div>
          <div className="kpi-value">₹{metrics.revenue.toLocaleString()}</div>
          {metrics.trends.revenue !== null ? (
            <div className={`kpi-trend ${metrics.trends.revenue >= 0 ? 'positive' : 'negative'}`}>
              {metrics.trends.revenue >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{Math.abs(metrics.trends.revenue)}% vs last month</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>No previous month data</div>
          )}
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Orders</span>
            <button className="kpi-more"><MoreHorizontal size={16} /></button>
          </div>
          <div className="kpi-value">{metrics.ordersCount}</div>
          {metrics.trends.orders !== null ? (
            <div className={`kpi-trend ${metrics.trends.orders >= 0 ? 'positive' : 'negative'}`}>
              {metrics.trends.orders >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{Math.abs(metrics.trends.orders)}% vs last month</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Total orders placed</div>
          )}
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Customers</span>
            <button className="kpi-more"><MoreHorizontal size={16} /></button>
          </div>
          <div className="kpi-value">{metrics.customersCount}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Registered users</div>
        </div>

        <div className="admin-kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Est. Products Sold</span>
            <button className="kpi-more"><MoreHorizontal size={16} /></button>
          </div>
          <div className="kpi-value">{metrics.productsSold}</div>
          {metrics.trends.products !== null ? (
            <div className={`kpi-trend ${metrics.trends.products >= 0 ? 'positive' : 'negative'}`}>
              {metrics.trends.products >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{Math.abs(metrics.trends.products)}% vs last month</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Items across all orders</div>
          )}
        </div>
      </div>

      {/* Main Dashboard Content Grid */}
      <div className="admin-dashboard-content-grid">

        {/* Left Column */}
        <div className="admin-col-large">
          {/* Chart Placeholder */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Revenue Overview</h2>
              <button className="admin-text-btn">View Report</button>
            </div>
            <div className="admin-chart-placeholder">
              <div className="chart-bars">
                <div className="bar" style={{ height: '40%' }}></div>
                <div className="bar" style={{ height: '60%' }}></div>
                <div className="bar" style={{ height: '45%' }}></div>
                <div className="bar" style={{ height: '80%' }}></div>
                <div className="bar" style={{ height: '65%' }}></div>
                <div className="bar" style={{ height: '90%' }}></div>
                <div className="bar" style={{ height: '75%' }}></div>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Recent Orders</h2>
              <button className="admin-text-btn">View All</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No recent orders.</td></tr>
                  ) : (
                    recentOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.order_number || order.id.substring(0, 8)}</td>
                        <td>{order.profiles?.full_name || order.profiles?.email || 'Unknown User'}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td><span className={`admin-badge ${order.fulfillment_status === 'delivered' ? 'completed' : order.fulfillment_status === 'processing' ? 'processing' : 'pending'}`}>{order.fulfillment_status}</span></td>
                        <td>₹{order.total_amount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="admin-col-small">
          {/* Low Stock Widget */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Low Stock Alert</h2>
            </div>
            <div className="admin-list-widget">
              {lowStockProducts.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>All products are sufficiently stocked.</div>
              ) : (
                lowStockProducts.map(product => (
                  <div key={product.id} className="admin-list-item">
                    <div className="item-info">
                      <span className="item-title">{product.name}</span>
                      <span className="item-subtitle">{product.sku || 'N/A'}</span>
                    </div>
                    <span className="item-count critical">{product.stock_quantity} left</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
