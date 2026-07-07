import React from 'react';
import { ShoppingBag } from 'lucide-react';
import './SocialWall.css';

const socialImages = [
  { id: 1, src: '/assets/cat_lifestyle.png', alt: 'Lifestyle Look 1' },
  { id: 2, src: '/assets/premium_lookbook.png', alt: 'Lifestyle Look 2' },
  { id: 4, src: '/assets/middle_banner_image.png', alt: 'Middle Banner Look' },
  { id: 5, src: '/assets/cat_womens.png', alt: 'Womens Collection' },
];

const SocialWall = () => {
  return (
    <section className="social-wall-section">
      <div className="social-wall-container">
        <div className="social-wall-header">
          <h2 className="social-wall-title">Spotted in AURA</h2>
          <p className="social-wall-subtitle">Tag @auracollection to be featured on our community wall.</p>
        </div>
        
        <div className="social-grid">
          {socialImages.map((image) => (
            <div key={image.id} className="social-item">
              <img src={image.src} alt={image.alt} />
              <div className="social-overlay">
                <ShoppingBag size={32} className="social-icon" />
                <span className="social-text">Shop this look</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialWall;
