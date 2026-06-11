import React from 'react';
import { Link } from 'react-router-dom';
import './PromoBanner.css';

const PromoBanner = ({ image, title, subtitle, linkText, linkUrl, reverse = false }) => {
  return (
    <section className={`promo-banner ${reverse ? 'reverse' : ''}`}>
      <div className="promo-banner-container">
        <div className="promo-banner-content fade-in">
          <h2>{title}</h2>
          <p>{subtitle}</p>
          <Link to={linkUrl} className="btn-secondary promo-btn">{linkText}</Link>
        </div>
        <div className="promo-banner-image">
          <img src={image} alt={title} />
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
