import React from 'react';
import './Loader.css';

const Loader = ({ fullScreen = false }) => {
  return (
    <div className={`aura-loader-container ${fullScreen ? 'fullscreen' : ''}`}>
      <div className="aura-loader-text" data-text="AURA.">AURA.</div>
    </div>
  );
};

export default Loader;
