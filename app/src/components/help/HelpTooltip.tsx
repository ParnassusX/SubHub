// Help Tooltip Component - Contextual help system
// Provides on-demand help and guidance throughout the application

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  trigger?: 'hover' | 'click';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'info' | 'warning' | 'success';
  maxWidth?: number;
  learnMoreUrl?: string;
  className?: string;
  children?: React.ReactNode;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  position = 'auto',
  trigger = 'hover',
  size = 'md',
  variant = 'default',
  maxWidth = 300,
  learnMoreUrl,
  className = '',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Calculate optimal position
  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    if (position === 'auto') {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let optimalPosition = 'top';

      // Check if there's space above
      if (triggerRect.top < tooltipRect.height + 20) {
        optimalPosition = 'bottom';
      }

      // Check if there's space to the right
      if (triggerRect.right + tooltipRect.width + 20 > viewportWidth) {
        optimalPosition = triggerRect.top > viewportHeight / 2 ? 'top' : 'bottom';
      }

      // Check if there's space to the left
      if (triggerRect.left < tooltipRect.width + 20) {
        optimalPosition = triggerRect.top > viewportHeight / 2 ? 'top' : 'bottom';
      }

      setActualPosition(optimalPosition as any);
    } else {
      setActualPosition(position);
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs p-2';
      case 'lg':
        return 'text-sm p-4';
      case 'md':
      default:
        return 'text-sm p-3';
    }
  };

  // Get variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'info':
        return 'bg-blue-900/90 border-blue-600/30 text-blue-100';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-600/30 text-yellow-100';
      case 'success':
        return 'bg-green-900/90 border-green-600/30 text-green-100';
      case 'default':
      default:
        return 'bg-[#20364b]/95 border-[#2e4e6b]/50 text-gray-200';
    }
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  // Get arrow classes
  const getArrowClasses = () => {
    const baseArrow = 'absolute w-2 h-2 transform rotate-45';
    const variantArrow = variant === 'info' ? 'bg-blue-900' :
                        variant === 'warning' ? 'bg-yellow-900' :
                        variant === 'success' ? 'bg-green-900' :
                        'bg-[#20364b]';

    switch (actualPosition) {
      case 'top':
        return `${baseArrow} ${variantArrow} top-full left-1/2 -translate-x-1/2 -mt-1`;
      case 'bottom':
        return `${baseArrow} ${variantArrow} bottom-full left-1/2 -translate-x-1/2 -mb-1`;
      case 'left':
        return `${baseArrow} ${variantArrow} left-full top-1/2 -translate-y-1/2 -ml-1`;
      case 'right':
        return `${baseArrow} ${variantArrow} right-full top-1/2 -translate-y-1/2 -mr-1`;
      default:
        return `${baseArrow} ${variantArrow} top-full left-1/2 -translate-x-1/2 -mt-1`;
    }
  };

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Trigger */}
      {children || (
        <button
          className="text-gray-400 hover:text-blue-400 transition-colors"
          aria-label="Show help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      )}

      {/* Tooltip */}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 rounded-lg border shadow-lg backdrop-blur-sm ${getPositionClasses()} ${getVariantClasses()} ${getSizeClasses()}`}
          style={{ maxWidth: `${maxWidth}px` }}
        >
          {/* Arrow */}
          <div className={getArrowClasses()} />

          {/* Header */}
          {(title || trigger === 'click') && (
            <div className="flex items-center justify-between mb-2">
              {title && (
                <h4 className="font-medium text-white text-sm">
                  {title}
                </h4>
              )}
              {trigger === 'click' && (
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-white transition-colors ml-2"
                  aria-label="Close help"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="leading-relaxed">
            {content}
          </div>

          {/* Learn More Link */}
          {learnMoreUrl && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <a
                href={learnMoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Learn more</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HelpTooltip;
