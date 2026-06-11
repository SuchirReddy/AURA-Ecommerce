import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink } from 'lucide-react';
import { getOrders } from '../../../services/orderService';
import '../AdminTables.css';

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="admin-orders-list fade-in">
      <div className="admin-list-header">
        <h1>Orders</h1>
      </div>

      <div className="admin-filters-bar">
        <div className="admin-search-input-wrapper">
          <Search size={18} className="admin-search-icon" />
          <input type="text" placeholder="Search orders, customers..." />
        </div>
        <select className="admin-filter-select">
          <option>Status</option>
          <option>pending</option>
          <option>processing</option>
          <option>shipped</option>
          <option>delivered</option>
        </select>
        <select className="admin-filter-select">
          <option>Payment</option>
          <option>paid</option>
          <option>pending</option>
          <option>failed</option>
          <option>refunded</option>
        </select>
        <select className="admin-filter-select">
          <option>Date</option>
          <option>Today</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>

      <div className="admin-data-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" className="table-checkbox" /></th>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>No orders found.</td></tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td><input type="checkbox" className="table-checkbox" /></td>
                  <td>
                    <Link to={`/admin/orders/${order.id}`} className="table-product-name" style={{ fontWeight: '600' }}>#{order.order_number}</Link>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {new Date(order.created_at).toLocaleDateString()}<br/>
                    {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td>
                    <Link to={`/admin/customers/${order.user_id}`} className="table-product-name">
                      {order.profiles?.full_name || order.profiles?.email || 'Unknown User'}
                    </Link>
                  </td>
                  <td style={{ fontWeight: '500' }}>₹{order.total_amount}</td>
                  <td className="admin-td">
                  <span className={`status-badge status-${order.payment_status || 'pending'}`}>
                    {order.payment_status || 'Pending'}
                  </span>
                </td>
                  <td>
                    <span className={`admin-badge ${order.status === 'delivered' ? 'completed' : order.status === 'processing' ? 'processing' : 'pending'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <Link to={`/admin/orders/${order.id}`} className="table-action-btn" title="View Order"><ExternalLink size={16} /></Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {!loading && orders.length > 0 && (
          <div className="admin-pagination">
            <span>Showing 1 to {orders.length} of {orders.length} orders</span>
            <div className="pagination-controls">
              <button className="btn-secondary small-btn" disabled>Previous</button>
              <button className="btn-secondary small-btn" disabled>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
