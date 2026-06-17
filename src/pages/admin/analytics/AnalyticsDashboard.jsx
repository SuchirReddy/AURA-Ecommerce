import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Download, Calendar, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalyticsStats } from '../../../services/orderService';
import Loader from '../../../components/Loader';
import './Analytics.css';
import '../AdminDashboard.css';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    aov: 0,
    productsSold: 0,
    topProducts: [],
    dailyRevenue: [],
    salesByCategory: [],
    trends: { revenue: null, orders: null, products: null, aov: null }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAnalyticsStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <Loader fullScreen />;
  }

  const renderTrend = (value) => {
    if (value === null) return <div className="kpi-trend"><span style={{ color: 'var(--text-secondary)' }}>No previous data</span></div>;
    const isPositive = value >= 0;
    return (
      <div className={`kpi-trend ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        <span>{isPositive ? '+' : ''}{value}%</span>
      </div>
    );
  };

  return (
    <div className="admin-analytics-dashboard fade-in">
      <div className="admin-page-header" style={{ marginBottom: '32px' }}>
        <h1>Analytics Overview</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="admin-date-picker" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0 12px' }}>
            <Calendar size={16} color="var(--text-secondary)" style={{ marginRight: '8px' }}/>
            <select className="admin-select" style={{ border: 'none', paddingLeft: 0 }}>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="analytics-kpi-grid">
        <div className="admin-kpi-card">
          <div className="kpi-header"><span className="kpi-title">Gross Sales</span></div>
          <div className="kpi-value">₹{stats.totalRevenue.toLocaleString()}</div>
          {renderTrend(stats.trends.revenue)}
        </div>
        <div className="admin-kpi-card">
          <div className="kpi-header"><span className="kpi-title">Orders</span></div>
          <div className="kpi-value">{stats.totalOrders.toLocaleString()}</div>
          {renderTrend(stats.trends.orders)}
        </div>
        <div className="admin-kpi-card">
          <div className="kpi-header"><span className="kpi-title">Avg Order Value (AOV)</span></div>
          <div className="kpi-value">₹{Number(stats.aov).toLocaleString()}</div>
          {renderTrend(stats.trends.aov)}
        </div>
        <div className="admin-kpi-card">
          <div className="kpi-header"><span className="kpi-title">Products Sold</span></div>
          <div className="kpi-value">{stats.productsSold.toLocaleString()}</div>
          {renderTrend(stats.trends.products)}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts-grid">
        <div className="admin-card" style={{ gridColumn: 'span 2' }}>
          <div className="admin-card-header">
            <h2>Revenue Over Time (Last 30 Days)</h2>
          </div>
          <div className="analytics-chart-container" style={{ height: '300px', width: '100%', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                  minTickGap={30}
                />
                <YAxis 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--text-primary)" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, fill: 'var(--bg-primary)', stroke: 'var(--text-primary)', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Sales by Category</h2>
          </div>
          <div className="analytics-chart-placeholder bar-chart horizontal">
            {stats.salesByCategory.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>No category data available.</div>
            ) : (
              stats.salesByCategory.map((cat, idx) => (
                <div className="mock-bar-row" key={idx}>
                  <span className="bar-label">{cat.name}</span>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${cat.percentage}%` }}></div></div>
                  <span className="bar-value">{cat.percentage}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Top Lists Grid */}
      <div className="analytics-lists-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-lg)' }}>
        
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Top Selling Products</h2>
          </div>
          <table className="admin-data-table" style={{ border: 'none', backgroundColor: 'transparent' }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 0 }}>Product</th>
                <th style={{ textAlign: 'right' }}>Items Sold</th>
                <th style={{ textAlign: 'right', paddingRight: 0 }}>Net Sales</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No sales data.</td></tr>
              ) : (
                stats.topProducts.map((product, idx) => (
                  <tr key={idx}>
                    <td style={{ paddingLeft: 0, fontWeight: '500' }}>{product.name}</td>
                    <td style={{ textAlign: 'right' }}>{product.quantity}</td>
                    <td style={{ textAlign: 'right', paddingRight: 0 }}>₹{product.revenue.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Traffic Sources</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Activity size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Google Analytics Not Connected</h3>
            <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>To view deep traffic insights, conversion rates, and acquisition sources, connect a Google Analytics 4 property in your Store Settings.</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AnalyticsDashboard;
