import React from 'react';
import { Truck, Leaf, ShieldCheck, Clock } from 'lucide-react';
import './TrustBar.css';

const benefits = [
  {
    icon: <Truck size={20} strokeWidth={1.5} />,
    title: 'Free Global Shipping',
    subtitle: 'On orders over ₹10,000'
  },
  {
    icon: <Leaf size={20} strokeWidth={1.5} />,
    title: 'Sustainable Materials',
    subtitle: 'Ethically sourced'
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={1.5} />,
    title: 'Secure Checkout',
    subtitle: '100% protected payments'
  },
  {
    icon: <Clock size={20} strokeWidth={1.5} />,
    title: '24/7 Support',
    subtitle: 'Dedicated assistance'
  }
];

const TrustBar = () => {
  return (
    <div className="trust-bar-section">
      <div className="trust-bar-container">
        {benefits.map((benefit, index) => (
          <div key={index} className="trust-item">
            <div className="trust-icon-wrapper">
              {benefit.icon}
            </div>
            <div className="trust-text">
              <span className="trust-title">{benefit.title}</span>
              <span className="trust-subtitle">{benefit.subtitle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBar;
