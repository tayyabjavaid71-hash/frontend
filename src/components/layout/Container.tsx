import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  isFullHeight?: boolean;
}

export const Container: React.FC<ContainerProps> = ({ children, className = '', isFullHeight = false }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${isFullHeight ? 'flex-1' : ''} ${className}`}>
      {children}
    </div>
  );
};
