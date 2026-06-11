import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import './ProductGallery.css';

const ProductGallery = ({ images, isWishlisted, onWishlistToggle }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="product-gallery">
      {/* Main Image with Zoom on Hover effect */}
      <div className="main-image-container">
        <img 
          src={images[activeImageIndex]} 
          alt="Product feature" 
          className="main-image"
        />
        
        {/* Wishlist Button */}
        <button 
          className={`gallery-wishlist-btn ${isWishlisted ? 'active' : ''}`} 
          aria-label="Add to Wishlist"
          onClick={onWishlistToggle}
        >
          <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} />
        </button>
        
        {/* Navigation Arrows */}
        <button className="gallery-arrow left" onClick={handlePrev} aria-label="Previous image">
          <ChevronLeft size={24} />
        </button>
        <button className="gallery-arrow right" onClick={handleNext} aria-label="Next image">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="thumbnail-list">
        {images.map((img, index) => (
          <button 
            key={index} 
            className={`thumbnail-btn ${index === activeImageIndex ? 'active' : ''}`}
            onClick={() => setActiveImageIndex(index)}
          >
            <img src={img} alt={`Thumbnail ${index + 1}`} className="thumbnail-image" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
