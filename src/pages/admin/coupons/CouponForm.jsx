import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createCoupon, getCouponById, updateCoupon } from '../../../services/couponService';
import Loader from '../../../components/Loader';
import toast from 'react-hot-toast';
import '../AdminForms.css';

const CouponForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    minimum_order: 0,
    expiry_date: '',
    usage_limit: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchCoupon();
    }
  }, [id]);

  const fetchCoupon = async () => {
    try {
      const data = await getCouponById(id);
      setForm({
        ...data,
        expiry_date: data.expiry_date ? new Date(data.expiry_date).toISOString().split('T')[0] : '',
        usage_limit: data.usage_limit === null ? '' : data.usage_limit
      });
    } catch (error) {
      toast.error('Failed to load coupon');
      navigate('/admin/coupons');
    } finally {
      setInitialLoad(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setForm(prev => ({ ...prev, code }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code) return toast.error('Coupon code is required');
    if (!form.discount_value && form.discount_type !== 'free_shipping') return toast.error('Discount value is required');

    setLoading(true);
    try {
      let parsedExpiry = null;
      if (form.expiry_date) {
        const d = new Date(form.expiry_date);
        // Set to end of the selected day (23:59:59) so it doesn't instantly expire if set to today
        d.setUTCHours(23, 59, 59, 999);
        parsedExpiry = d.toISOString();
      }

      const payload = {
        ...form,
        discount_value: form.discount_type === 'free_shipping' ? 0 : Number(form.discount_value),
        minimum_order: Number(form.minimum_order) || 0,
        usage_limit: form.usage_limit === '' ? null : Number(form.usage_limit),
        expiry_date: parsedExpiry
      };

      if (isEditing) {
        await updateCoupon(id, payload);
        toast.success('Coupon updated successfully');
      } else {
        await createCoupon(payload);
        toast.success('Coupon created successfully');
      }
      navigate('/admin/coupons');
    } catch (error) {
      toast.error(error.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return <Loader fullScreen />;

  return (
    <div className="admin-coupon-form fade-in">
      <div className="admin-form-header">
        <div className="admin-form-header-left">
          <Link to="/admin/coupons" className="back-btn"><ChevronLeft size={20} /></Link>
          <h1>{isEditing ? 'Edit Coupon' : 'Create Coupon'}</h1>
        </div>
        <div className="admin-form-actions">
          <Link to="/admin/coupons" className="btn-secondary" style={{ textDecoration: 'none' }}>Discard</Link>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Coupon'}
          </button>
        </div>
      </div>

      <div className="admin-form-layout">
        
        {/* Main Column */}
        <div className="admin-form-main">
          
          <div className="admin-form-section">
            <div className="admin-details-section-header">
              <h2>Coupon Code</h2>
              <button className="section-action-btn" onClick={generateCode}>Generate random code</button>
            </div>
            <div className="form-group">
              <input 
                type="text" 
                name="code"
                value={form.code}
                onChange={handleChange}
                className="form-input" 
                placeholder="e.g. SUMMER25" 
                style={{ textTransform: 'uppercase', fontSize: '1.2rem', letterSpacing: '1px' }} 
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Customers will enter this code at checkout.</p>
            </div>
          </div>

          <div className="admin-form-section">
            <h2>Value</h2>
            <div className="form-group">
              <label className="form-label">Discount Type</label>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button 
                  className={`btn-${form.discount_type === 'percentage' ? 'primary' : 'secondary'}`}
                  onClick={() => setForm(prev => ({...prev, discount_type: 'percentage'}))}
                  style={{ flex: 1 }}
                >
                  Percentage
                </button>
                <button 
                  className={`btn-${form.discount_type === 'fixed' ? 'primary' : 'secondary'}`}
                  onClick={() => setForm(prev => ({...prev, discount_type: 'fixed'}))}
                  style={{ flex: 1 }}
                >
                  Fixed Amount
                </button>
                <button 
                  className={`btn-${form.discount_type === 'free_shipping' ? 'primary' : 'secondary'}`}
                  onClick={() => setForm(prev => ({...prev, discount_type: 'free_shipping'}))}
                  style={{ flex: 1 }}
                >
                  Free Shipping
                </button>
              </div>
            </div>

            {form.discount_type === 'percentage' && (
              <div className="form-group">
                <label className="form-label">Discount Value (%)</label>
                <input type="number" name="discount_value" value={form.discount_value} onChange={handleChange} className="form-input" placeholder="e.g. 25" />
              </div>
            )}
            {form.discount_type === 'fixed' && (
              <div className="form-group">
                <label className="form-label">Discount Amount (₹)</label>
                <input type="number" name="discount_value" value={form.discount_value} onChange={handleChange} className="form-input" placeholder="e.g. 500" />
              </div>
            )}
          </div>

          <div className="admin-form-section">
            <h2>Minimum Requirements</h2>
            <div className="form-group">
              <label className="form-label">Minimum purchase amount (₹)</label>
              <input type="number" name="minimum_order" value={form.minimum_order} onChange={handleChange} className="form-input" placeholder="0 for no minimum" />
            </div>
          </div>
          
        </div>

        {/* Sidebar Column */}
        <div className="admin-form-sidebar">
          
          <div className="admin-form-section">
            <h2>Status</h2>
            <div className="form-group">
              <label className="checkbox-label" style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="checkbox" name="active" checked={form.active} onChange={handleChange} /> 
                Active (can be used by customers)
              </label>
            </div>
          </div>

          <div className="admin-form-section">
            <h2>Active Dates</h2>
            <div className="form-group">
              <label className="form-label">Expiry Date (Optional)</label>
              <DatePicker 
                selected={form.expiry_date ? new Date(form.expiry_date) : null} 
                onChange={(date) => setForm(prev => ({ ...prev, expiry_date: date ? date.toISOString().split('T')[0] : '' }))} 
                className="form-input" 
                placeholderText="Select expiry date"
                dateFormat="yyyy-MM-dd"
                isClearable
                wrapperClassName="date-picker-wrapper"
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Leave blank to never expire.</p>
            </div>
          </div>

          <div className="admin-form-section">
            <h2>Usage Limits</h2>
            <div className="form-group">
              <label className="form-label">Total Usage Limit</label>
              <input type="number" name="usage_limit" value={form.usage_limit} onChange={handleChange} className="form-input" placeholder="Leave blank for unlimited" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CouponForm;
