import React from 'react';
import { Star } from 'lucide-react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sophia L.",
      role: "Verified Buyer",
      content: "The quality of the coat is exceptional. It's my go-to piece for every occasion now.",
      rating: 5,
      image: "/assets/testimonial_1_1783455704245.png"
    },
    {
      id: 2,
      name: "Marcus T.",
      role: "Verified Buyer",
      content: "Impeccable tailoring and amazing fabrics. Definitely feels like premium luxury.",
      rating: 5,
      image: "/assets/testimonial_2_1783455713292.png"
    },
    {
      id: 3,
      name: "Elena R.",
      role: "Verified Buyer",
      content: "I've never felt more confident. The knitwear is incredibly soft and chic.",
      rating: 5,
      image: "/assets/testimonial_3_1783455723929.png"
    },
    {
      id: 4,
      name: "Isabella K.",
      role: "Verified Buyer",
      content: "A masterpiece of minimalist design. It transitions perfectly from day to night.",
      rating: 5,
      image: "/assets/testimonial_4_1783455736171.png"
    }
  ];

  // Duplicate 3 times for a seamless infinite marquee
  const marqueeItems = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="section testimonials-section">
      <div className="section-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="section-title" style={{ width: '100%' }}>What Our Customers Say</h2>
      </div>
      
      <div className="testimonials-marquee-wrapper">
        <div className="testimonials-marquee">
          {marqueeItems.map((testimonial, idx) => (
            <div key={`${testimonial.id}-${idx}`} className="testimonial-image-card interactive">
              <img src={testimonial.image} alt={testimonial.name} className="testimonial-bg-image" />
              <div className="testimonial-card-overlay">
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < testimonial.rating ? "#fff" : "none"} 
                      color={i < testimonial.rating ? "#fff" : "rgba(255,255,255,0.3)"} 
                    />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
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
