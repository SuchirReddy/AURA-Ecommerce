import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSiteSettings } from '../services/contentService';
import './Hero.css';

const Hero = () => {
  const [content, setContent] = useState({
    hero_badge: 'New Collection',
    hero_title: 'Elevate Your Everyday Style.',
    hero_subtitle: 'Discover the new standard of modern minimalism. Designed for those who appreciate the finer details.',
    hero_cta_primary: 'Shop the Collection',
    hero_cta_primary_url: '/shop',
    hero_cta_secondary: 'Explore Lookbook',
    hero_banner_image: '',
    hero_enabled: 'true',
    announcement_text: '',
    announcement_enabled: 'false'
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await getSiteSettings();
        setContent(prev => ({ ...prev, ...data }));
      } catch (err) {
        // Fallback to defaults silently
      }
    };
    fetchContent();
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      {content.announcement_enabled === 'true' && content.announcement_text && (
        <div style={{
          background: 'var(--text-primary)', color: 'var(--bg-primary)',
          textAlign: 'center', padding: '10px 16px', fontSize: '0.85rem',
          fontWeight: '500', letterSpacing: '0.03em',
          position: 'relative', zIndex: 101
        }}>
          {content.announcement_text}
        </div>
      )}

      <section className="hero">
          <div className="hero-background" style={content.hero_enabled === 'true' && content.hero_banner_image ? {
            backgroundImage: `url(${content.hero_banner_image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {}}>
            <div className="hero-overlay"></div>
          </div>

          <div className="container hero-content">
            <span className="hero-badge">{content.hero_badge}</span>
            <h1 className="hero-title">
              {content.hero_title}
            </h1>
            <p className="hero-subtitle">
              {content.hero_subtitle}
            </p>

            <div className="hero-actions">
              <Link to={content.hero_cta_primary_url || '/shop'} className="btn-primary" style={{ textDecoration: 'none' }}>
                {content.hero_cta_primary} <ArrowRight size={20} style={{ marginLeft: '8px' }} />
              </Link>
              {content.hero_cta_secondary && (
                <button className="btn-secondary">
                  {content.hero_cta_secondary}
                </button>
              )}
            </div>
          </div>
        </section>
    </>
  );
};

export default Hero;
