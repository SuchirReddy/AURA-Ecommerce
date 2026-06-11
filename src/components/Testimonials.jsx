import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { getTopReviews } from '../services/reviewService';
import './Testimonials.css';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getTopReviews(3);
        
        // Map backend data to frontend structure if necessary
        const mapped = data.map(r => ({
          id: r.id,
          name: r.profiles?.full_name || 'Anonymous User',
          role: 'Verified Buyer',
          content: r.review_text,
          rating: r.rating,
          image: r.profiles?.avatar_url || 'https://via.placeholder.com/150'
        }));
        
        setTestimonials(mapped);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  if (loading || testimonials.length === 0) {
    return null; // Don't show testimonials section if there's no data
  }

  return (
    <section className="section testimonials-section">
      <div className="container">
        <div className="section-header" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ width: '100%' }}>What Our Customers Say</h2>
        </div>
        
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < testimonial.rating ? "currentColor" : "none"} 
                    color={i < testimonial.rating ? "var(--accent)" : "var(--border)"} 
                  />
                ))}
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
              <div className="testimonial-author">
                <img src={testimonial.image} alt={testimonial.name} className="author-image" />
                <div className="author-info">
                  <h4 className="author-name">{testimonial.name}</h4>
                  <span className="author-role">{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
