import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye, PackageX } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { addToCart } from '../../services/cartService';
import { syncUserProfile } from '../../services/userService';
import Loader from '../Loader';
import './ShopGrid.css';

const ShopGrid = ({ products = [], loading = false }) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      let uid = null;
      if (user) {
        const profile = await syncUserProfile(user);
        if (profile) uid = profile.id;
      }

      const sizeStr = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : null;
      let size = sizeStr;
      if (typeof sizeStr === 'string' && sizeStr.startsWith('{')) {
        try { size = JSON.parse(sizeStr); } catch (err) { }
      }

      const colorStr = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : null;
      let color = colorStr;
      if (typeof colorStr === 'string' && colorStr.startsWith('{')) {
        try { color = JSON.parse(colorStr); } catch (err) { }
      } else if (typeof colorStr === 'string') {
        color = { name: colorStr, hex: '#000000' };
      }

      await addToCart(uid, product.id, 1, size, color);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', width: '100%' }}>
        <Loader />
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
                <button className="quick-action-btn primary-action" onClick={(e) => handleAddToCart(e, product)}>
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
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
};

export default ShopGrid;
