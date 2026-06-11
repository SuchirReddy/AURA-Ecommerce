import React from 'react';
import './Newsletter.css';

const Newsletter = () => {
  return (
    <section className="section newsletter-section">
      <div className="container newsletter-container">
        <div className="newsletter-content">
          <h2>Join the Club</h2>
          <p>Subscribe to receive updates, access to exclusive deals, and more.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="newsletter-input" 
              required
            />
            <button type="submit" className="btn-primary newsletter-btn">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
