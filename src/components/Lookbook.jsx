import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Lookbook.css';

const hotspots = [
  {
    id: 1,
    top: '35%',
    left: '42%',
    title: 'Oversized Trench Coat',
    price: '₹12,999',
    link: '/product/3c0451e8-8cbf-44af-b3d0-50fe9f4c06e0'
  },
  {
    id: 2,
    top: '28%',
    left: '52%',
    title: 'Ribbed Turtleneck',
    price: '₹3,499',
    link: '/product/ffdcfddd-e99f-4790-9761-fd57fa106e82'
  },
  {
    id: 3,
    top: '70%',
    left: '35%',
    title: 'Premium Leather Tote',
    price: '₹8,999',
    link: '/product/c7f4383f-a81f-47c7-a537-0dc8cf2d4540'
  },
  {
    id: 4,
    top: '65%',
    left: '55%',
    title: 'Tailored Trousers',
    price: '₹4,999',
    link: '/product/7e364fe2-4683-4aa3-9a02-1666255f0df9'
  }
];

const Lookbook = () => {
  const navigate = useNavigate();

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
                <button className="tooltip-btn" onClick={() => navigate(spot.link)}>
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
