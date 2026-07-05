import React from 'react';
import './Marquee.css';

const Marquee = ({ text, items, children, speed = 30, reverse = false, className = '' }) => {
  // For text, we might want to repeat it a few times within one block so it fills the screen initially
  const repeatText = (str) => {
    return new Array(10).fill(str).join(' \u00A0\u00A0\u00A0\u00A0\u00A0 '); // Adds non-breaking spaces between text
  };

  const content = children ? (
    <div className="marquee-custom-group">{children}</div>
  ) : text ? (
    <div className="marquee-text-item">{repeatText(text)}</div>
  ) : items && items.length > 0 ? (
    <div className="marquee-image-group">
      {items.map((item, index) => (
        <div key={index} className="marquee-image-item">
          <img src={item.image} alt={item.alt || `Marquee item ${index}`} />
        </div>
      ))}
    </div>
  ) : null;

  if (!content) return null;

  const animationDuration = `${speed}s`;
  const animationDirection = reverse ? 'reverse' : 'normal';

  return (
    <div className={`marquee-container ${className}`}>
      <div 
        className="marquee-track" 
        style={{ 
          animationDuration,
          animationDirection
        }}
      >
        <div className="marquee-content">{content}</div>
        <div className="marquee-content" aria-hidden="true">{content}</div>
      </div>
    </div>
  );
};

export default Marquee;
