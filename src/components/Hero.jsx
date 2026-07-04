import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings } from '../services/contentService';
import './Hero.css';

const Hero = () => {
  const [content, setContent] = useState({
    announcement_text: 'New season pieces, now live. Limited quantities available.',
    announcement_enabled: 'true'
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getSiteSettings();
        if (data && data.announcement_enabled) {
          setContent(prev => ({ ...prev, ...data }));
        }
      } catch (err) { }
    };
    fetchContent();
  }, []);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Announcement Bar */}
      {content.announcement_enabled === 'true' && content.announcement_text && (
        <div className="announcement-bar">
          <div className="announcement-track">
            <span>{content.announcement_text}</span>
            <span>{content.announcement_text}</span>
            <span>{content.announcement_text}</span>
            <span>{content.announcement_text}</span>
          </div>
        </div>
      )}

      <section className="hero-split">
        <div className="hero-side hero-left">
          <img src="/hero-left.png" alt="Men's New Season" className="hero-img" />
        </div>
        <div className="hero-side hero-right">
          <img src="/hero-right.png" alt="Men's Essentials" className="hero-img" />
        </div>

        <div className="hero-center-content">
          <h1 className="hero-logo-text">aura<span className="hero-dot">.</span></h1>
        </div>

        <div className="hero-bottom-center">
          <Link to="/shop" className="btn-shop-now">Shop Now</Link>
          <div className="hero-scroll-indicator" onClick={scrollToNext}>
            <span>Scroll down to see more</span>
            <ChevronDown size={20} />
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
