import React from 'react';
import './Lookbook.css';

const hotspots = [
  {
    id: 1,
    top: '35%',
    left: '42%',
    title: 'Oversized Trench Coat',
    price: '₹12,999',
    link: '/shop/trench-coat'
  },
  {
    id: 2,
    top: '28%',
    left: '52%',
    title: 'Ribbed Turtleneck',
    price: '₹3,499',
    link: '/shop/turtleneck'
  },
  {
    id: 3,
    top: '70%',
    left: '35%',
    title: 'Premium Leather Tote',
    price: '₹8,999',
    link: '/shop/tote-bag'
  },
  {
    id: 4,
    top: '65%',
    left: '55%',
    title: 'Tailored Trousers',
    price: '₹4,999',
    link: '/shop/trousers'
  }
];

const Lookbook = () => {
  return (
    <section className="lookbook-section">
      <div className="lookbook-container">
        <div className="lookbook-header">
          <h2 className="lookbook-title">Shop The Look</h2>
          <p className="lookbook-subtitle">Discover our curated editorial styles and shop them directly from the lookbook.</p>
        </div>
        
        <div className="lookbook-image-wrapper">
          <img src="/assets/premium_lookbook.png" alt="Editorial Fashion Lookbook" />
          
          {hotspots.map((spot) => (
            <div 
              key={spot.id} 
              className="hotspot" 
              style={{ top: spot.top, left: spot.left }}
            >
              <div className="hotspot-inner"></div>
              
              <div className="hotspot-tooltip">
                <div className="tooltip-title">{spot.title}</div>
                <div className="tooltip-price">{spot.price}</div>
                <button className="tooltip-btn" onClick={() => window.location.href = spot.link}>
                  View Product
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Lookbook;
