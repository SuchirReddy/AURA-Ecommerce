import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye, PackageX } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import './ShopGrid.css';

const ShopGrid = ({ products = [], loading = false }) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  if (loading) {
    return (
      <div className="shop-grid-loading">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="shop-product-skeleton">
            <div className="skeleton-image shimmer" />
            <div className="skeleton-info">
              <div className="skeleton-line short shimmer" />
              <div className="skeleton-line shimmer" />
              <div className="skeleton-line medium shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="shop-empty-state">
        <PackageX size={56} strokeWidth={1.2} />
        <h3>No products found</h3>
        <p>Try adjusting your filters or search criteria</p>
      </div>
    );
  }

  const openQuickView = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewProduct(product);
  };

  return (
    <>
      <div className="shop-product-grid">
        {products.map((product) => (
          <Link to={`/product/${product.id}`} key={product.id} className="shop-product-card">
            <div className="shop-product-image-container">
              {/* Badges */}
              {product.sale_price && (
                <span className="shop-product-badge sale">Sale</span>
              )}
              
              {/* Wishlist Button - Top Right */}
              <button className="shop-action-btn wishlist-btn" aria-label="Add to Wishlist" onClick={(e) => e.preventDefault()}>
                <Heart size={18} />
              </button>

              {/* Images */}
              <img src={product.featured_image || 'https://via.placeholder.com/600x800?text=No+Image'} alt={product.name} className="shop-product-image primary" />
              <img src={product.gallery_images?.[0] || product.featured_image || 'https://via.placeholder.com/600x800?text=No+Image'} alt={`${product.name} alternate`} className="shop-product-image secondary" />
              
              {/* Quick Actions - Bottom */}
              <div className="shop-quick-actions">
                <button className="quick-action-btn" onClick={(e) => openQuickView(e, product)}>
                  <Eye size={18} />
                </button>
                <button className="quick-action-btn primary-action" onClick={(e) => e.preventDefault()}>
                  <ShoppingBag size={18} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
            
            <div className="shop-product-info">
              <span className="shop-product-category">{product.categories?.name || 'Uncategorized'}</span>
              <h3 className="shop-product-name">{product.name}</h3>
              <div className="shop-product-pricing">
                {product.sale_price ? (
                  <>
                    <span className="shop-product-price">₹{product.sale_price}</span>
                    <span className="shop-product-original-price">₹{product.price}</span>
                  </>
                ) : (
                  <span className="shop-product-price">₹{product.price}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </>
  );
};

export default ShopGrid;
