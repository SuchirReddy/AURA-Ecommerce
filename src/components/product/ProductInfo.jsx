import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Share2, Star } from 'lucide-react';
import './ProductInfo.css';

const ProductInfo = ({ product, onAddToCart }) => {
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(product.id, quantity, selectedSize, selectedColor);
    }
  };

  return (
    <div className="product-info-container">
      {/* Header */}
      <span className="product-category-label">{product.category}</span>
      <h1 className="product-title-large">{product.name}</h1>
      
      {/* Reviews Summary */}
      <div className="product-reviews-summary">
        <div className="stars">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} strokeWidth={i < Math.floor(product.rating) ? 0 : 2} />
          ))}
        </div>
        <span className="review-count">({product.reviewsCount} reviews)</span>
      </div>

      {/* Pricing */}
      <div className="product-price-section">
        {product.sale_price ? (
          <>
            <span className="current-price">₹{product.sale_price}</span>
            <span className="original-price">₹{product.price}</span>
          </>
        ) : (
          <span className="current-price">₹{product.price}</span>
        )}
      </div>

      <p className="short-description">{product.shortDescription}</p>

      {/* Selectors */}
      <div className="selectors-container">
        {/* Stock Alert */}
        {typeof selectedSize === 'object' && typeof selectedSize.stock === 'number' && (
          <div style={{ marginBottom: '16px', fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedSize.stock < 10 ? (
              <>
                <span className="blink-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                <span style={{ color: '#ef4444' }}>Only {selectedSize.stock} left in stock!</span>
              </>
            ) : (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                <span style={{ color: '#22c55e' }}>{selectedSize.stock} in stock</span>
              </>
            )}
          </div>
        )}

        {/* Colors */}
        <div className="selector-group">
          <div className="selector-header">
            <span className="selector-label">Color</span>
            <span className="selected-value">{selectedColor.name}</span>
          </div>
          <div className="color-swatches">
            {product.colors.map(color => (
              <button 
                key={color.name}
                className={`color-swatch ${selectedColor.name === color.name ? 'active' : ''}`}
                style={{ backgroundColor: color.hex }}
                onClick={() => setSelectedColor(color)}
                aria-label={color.name}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="selector-group">
          <div className="selector-header">
            <span className="selector-label">Size</span>
            <span className="selected-value">{selectedSize?.size || selectedSize}</span>
            <a href="#" className="size-guide-link">Size Guide</a>
          </div>
          <div className="size-pills">
            {product.sizes.map(sizeObj => {
              // Backward compatibility for old string sizes
              const sizeStr = typeof sizeObj === 'string' ? sizeObj : sizeObj.size;
              const isOutOfStock = typeof sizeObj === 'object' && sizeObj.stock <= 0;
              const isSelected = selectedSize === sizeObj || selectedSize?.size === sizeStr;

              return (
                <button 
                  key={sizeStr}
                  className={`size-pill ${isSelected ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                  onClick={() => !isOutOfStock && setSelectedSize(sizeObj)}
                  disabled={isOutOfStock}
                  title={isOutOfStock ? 'Out of Stock' : `${typeof sizeObj === 'object' ? sizeObj.stock + ' in stock' : 'In stock'}`}
                >
                  {sizeStr}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quantity */}
        <div className="selector-group">
          <div className="selector-header">
            <span className="selector-label">Quantity</span>
          </div>
          <div className="quantity-selector">
            <button className="qty-btn" onClick={decreaseQuantity}>-</button>
            <span className="qty-value">{quantity}</span>
            <button className="qty-btn" onClick={increaseQuantity}>+</button>
          </div>
        </div>
      </div>

      {/* Stock Status */}
      <div className="stock-status in-stock">
        <span className="status-dot"></span>
        In stock and ready to ship
      </div>

      {/* Actions */}
      <div className="product-actions">
        <button 
          onClick={handleAddToCartClick} 
          className="btn-primary add-to-cart-btn-large" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
        >
          Add to Cart
        </button>
        <button onClick={() => { handleAddToCartClick(); navigate('/checkout'); }} className="btn-secondary buy-now-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent' }}>Buy Now</button>
      </div>

      <div className="secondary-actions">
        <button className="sec-action-btn"><Share2 size={18} /> <span>Share</span></button>
      </div>
    </div>
  );
};

export default ProductInfo;
