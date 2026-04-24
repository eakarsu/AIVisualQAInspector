import React from 'react';

function Card({ children, className = '', onClick }) {
  return (
    <div
      className={`detail-container ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : {}}
    >
      {children}
    </div>
  );
}

export default Card;
