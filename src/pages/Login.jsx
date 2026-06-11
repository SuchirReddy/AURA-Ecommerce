import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import './Auth.css';

const Login = () => {
  return (
    <div className="auth-page">
      <div className="auth-split-layout">
        
        {/* Image Column */}
        <div className="auth-image-column">
          <img 
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200" 
            alt="Fashion Model" 
            className="auth-image" 
          />
          <div className="auth-image-overlay">
            <h2>Welcome back to AURA.</h2>
            <p>Log in to access your personalized shopping experience, track orders, and discover new arrivals.</p>
          </div>
        </div>

        {/* Form Column */}
        <div className="auth-form-column" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SignIn 
            routing="path" 
            path="/login"
            fallbackRedirectUrl="/" 
            signUpUrl="/signup" 
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

export default Login;
