// Feature Highlight Component - Progressive feature discovery
// Provides contextual feature introductions and tips

import React, { useEffect, useState } from 'react';
import { X, ArrowRight, Lightbulb, Star, Zap, Info } from 'lucide-react';
import { useFeatureDiscovery } from '../../hooks/useFeatureDiscovery';

interface FeatureHighlightProps {
  subscriptionCount?: number;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  currentPage?: string;
  className?: string;
}

const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  subscriptionCount = 0,
  userLevel = 'beginner',
  currentPage = 'dashboard',
  className = ''
}) => {
  const {
    isActive,
    currentHighlight,
    dismissFeature,
    takeAction,
    discoveryEnabled
  } = useFeatureDiscovery({
    enabled: true,
    currentPage,
    subscriptionCount,
    userLevel,
    autoShow: true
  });

  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [autoHideTimer, setAutoHideTimer] = useState<NodeJS.Timeout | null>(null);

  // Handle auto-hide timer
  useEffect(() => {
    if (!currentHighlight || !isActive) {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
        setAutoHideTimer(null);
      }
      return;
    }

    // Set auto-hide timer if specified
    if (currentHighlight.display.showDuration && currentHighlight.display.showDuration > 0) {
      const timer = setTimeout(() => {
        dismissFeature();
      }, currentHighlight.display.showDuration);
      
      setAutoHideTimer(timer);
    }

    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, [currentHighlight, isActive, dismissFeature, autoHideTimer]);

  // Highlight target element when feature changes
  useEffect(() => {
    if (!currentHighlight || !isActive) {
      // Remove existing highlight
      if (highlightedElement) {
        highlightedElement.classList.remove('feature-highlight');
        setHighlightedElement(null);
      }
      return;
    }

    // Find and highlight target element
    const targetElement = document.querySelector(currentHighlight.target);
    if (targetElement) {
      // Remove previous highlight
      if (highlightedElement) {
        highlightedElement.classList.remove('feature-highlight');
      }

      // Add new highlight
      targetElement.classList.add('feature-highlight');
      setHighlightedElement(targetElement);

      // Scroll element into view gently
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove('feature-highlight');
      }
    };
  }, [currentHighlight, isActive, highlightedElement]);

  // Don't render if conditions not met
  if (!discoveryEnabled || !isActive || !currentHighlight) {
    return null;
  }

  // Get category icon
  const getCategoryIcon = () => {
    switch (currentHighlight.category) {
      case 'new':
        return <Star className="w-4 h-4 text-yellow-400" />;
      case 'advanced':
        return <Zap className="w-4 h-4 text-purple-400" />;
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-blue-400" />;
      case 'update':
        return <Info className="w-4 h-4 text-green-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get category color
  const getCategoryColor = () => {
    switch (currentHighlight.category) {
      case 'new':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'advanced':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'tip':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'update':
        return 'border-green-500/30 bg-green-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  // Calculate overlay position based on target element and position
  const getOverlayStyle = () => {
    const targetElement = document.querySelector(currentHighlight.target);
    if (!targetElement) {
      return { top: '20px', right: '20px' };
    }

    const rect = targetElement.getBoundingClientRect();
    const overlayWidth = 320; // Approximate overlay width
    const overlayHeight = 200; // Approximate overlay height

    // Get responsive position
    const isMobile = window.innerWidth < 768;
    const position = isMobile && currentHighlight.display.mobilePosition 
      ? currentHighlight.display.mobilePosition 
      : currentHighlight.display.position;

    switch (position) {
      case 'top':
        return {
          top: `${Math.max(rect.top - overlayHeight - 20, 20)}px`,
          left: `${Math.min(Math.max(rect.left + rect.width / 2 - overlayWidth / 2, 20), window.innerWidth - overlayWidth - 20)}px`
        };
      case 'bottom':
        return {
          top: `${Math.min(rect.bottom + 20, window.innerHeight - overlayHeight - 20)}px`,
          left: `${Math.min(Math.max(rect.left + rect.width / 2 - overlayWidth / 2, 20), window.innerWidth - overlayWidth - 20)}px`
        };
      case 'left':
        return {
          top: `${Math.min(Math.max(rect.top + rect.height / 2 - overlayHeight / 2, 20), window.innerHeight - overlayHeight - 20)}px`,
          left: `${Math.max(rect.left - overlayWidth - 20, 20)}px`
        };
      case 'right':
        return {
          top: `${Math.min(Math.max(rect.top + rect.height / 2 - overlayHeight / 2, 20), window.innerHeight - overlayHeight - 20)}px`,
          left: `${Math.min(rect.right + 20, window.innerWidth - overlayWidth - 20)}px`
        };
      case 'center':
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  const overlayStyle = getOverlayStyle();

  const handleAction = () => {
    takeAction();
    // Navigate to learn more URL if provided
    if (currentHighlight.content.learnMoreUrl) {
      window.location.href = currentHighlight.content.learnMoreUrl;
    }
  };

  return (
    <div 
      className={`fixed z-40 bg-[#20364b] rounded-lg border shadow-lg max-w-sm w-full mx-4 ${getCategoryColor()} ${className}`}
      style={overlayStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[#2e4e6b]/50">
        <div className="flex items-center space-x-2">
          {getCategoryIcon()}
          <div>
            <h3 className="text-sm font-semibold text-white">
              {currentHighlight.content.headline}
            </h3>
            <p className="text-xs text-gray-400 capitalize">
              {currentHighlight.category} feature
            </p>
          </div>
        </div>
        {currentHighlight.display.dismissible && (
          <button
            onClick={() => dismissFeature()}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Dismiss feature highlight"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        <p className="text-gray-300 text-sm leading-relaxed">
          {currentHighlight.description}
        </p>

        {/* Benefits */}
        {currentHighlight.content.benefits && currentHighlight.content.benefits.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-white">Benefits:</h4>
            <ul className="space-y-1">
              {currentHighlight.content.benefits.slice(0, 3).map((benefit, index) => (
                <li key={index} className="text-xs text-gray-300 flex items-start space-x-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-[#2e4e6b]/50">
        <div className="text-xs text-gray-400">
          {currentHighlight.priority} priority
        </div>

        <button
          onClick={handleAction}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
        >
          <span>{currentHighlight.content.callToAction}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default FeatureHighlight;
