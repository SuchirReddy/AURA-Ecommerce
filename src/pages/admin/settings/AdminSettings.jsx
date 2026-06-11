import React, { useState, useEffect } from 'react';
import { 
  Store, CreditCard, Truck, Receipt, Bell, Users, Plus, Shield, 
  Save, Loader, Trash2, Pencil, X, Check, Globe, Mail, Phone,
  Percent, MapPin, Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getSiteSettings, updateSiteSettings } from '../../../services/contentService';
import { getCustomers } from '../../../services/userService';
import '../AdminTables.css';
import '../AdminForms.css';
import './AdminSettings.css';

// ============================================================
// TOGGLE COMPONENT
// ============================================================
const Toggle = ({ checked, onChange, label }) => (
  <label className="settings-toggle-row">
    <span>{label}</span>
    <div className="settings-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="settings-toggle-slider"></span>
    </div>
  </label>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);

  // All settings stored as flat key-value pairs (synced to site_settings table)
  const [settings, setSettings] = useState({
    // Store
    store_name: 'AURA E-commerce',
    store_email: 'contact@aurastore.com',
    store_phone: '+91 80000 00000',
    store_address: '',
    store_city: '',
    store_state: '',
    store_zip: '',
    store_country: 'India',
    store_currency: 'INR',
    store_currency_symbol: '₹',
    store_timezone: 'Asia/Kolkata',

    // Payments
    payment_cod_enabled: 'true',
    payment_razorpay_enabled: 'false',
    payment_razorpay_key: '',
    payment_razorpay_secret: '',
    payment_stripe_enabled: 'false',
    payment_stripe_key: '',
    payment_stripe_secret: '',

    // Shipping  
    shipping_free_threshold: '5000',
    shipping_default_rate: '99',
    shipping_express_rate: '199',
    shipping_handling_days: '1',
    shipping_origin_pincode: '',

    // Taxes
    tax_enabled: 'true',
    tax_gst_rate: '18',
    tax_inclusive: 'false',
    tax_gstin: '',
    tax_business_name: '',

    // Notifications
    notif_order_confirmation: 'true',
    notif_shipping_updates: 'true',
    notif_delivery_confirmation: 'true',
    notif_return_updates: 'true',
    notif_promotional_emails: 'false',
    notif_low_stock_alert: 'true',
    notif_new_order_alert: 'true',
    notif_admin_email: '',
  });

  const tabs = [
    { id: 'store', name: 'Store Details', icon: <Store size={18} /> },
    { id: 'payments', name: 'Payments', icon: <CreditCard size={18} /> },
    { id: 'shipping', name: 'Shipping', icon: <Truck size={18} /> },
    { id: 'taxes', name: 'Taxes', icon: <Receipt size={18} /> },
    { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
    { id: 'roles', name: 'Admin Users & Roles', icon: <Users size={18} /> },
  ];

  // Load settings and admin users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [siteData, usersData] = await Promise.all([
          getSiteSettings(),
          getCustomers()
        ]);
        setSettings(prev => ({ ...prev, ...siteData }));
        setAdminUsers((usersData || []).filter(u => u.role === 'admin'));
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      toast.success('Settings saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading settings...</div>;
  }

  return (
    <div className="admin-settings-page fade-in">
      <div className="admin-list-header">
        <h1>Settings</h1>
        <button className="btn-primary settings-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? <Loader size={16} className="spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="settings-layout">
        
        {/* Settings Sidebar */}
        <div className="settings-sidebar">
          <nav className="settings-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="settings-content">
          
          {/* ============ STORE DETAILS ============ */}
          {activeTab === 'store' && (
            <div className="settings-view fade-in">
              <div className="settings-header">
                <h2>Store Details</h2>
                <p>Manage your store's name, contact info, and localization.</p>
              </div>

              <div className="admin-form-section">
                <h2>Basic Information</h2>
                <div className="form-group">
                  <label className="form-label">Store Name</label>
                  <input 
                    type="text" className="form-input" 
                    value={settings.store_name}
                    onChange={e => handleChange('store_name', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input 
                      type="email" className="form-input" 
                      value={settings.store_email}
                      onChange={e => handleChange('store_email', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Support Phone</label>
                    <input 
                      type="tel" className="form-input" 
                      value={settings.store_phone}
                      onChange={e => handleChange('store_phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-section" style={{ marginTop: 'var(--spacing-xl)' }}>
                <h2>Store Address</h2>
                <div className="form-group">
                  <label className="form-label">Street Address</label>
                  <input 
                    type="text" className="form-input"
                    placeholder="123 Main Street"
                    value={settings.store_address}
                    onChange={e => handleChange('store_address', e.target.value)}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input 
                      type="text" className="form-input" 
                      placeholder="Mumbai"
                      value={settings.store_city}
                      onChange={e => handleChange('store_city', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input 
                      type="text" className="form-input" 
                      placeholder="Maharashtra"
                      value={settings.store_state}
                      onChange={e => handleChange('store_state', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">ZIP / Postal Code</label>
                    <input 
                      type="text" className="form-input" 
                      placeholder="400001"
                      value={settings.store_zip}
                      onChange={e => handleChange('store_zip', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input 
                      type="text" className="form-input"
                      value={settings.store_country}
                      onChange={e => handleChange('store_country', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-section" style={{ marginTop: 'var(--spacing-xl)' }}>
                <h2>Localization</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select 
                      className="form-select"
                      value={settings.store_currency}
                      onChange={e => {
                        const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
                        handleChange('store_currency', e.target.value);
                        handleChange('store_currency_symbol', symbols[e.target.value] || e.target.value);
                      }}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select 
                      className="form-select"
                      value={settings.store_timezone}
                      onChange={e => handleChange('store_timezone', e.target.value)}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="America/New_York">America/New York (EST)</option>
                      <option value="America/Los_Angeles">America/Los Angeles (PST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ PAYMENTS ============ */}
          {activeTab === 'payments' && (
            <div className="settings-view fade-in">
              <div className="settings-header">
                <h2>Payment Settings</h2>
                <p>Configure payment gateways and methods accepted by your store.</p>
              </div>

              {/* Cash on Delivery */}
              <div className="admin-form-section settings-payment-card">
                <div className="settings-card-top">
                  <div className="settings-card-info">
                    <div className="settings-card-icon cod">₹</div>
                    <div>
                      <h3>Cash on Delivery</h3>
                      <p>Accept cash payment at the time of delivery</p>
                    </div>
                  </div>
                  <Toggle 
                    checked={settings.payment_cod_enabled === 'true'}
                    onChange={val => handleChange('payment_cod_enabled', val ? 'true' : 'false')}
                  />
                </div>
              </div>

              {/* Razorpay */}
              <div className="admin-form-section settings-payment-card" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="settings-card-top">
                  <div className="settings-card-info">
                    <div className="settings-card-icon razorpay">R</div>
                    <div>
                      <h3>Razorpay</h3>
                      <p>Accept UPI, cards, wallets and netbanking</p>
                    </div>
                  </div>
                  <Toggle 
                    checked={settings.payment_razorpay_enabled === 'true'}
                    onChange={val => handleChange('payment_razorpay_enabled', val ? 'true' : 'false')}
                  />
                </div>
                {settings.payment_razorpay_enabled === 'true' && (
                  <div className="settings-card-fields">
                    <div className="form-group">
                      <label className="form-label">Razorpay Key ID</label>
                      <input 
                        type="text" className="form-input" 
                        placeholder="rzp_live_..."
                        value={settings.payment_razorpay_key}
                        onChange={e => handleChange('payment_razorpay_key', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Razorpay Key Secret</label>
                      <input 
                        type="password" className="form-input" 
                        placeholder="••••••••••"
                        value={settings.payment_razorpay_secret}
                        onChange={e => handleChange('payment_razorpay_secret', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Stripe */}
              <div className="admin-form-section settings-payment-card" style={{ marginTop: 'var(--spacing-lg)' }}>
                <div className="settings-card-top">
                  <div className="settings-card-info">
                    <div className="settings-card-icon stripe">S</div>
                    <div>
                      <h3>Stripe</h3>
                      <p>Accept international cards, Apple Pay, Google Pay</p>
                    </div>
                  </div>
                  <Toggle 
                    checked={settings.payment_stripe_enabled === 'true'}
                    onChange={val => handleChange('payment_stripe_enabled', val ? 'true' : 'false')}
                  />
                </div>
                {settings.payment_stripe_enabled === 'true' && (
                  <div className="settings-card-fields">
                    <div className="form-group">
                      <label className="form-label">Stripe Publishable Key</label>
                      <input 
                        type="text" className="form-input" 
                        placeholder="pk_live_..."
                        value={settings.payment_stripe_key}
                        onChange={e => handleChange('payment_stripe_key', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Stripe Secret Key</label>
                      <input 
                        type="password" className="form-input" 
                        placeholder="sk_live_..."
                        value={settings.payment_stripe_secret}
                        onChange={e => handleChange('payment_stripe_secret', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ SHIPPING ============ */}
          {activeTab === 'shipping' && (
            <div className="settings-view fade-in">
              <div className="settings-header">
                <h2>Shipping Settings</h2>
                <p>Configure default shipping rates and thresholds. For zone-specific rates, visit <a href="/admin/shipping" className="settings-link">Shipping & Returns</a>.</p>
              </div>

              <div className="admin-form-section">
                <h2>Free Shipping</h2>
                <div className="form-group">
                  <label className="form-label">Free Shipping Threshold ({settings.store_currency_symbol})</label>
                  <input 
                    type="number" className="form-input" min="0"
                    placeholder="5000"
                    value={settings.shipping_free_threshold}
                    onChange={e => handleChange('shipping_free_threshold', e.target.value)}
                  />
                  <span className="form-hint">Orders above this amount get free shipping. Set to 0 for always free.</span>
                </div>
              </div>

              <div className="admin-form-section" style={{ marginTop: 'var(--spacing-xl)' }}>
                <h2>Default Rates</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Standard Shipping ({settings.store_currency_symbol})</label>
                    <input 
                      type="number" className="form-input" min="0"
                      value={settings.shipping_default_rate}
                      onChange={e => handleChange('shipping_default_rate', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Express Shipping ({settings.store_currency_symbol})</label>
                    <input 
                      type="number" className="form-input" min="0"
                      value={settings.shipping_express_rate}
                      onChange={e => handleChange('shipping_express_rate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-section" style={{ marginTop: 'var(--spacing-xl)' }}>
                <h2>Fulfillment</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Handling Time (days)</label>
                    <input 
                      type="number" className="form-input" min="0"
                      value={settings.shipping_handling_days}
                      onChange={e => handleChange('shipping_handling_days', e.target.value)}
                    />
                    <span className="form-hint">Days to process before shipping</span>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Origin PIN Code</label>
                    <input 
                      type="text" className="form-input"
                      placeholder="400001"
                      value={settings.shipping_origin_pincode}
                      onChange={e => handleChange('shipping_origin_pincode', e.target.value)}
                    />
                    <span className="form-hint">Warehouse / dispatch PIN code</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ TAXES ============ */}
          {activeTab === 'taxes' && (
            <div className="settings-view fade-in">
              <div className="settings-header">
                <h2>Tax Settings</h2>
                <p>Configure tax calculation for your orders.</p>
              </div>

              <div className="admin-form-section">
                <div className="settings-card-top" style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <h2 style={{ margin: 0 }}>Tax Collection</h2>
                  <Toggle 
                    checked={settings.tax_enabled === 'true'}
                    onChange={val => handleChange('tax_enabled', val ? 'true' : 'false')}
                    label="Enable Tax"
                  />
                </div>

                {settings.tax_enabled === 'true' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">GST Rate (%)</label>
                        <input 
                          type="number" className="form-input" min="0" max="100" step="0.5"
                          value={settings.tax_gst_rate}
                          onChange={e => handleChange('tax_gst_rate', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tax Calculation</label>
                        <select 
                          className="form-select"
                          value={settings.tax_inclusive}
                          onChange={e => handleChange('tax_inclusive', e.target.value)}
                        >
                          <option value="false">Prices are exclusive of tax</option>
                          <option value="true">Prices are inclusive of tax</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {settings.tax_enabled === 'true' && (
                <div className="admin-form-section" style={{ marginTop: 'var(--spacing-xl)' }}>
                  <h2>Business Tax Details</h2>
                  <div className="form-group">
                    <label className="form-label">GSTIN</label>
                    <input 
                      type="text" className="form-input"
                      placeholder="22AAAAA0000A1Z5"
                      value={settings.tax_gstin}
                      onChange={e => handleChange('tax_gstin', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registered Business Name</label>
                    <input 
                      type="text" className="form-input"
                      placeholder="AURA Fashions Pvt. Ltd."
                      value={settings.tax_business_name}
                      onChange={e => handleChange('tax_business_name', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ NOTIFICATIONS ============ */}
          {activeTab === 'notifications' && (
            <div className="settings-view fade-in">
              <div className="settings-header">
                <h2>Notification Settings</h2>
                <p>Control which email notifications are sent to customers and admins.</p>
              </div>

              <div className="admin-form-section">
                <h2>Customer Notifications</h2>
                <p className="settings-section-desc">Emails sent to customers about their orders</p>
                <div className="settings-notif-list">
                  <Toggle 
                    checked={settings.notif_order_confirmation === 'true'}
                    onChange={val => handleChange('notif_order_confirmation', val ? 'true' : 'false')}
                    label="Order Confirmation"
                  />
                  <Toggle 
                    checked={settings.notif_shipping_updates === 'true'}
                    onChange={val => handleChange('notif_shipping_updates', val ? 'true' : 'false')}
                    label="Shipping Updates"
                  />
                  <Toggle 
                    checked={settings.notif_delivery_confirmation === 'true'}
                    onChange={val => handleChange('notif_delivery_confirmation', val ? 'true' : 'false')}
                    label="Delivery Confirmation"
                  />
                  <Toggle 
                    checked={settings.notif_return_updates === 'true'}
                    onChange={val => handleChange('notif_return_updates', val ? 'true' : 'false')}
                    label="Return & Refund Updates"
                  />
                  <Toggle 
                    checked={settings.notif_promotional_emails === 'true'}
                    onChange={val => handleChange('notif_promotional_emails', val ? 'true' : 'false')}
                    label="Promotional Emails & Offers"
                  />
                </div>
              </div>

              <div className="admin-form-section" style={{ marginTop: 'var(--spacing-xl)' }}>
                <h2>Admin Notifications</h2>
                <p className="settings-section-desc">Alerts sent to the store admin team</p>
                <div className="settings-notif-list">
                  <Toggle 
                    checked={settings.notif_new_order_alert === 'true'}
                    onChange={val => handleChange('notif_new_order_alert', val ? 'true' : 'false')}
                    label="New Order Alert"
                  />
                  <Toggle 
                    checked={settings.notif_low_stock_alert === 'true'}
                    onChange={val => handleChange('notif_low_stock_alert', val ? 'true' : 'false')}
                    label="Low Stock Alert"
                  />
                </div>
                <div className="form-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                  <label className="form-label">Admin Notification Email</label>
                  <input 
                    type="email" className="form-input"
                    placeholder="admin@aurastore.com"
                    value={settings.notif_admin_email}
                    onChange={e => handleChange('notif_admin_email', e.target.value)}
                  />
                  <span className="form-hint">All admin alerts will be sent to this email</span>
                </div>
              </div>
            </div>
          )}

          {/* ============ ADMIN USERS & ROLES ============ */}
          {activeTab === 'roles' && (
            <div className="settings-view fade-in">
              <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2>Admin Users & Roles</h2>
                  <p>Users with admin access to the dashboard. Admins are set via the VITE_ADMIN_CLERK_ID environment variable.</p>
                </div>
              </div>

              <div className="admin-data-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                          No admin users found. Set VITE_ADMIN_CLERK_ID in your .env to promote a user.
                        </td>
                      </tr>
                    ) : (
                      adminUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="settings-user-cell">
                              <div className="settings-user-avatar">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt={user.full_name} />
                                ) : (
                                  <span>{(user.full_name || user.email || '?').slice(0, 2).toUpperCase()}</span>
                                )}
                              </div>
                              <span style={{ fontWeight: '500' }}>{user.full_name || 'Unnamed User'}</span>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                          <td>
                            <span className="admin-badge completed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Shield size={12}/> Admin
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="settings-roles-info">
                <div className="settings-info-card">
                  <Shield size={20} />
                  <div>
                    <h4>How Admin Access Works</h4>
                    <p>Admin access is controlled via the <code>VITE_ADMIN_CLERK_ID</code> environment variable. When a user logs in with the matching Clerk user ID, they are automatically promoted to admin role and gain access to this dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
