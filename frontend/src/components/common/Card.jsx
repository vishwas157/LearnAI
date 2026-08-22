import React from 'react';

const Card = ({
  children,
  className = '',
  hoverEffect = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`academic-card p-5 ${
        hoverEffect ? 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer transition-all' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
