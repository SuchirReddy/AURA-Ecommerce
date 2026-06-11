import React, { useState, useEffect } from 'react';
import { getSiteSettings } from '../../services/contentService';
import './ProductTabs.css';

const ProductTabs = ({ product, reviews = [] }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: `Reviews (${product.reviewsCount || 0})` },
    { id: 'shipping', label: 'Shipping & Returns' }
  ];

  return (
    <div className="product-tabs-container">
      <div className="tabs-header">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="tab-content">
        {activeTab === 'description' && (
          <div className="tab-pane fade-in">
            {product.description ? (
              <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
            ) : (
              <p>No description provided for this product.</p>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="tab-pane fade-in">
            <ul className="specs-list">
              <li><strong>SKU:</strong> {product.sku || 'N/A'}</li>
              <li><strong>Category:</strong> {product.category || 'N/A'}</li>
              <li><strong>Material:</strong> Premium Quality Materials</li>
              <li><strong>Care Instructions:</strong> Check label before washing</li>
              {/* Additional specs could be pulled from a JSONB column in the future */}
            </ul>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="tab-pane fade-in">
            <div className="reviews-summary">
              <div className="overall-rating">
                <h2>{product.rating}</h2>
                <div className="stars" style={{ color: "var(--text-primary)" }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < Math.floor(product.rating) ? 'var(--text-primary)' : 'var(--border)' }}>★</span>
                  ))}
                </div>
                <p>Based on {product.reviewsCount || 0} reviews</p>
              </div>
              <button className="btn-secondary write-review-btn">Write a Review</button>
            </div>
            
            {reviews.length === 0 ? (
              <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < review.rating ? 'var(--accent)' : 'var(--border)' }}>★</span>
                      ))}
                    </div>
                    <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="review-body">{review.review_text}</p>
                  <div className="review-author">
                    <span className="author-name">{review.profiles?.full_name || 'Anonymous User'}</span>
                    <span className="verified-badge">✔ Verified Buyer</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="tab-pane fade-in">
            {Number(settings?.shipping_free_threshold) > 0 && (
              <h4>Free Standard Shipping on orders over ₹{Number(settings?.shipping_free_threshold).toLocaleString()}.</h4>
            )}
            <ul className="shipping-list">
              <li><strong>Standard Shipping:</strong> 3-5 business days ({Number(settings?.shipping_standard_rate) === 0 ? 'Free' : `₹${Number(settings?.shipping_standard_rate) || 150}`})</li>
              <li><strong>Express Shipping:</strong> 1-2 business days (₹{Number(settings?.shipping_express_rate) || 400})</li>
            </ul>
            <br/>
            <h4>Returns</h4>
            <p style={{ whiteSpace: 'pre-line' }}>
              {settings?.returns_policy_text || 'We accept returns within 30 days of purchase. Items must be unworn, unwashed, and with all original tags attached. Return shipping is free for all domestic orders.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
