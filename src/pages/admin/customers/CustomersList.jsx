import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ExternalLink } from 'lucide-react';
import { getCustomers } from '../../../services/userService';
import '../AdminTables.css';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const getInitials = (name, email) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    return email ? email.substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="admin-customers-list fade-in">
      <div className="admin-list-header">
        <h1>Customers</h1>
      </div>

      <div className="admin-filters-bar">
        <div className="admin-search-input-wrapper">
          <Search size={18} className="admin-search-icon" />
          <input type="text" placeholder="Search customers by name or email..." />
        </div>
        <select className="admin-filter-select">
          <option>Email Subscription</option>
          <option>Subscribed</option>
          <option>Not Subscribed</option>
        </select>
        <select className="admin-filter-select">
          <option>Location</option>
          <option>All Locations</option>
        </select>
      </div>

      <div className="admin-data-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" className="table-checkbox" /></th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading customers...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No customers found.</td></tr>
            ) : (
              customers.map(customer => {
                const totalOrders = customer.orders ? customer.orders.length : 0;
                const totalSpent = customer.orders ? customer.orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) : 0;
                
                return (
                  <tr key={customer.id}>
                    <td><input type="checkbox" className="table-checkbox" /></td>
                    <td>
                      <div className="table-product-cell">
                        <div className="table-product-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '50%' }}>
                          {customer.avatar_url ? (
                            <img src={customer.avatar_url} alt={customer.full_name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : getInitials(customer.full_name, customer.email)}
                        </div>
                        <span className="table-product-name" style={{ fontWeight: '600' }}>{customer.full_name || 'Anonymous User'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{customer.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>-</td>
                    <td>{totalOrders}</td>
                    <td style={{ fontWeight: '500' }}>₹{totalSpent.toLocaleString()}</td>
                    <td>
                      <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                        <Link to={`/admin/customers/${customer.id}`} className="table-action-btn" title="View Profile"><ExternalLink size={16} /></Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && customers.length > 0 && (
          <div className="admin-pagination">
            <span>Showing 1 to {customers.length} of {customers.length} customers</span>
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

export default CustomersList;
