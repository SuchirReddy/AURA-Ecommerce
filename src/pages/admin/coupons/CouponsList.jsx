import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { getCoupons, deleteCoupon, updateCoupon } from '../../../services/couponService';
import toast from 'react-hot-toast';
import '../AdminTables.css';

const CouponsList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const data = await getCoupons();
      setCoupons(data || []);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
        setCoupons(prev => prev.filter(c => c.id !== id));
        toast.success('Coupon deleted');
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await updateCoupon(id, { active: !currentStatus });
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !currentStatus } : c));
      toast.success(currentStatus ? 'Coupon deactivated' : 'Coupon activated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px' }}>Loading coupons...</div>;
  }

  return (
    <div className="admin-coupons-list fade-in">
      <div className="admin-list-header">
        <h1>Coupons & Discounts</h1>
        <Link to="/admin/coupons/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
          <Plus size={18} /> Create Coupon
        </Link>
      </div>

      <div className="admin-data-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
              <th>Discount Rule</th>
              <th>Usage Remaining</th>
              <th>Expiry</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No coupons found. Create one above!</td></tr>
            ) : (
              coupons.map(coupon => {
                const isExpired = coupon.expiry_date && new Date(coupon.expiry_date) < new Date();
                let statusText = coupon.active ? 'Active' : 'Inactive';
                let statusClass = coupon.active ? 'status-active' : 'status-inactive';
                if (isExpired) {
                  statusText = 'Expired';
                  statusClass = 'status-inactive';
                }

                return (
                  <tr key={coupon.id} style={{ opacity: isExpired ? 0.6 : 1 }}>
                    <td><strong>{coupon.code}</strong></td>
                    <td>
                      <span className={`admin-status-badge ${statusClass}`} style={{ cursor: 'pointer' }} onClick={() => toggleActive(coupon.id, coupon.active)}>
                        {statusText}
                      </span>
                    </td>
                    <td>
                      {coupon.discount_type === 'percentage' && `${coupon.discount_value}% off`}
                      {coupon.discount_type === 'fixed' && `₹${coupon.discount_value} off`}
                      {coupon.discount_type === 'free_shipping' && 'Free Shipping'}
                      {coupon.minimum_order > 0 && <div style={{ fontSize: '0.8rem', color: '#666' }}>Min: ₹{coupon.minimum_order}</div>}
                    </td>
                    <td>{coupon.usage_limit !== null ? coupon.usage_limit : 'Unlimited'}</td>
                    <td>{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'Never'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/coupons/edit/${coupon.id}`} className="icon-btn-edit" style={{ marginRight: '8px' }}>
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(coupon.id)} className="icon-btn-delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponsList;
