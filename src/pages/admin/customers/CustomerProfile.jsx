import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, MapPin, Mail } from 'lucide-react';
import { getCustomerById } from '../../../services/userService';
import '../AdminDetails.css';

const CustomerProfile = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const data = await getCustomerById(id);
        setCustomer(data);
      } catch (error) {
        console.error('Error fetching customer:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading customer...</div>;
  if (!customer) return <div style={{ padding: '40px', textAlign: 'center' }}>Customer not found.</div>;

  const totalSpend = customer.orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
  const totalOrders = customer.orders?.length || 0;
  const avgOrderValue = totalOrders > 0 ? (totalSpend / totalOrders).toFixed(0) : 0;
  const initials = (customer.full_name || customer.email || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  const defaultAddress = customer.addresses?.[0];

  return (
    <div className="admin-customer-profile fade-in">
      <div className="admin-details-header" style={{ marginBottom: '32px' }}>
        <div className="admin-details-header-left">
          <Link to="/admin/customers" className="back-btn" style={{ width: 'fit-content', marginBottom: '12px' }}><ChevronLeft size={20} /></Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '50%', fontSize: '1.1rem', fontWeight: '600', flexShrink: 0, overflow: 'hidden' }}>
              {customer.avatar_url
                ? <img src={customer.avatar_url} alt={customer.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div>
              <h1 style={{ marginBottom: '4px' }}>{customer.full_name || 'Unnamed User'}</h1>
              <div className="admin-details-subtitle">
                Customer since {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-details-layout">

        {/* Main Content (Left) */}
        <div className="admin-details-main">

          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-lg)' }}>
            <div className="admin-details-section" style={{ padding: 'var(--spacing-lg)' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Spend</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>₹{totalSpend.toLocaleString('en-IN')}</span>
            </div>
            <div className="admin-details-section" style={{ padding: 'var(--spacing-lg)' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Orders</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>{totalOrders}</span>
            </div>
            <div className="admin-details-section" style={{ padding: 'var(--spacing-lg)' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Avg Order Value</span>
              <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>₹{Number(avgOrderValue).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Order History */}
          <div className="admin-details-section">
            <div className="admin-details-section-header">
              <h2>Order History</h2>
            </div>
            {customer.orders?.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No orders placed yet.</p>
            ) : (
              <table className="admin-data-table" style={{ border: 'none', backgroundColor: 'transparent' }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 0 }}>Order</th>
                    <th>Date</th>
                    <th>Fulfillment</th>
                    <th>Payment</th>
                    <th style={{ textAlign: 'right', paddingRight: 0 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(order => (
                    <tr key={order.id}>
                      <td style={{ paddingLeft: 0 }}>
                        <Link to={`/admin/orders/${order.id}`} className="table-product-name" style={{ fontWeight: '600' }}>
                          #{order.order_number || order.id.substring(0, 8)}
                        </Link>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        <span className={`admin-badge ${order.status === 'delivered' ? 'completed' : order.status === 'cancelled' ? 'cancelled' : 'processing'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${order.payment_status === 'paid' ? 'completed' : 'pending'}`}>
                          {order.payment_status || 'pending'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: 0, fontWeight: '500' }}>₹{(order.total_amount || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="admin-details-sidebar">

          <div className="admin-details-section">
            <div className="admin-details-section-header">
              <h2>Contact Information</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem' }}>
                <Mail size={16} color="var(--text-secondary)" />
                <span>{customer.email || 'No email'}</span>
              </div>
            </div>
          </div>

          {defaultAddress && (
            <div className="admin-details-section">
              <div className="admin-details-section-header">
                <h2>Default Address</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', lineHeight: '1.7' }}>
                <MapPin size={16} color="var(--text-secondary)" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span>
                  {defaultAddress.firstName} {defaultAddress.lastName}<br />
                  {defaultAddress.address}<br />
                  {defaultAddress.apartment && <>{defaultAddress.apartment}<br /></>}
                  {defaultAddress.city}, {defaultAddress.state} {defaultAddress.pinCode}<br />
                  {defaultAddress.country}
                </span>
              </div>
            </div>
          )}

          {!defaultAddress && (
            <div className="admin-details-section">
              <div className="admin-details-section-header">
                <h2>Default Address</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No addresses saved.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
