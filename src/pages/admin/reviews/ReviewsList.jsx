import React, { useState, useEffect } from 'react';
import { Search, Star, CheckCircle, XCircle } from 'lucide-react';
import { getReviews, updateReviewStatus } from '../../../services/userService';
import '../AdminTables.css';

const ReviewsList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewsData();
  }, []);

  const fetchReviewsData = async () => {
    try {
      const data = await getReviews();
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateReviewStatus(id, status);
      fetchReviewsData();
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  return (
    <div className="admin-reviews-list fade-in">
      <div className="admin-list-header">
        <h1>Reviews Moderation</h1>
      </div>

      <div className="admin-filters-bar">
        <div className="admin-search-input-wrapper">
          <Search size={18} className="admin-search-icon" />
          <input type="text" placeholder="Search review content or customers..." />
        </div>
        <select className="admin-filter-select">
          <option>Status</option>
          <option>Pending</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <select className="admin-filter-select">
          <option>Rating</option>
          <option>5 Stars</option>
          <option>4 Stars & Up</option>
          <option>3 Stars & Under</option>
        </select>
      </div>

      <div className="admin-data-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}><input type="checkbox" className="table-checkbox" /></th>
              <th style={{ width: '35%' }}>Review</th>
              <th>Rating</th>
              <th>Product</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading reviews...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No reviews found.</td></tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td style={{ verticalAlign: 'top' }}><input type="checkbox" className="table-checkbox" style={{ marginTop: '4px' }}/></td>
                  <td style={{ verticalAlign: 'top' }}>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Review</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.5' }}>
                      {review.content || 'No content provided.'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>By: {review.profiles?.full_name || 'Unknown User'}</div>
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', color: 'var(--text-primary)' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} color={i < review.rating ? "currentColor" : "var(--border)"} />
                      ))}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <span className="table-product-name" style={{ fontSize: '0.9rem' }}>{review.products?.name || 'Unknown Product'}</span>
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <span className={`admin-badge ${review.status === 'approved' ? 'completed' : review.status === 'rejected' ? 'cancelled' : 'pending'}`}>
                      {review.status}
                    </span>
                  </td>
                  <td style={{ verticalAlign: 'top' }}>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      {review.status !== 'approved' && (
                        <button className="table-action-btn" title="Approve" style={{ color: '#34c759' }} onClick={() => handleUpdateStatus(review.id, 'approved')}><CheckCircle size={18} /></button>
                      )}
                      {review.status !== 'rejected' && (
                        <button className="table-action-btn delete" title={review.status === 'approved' ? "Remove" : "Reject"} onClick={() => handleUpdateStatus(review.id, 'rejected')}><XCircle size={18} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewsList;
