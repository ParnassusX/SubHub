// Tour Overlay Component - Guided tour interface
// Follows established OnboardingOverlay pattern for consistency

import React, { useEffect, useState } from 'react';
import { X, ArrowRight, SkipForward } from 'lucide-react';
import { useTour } from '../../hooks/useTour';
import { useAuth } from '../../contexts/AuthContext';
import type { TourType } from '../../types/tour';
import { TOUR_TYPES } from '../../types/tour';

interface TourOverlayProps {
  tourType?: TourType;
  className?: string;
}

const TourOverlay: React.FC<TourOverlayProps> = ({ 
  tourType = TOUR_TYPES.DASHBOARD,
  className = '' 
}) => {
  const { user } = useAuth();
  const {
    isTourActive,
    isLoading,
    currentStep,
    completeStep,
    skipStep,
    exitTour,
    isLastStep,
    progressPercentage,
    estimatedTimeRemaining,
    error
  } = useTour(tourType);

  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  // Handle escape key to exit tour
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isTourActive) {
        exitTour();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isTourActive, exitTour]);

  // Highlight target element when step changes
  useEffect(() => {
    if (!currentStep || !isTourActive) {
      // Remove existing highlight
      if (highlightedElement) {
        highlightedElement.classList.remove('tour-highlight');
        setHighlightedElement(null);
      }
      return;
    }

    // Find and highlight target element
    const targetElement = document.querySelector(currentStep.target);
    if (targetElement) {
      // Remove previous highlight
      if (highlightedElement) {
        highlightedElement.classList.remove('tour-highlight');
      }

      // Add new highlight
      targetElement.classList.add('tour-highlight');
      setHighlightedElement(targetElement);

      // Scroll element into view
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }

    return () => {
      if (targetElement) {
        targetElement.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, isTourActive, highlightedElement]);

  // Safety checks - don't render if conditions not met
  if (!user || !isTourActive || !currentStep || isLoading || error) {
    return null;
  }

  // Get responsive position
  const getPosition = () => {
    const isMobile = window.innerWidth < 768;
    return isMobile && currentStep.mobilePosition 
      ? currentStep.mobilePosition 
      : currentStep.position;
  };

  const position = getPosition();

  // Calculate overlay position based on target element and step position
  const getOverlayStyle = () => {
    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const rect = targetElement.getBoundingClientRect();
    const overlayWidth = 400; // Approximate overlay width
    const overlayHeight = 300; // Approximate overlay height

    switch (position) {
      case 'top':
        return {
          top: `${rect.top - overlayHeight - 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          top: `${rect.bottom + 20}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - overlayWidth - 20}px`,
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 20}px`,
          transform: 'translateY(-50%)'
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

  return (
    <>
      {/* Backdrop */}
      <div className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm ${className}`} />
      
      {/* Tour Overlay */}
      <div 
        className="fixed z-50 bg-[#20364b] rounded-xl border border-[#2e4e6b] shadow-2xl max-w-md w-full mx-4"
        style={overlayStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2e4e6b]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {currentStep.order}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {currentStep.title}
              </h3>
              <p className="text-xs text-gray-400 capitalize">
                {currentStep.category} tour
              </p>
            </div>
          </div>
          <button
            onClick={exitTour}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Exit tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-3 bg-[#1a2f3f]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Progress</span>
            <span className="text-xs text-gray-400">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {currentStep.description}
          </p>

          {/* Highlights */}
          {currentStep.content?.highlights && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-white">Key Features:</h4>
              <ul className="space-y-1">
                {currentStep.content.highlights.map((highlight, index) => (
                  <li key={index} className="text-xs text-gray-300 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {currentStep.content?.tips && (
            <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-400 mb-2">💡 Pro Tips:</h4>
              <ul className="space-y-1">
                {currentStep.content.tips.map((tip, index) => (
                  <li key={index} className="text-xs text-gray-300">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Action */}
          {currentStep.content?.nextAction && (
            <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-3">
              <p className="text-sm text-green-400">
                <span className="font-medium">Next: </span>
                {currentStep.content.nextAction}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#2e4e6b]">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>{estimatedTimeRemaining}s remaining</span>
          </div>

          <div className="flex items-center space-x-3">
            {currentStep.isOptional && (
              <button
                onClick={() => skipStep()}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 py-1.5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 text-sm"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip</span>
              </button>
            )}

            <button
              onClick={() => completeStep()}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {isLastStep ? (
                <>
                  <span>Complete Tour</span>
                  <X className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TourOverlay;
