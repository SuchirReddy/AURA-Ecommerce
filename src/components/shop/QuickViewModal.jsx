import React, { useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose, onAddToCart }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!product) return null;

  return (
    <div className="quick-view-overlay" onClick={onClose}>
      <div className="quick-view-modal" onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <div className="quick-view-image-container">
          <img
            src={product.featured_image || 'https://via.placeholder.com/600x800?text=No+Image'}
            alt={product.name}
            className="quick-view-image"
          />
        </div>

        <div className="quick-view-details">
          <span className="qv-category">{product.categories?.name || 'Uncategorized'}</span>
          <h2 className="qv-title">{product.name}</h2>

          <div className="qv-price-container">
            {product.sale_price ? (
              <>
                <span className="qv-price">₹{product.sale_price}</span>
                <span className="qv-original-price">₹{product.price}</span>
              </>
            ) : (
              <span className="qv-price">₹{product.price}</span>
            )}
          </div>

          <div className="qv-description">
            <p>{product.description || 'No description available for this product. It is a premium offering from the Aura collection.'}</p>
          </div>

          <div className="qv-actions">
            <button className="qv-add-to-cart" onClick={(e) => { if (onAddToCart) onAddToCart(e, product); }}>
              <ShoppingBag size={20} />
              Add to Cart
            </button>
            <Link to={`/product/${product.id}`} className="qv-view-details" onClick={onClose}>
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
