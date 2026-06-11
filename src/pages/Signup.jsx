import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import './Auth.css';

const Signup = () => {
  return (
    <div className="auth-page">
      <div className="auth-split-layout">
        
        {/* Image Column */}
        <div className="auth-image-column">
          <img 
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200" 
            alt="Fashion Model" 
            className="auth-image" 
          />
          <div className="auth-image-overlay">
            <h2>Join the AURA community.</h2>
            <p>Create an account for faster checkout, personalized recommendations, and exclusive rewards.</p>
          </div>
        </div>

        {/* Form Column */}
        <div className="auth-form-column" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SignUp 
            routing="path" 
            path="/signup"
            fallbackRedirectUrl="/" 
            signInUrl="/login"
            appearance={{
              baseTheme: dark,
              variables: {
                colorBackground: 'transparent',
              },
              elements: {
                rootBox: {
                  width: '100%',
                  maxWidth: '400px'
                },
                cardBox: {
                  boxShadow: 'none'
                },
                card: {
                  boxShadow: 'none',
                  backgroundColor: 'transparent'
                }
              }
            }}
          />
        </div>
        
      </div>
    </div>
  );
};

export default Signup;
