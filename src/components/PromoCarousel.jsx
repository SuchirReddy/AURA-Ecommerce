import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSiteSettings } from '../services/contentService';
import './PromoCarousel.css';

const PromoCarousel = ({ settingsKey = 'homepage_promo_banners', autoPlayInterval = 5000 }) => {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const settings = await getSiteSettings();
        if (settings[settingsKey]) {
          setBanners(JSON.parse(settings[settingsKey]));
        } else {
          setBanners([
            { id: '1', title: 'Summer Collection 2026', subtitle: 'Discover our newest premium apparel designed for the modern minimalist. Enjoy up to 20% off selected summer styles.', linkText: 'Shop Summer', linkUrl: '/shop?category=summer', image: '/assets/banner_summer.png', reverseLayout: false },
            { id: '2', title: 'Elevated Essentials', subtitle: 'Complete your look with our curated selection of luxury watches and designer sunglasses.', linkText: 'Explore Accessories', linkUrl: '/shop?category=accessories', image: '/assets/banner_accessories.png', reverseLayout: true }
          ]);
        }
      } catch (err) {
        console.error('Failed to load promo banners', err);
      }
    };
    fetchBanners();
  }, [settingsKey]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const intervalId = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(intervalId);
  }, [nextSlide, autoPlayInterval, banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className="promo-carousel-wrapper">
      <div className="promo-carousel">
        <div 
          className="promo-carousel-track" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className={`promo-carousel-slide ${banner.reverseLayout ? 'reverse' : ''}`}>
              <div className="promo-slide-container">
                <div className="promo-slide-content">
                  <h2>{banner.title}</h2>
                  <p>{banner.subtitle}</p>
                  {banner.linkText && banner.linkUrl && (
                    <Link to={banner.linkUrl} className="btn-secondary promo-btn">{banner.linkText}</Link>
                  )}
                </div>
                <div className="promo-slide-image">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.title} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <>
            <button className="carousel-nav prev" onClick={prevSlide}>
              <ChevronLeft size={24} />
            </button>
            <button className="carousel-nav next" onClick={nextSlide}>
              <ChevronRight size={24} />
            </button>
            <div className="carousel-indicators">
              {banners.map((_, idx) => (
                <button 
                  key={idx} 
                  className={`carousel-dot ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PromoCarousel;
