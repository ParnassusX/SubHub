// Tour Trigger Component - Button to start guided tours
// Provides easy access to tour functionality throughout the application

import React from 'react';
import { Play, HelpCircle } from 'lucide-react';
import { useTour } from '../../hooks/useTour';
import type { TourType } from '../../types/tour';
import { TOUR_TYPES } from '../../types/tour';

interface TourTriggerProps {
  tourType?: TourType;
  variant?: 'button' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

const TourTrigger: React.FC<TourTriggerProps> = ({
  tourType = TOUR_TYPES.DASHBOARD,
  variant = 'button',
  size = 'md',
  className = '',
  children
}) => {
  const { startTour, isTourActive, isLoading } = useTour(tourType);

  const handleStartTour = () => {
    if (!isTourActive && !isLoading) {
      startTour(tourType);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center transition-colors disabled:opacity-50';
    
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    const variantClasses = {
      button: 'bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium',
      icon: 'text-gray-400 hover:text-blue-400 rounded-full p-2',
      text: 'text-blue-400 hover:text-blue-300 underline'
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getIcon = () => {
    if (variant === 'icon') {
      return <HelpCircle className="w-5 h-5" />;
    }
    return <Play className="w-4 h-4" />;
  };

  const getLabel = () => {
    const labels = {
      [TOUR_TYPES.DASHBOARD]: 'Dashboard Tour',
      [TOUR_TYPES.SUBSCRIPTIONS]: 'Subscriptions Tour',
      [TOUR_TYPES.ANALYTICS]: 'Analytics Tour',
      [TOUR_TYPES.SETTINGS]: 'Settings Tour'
    };
    return labels[tourType] || 'Start Tour';
  };

  if (isTourActive) {
    return null; // Don't show trigger when tour is active
  }

  return (
    <button
      onClick={handleStartTour}
      disabled={isLoading}
      className={getButtonClasses()}
      title={`Start ${getLabel()}`}
    >
      {variant !== 'text' && (
        <span className="mr-2">
          {getIcon()}
        </span>
      )}
      {children || (variant === 'icon' ? null : getLabel())}
    </button>
  );
};

export default TourTrigger;
