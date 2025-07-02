// Responsive Card Component for Dashboard UX Optimization
import React, { ReactNode } from 'react';

interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'compact' | 'expandable';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  onClick
}) => {
  const baseClasses = 'bg-[#1a2332] rounded-xl border border-[#2e4e6b] transition-all duration-200';
  
  const variantClasses = {
    default: 'w-full',
    hero: 'w-full bg-gradient-to-br from-[#1a2332] to-[#243447] border-[#3e5e7b]',
    compact: 'w-full min-h-0',
    expandable: 'w-full overflow-hidden'
  };

  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const hoverClasses = hover || onClick ? 'hover:bg-[#243447] hover:border-[#3e5e7b] cursor-pointer' : '';
  const clickableClasses = onClick ? 'focus:outline-none focus:ring-2 focus:ring-blue-500/50' : '';

  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${clickableClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={combinedClasses}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Component>
  );
};

export default ResponsiveCard;
