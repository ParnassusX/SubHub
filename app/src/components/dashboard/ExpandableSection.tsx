// Expandable Section Component for Progressive Disclosure
import React, { useState, ReactNode } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import ResponsiveCard from './ResponsiveCard';

interface ExpandableSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  previewContent?: ReactNode;
  expandLabel?: string;
  collapseLabel?: string;
  variant?: 'default' | 'compact';
  showItemCount?: number;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  subtitle,
  children,
  defaultExpanded = false,
  previewContent,
  expandLabel,
  collapseLabel,
  variant = 'default',
  showItemCount
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const finalExpandLabel = expandLabel || t('viewMoreButton');
  const finalCollapseLabel = collapseLabel || t('showLessButton');

  return (
    <ResponsiveCard variant="expandable" padding={variant === 'compact' ? 'sm' : 'md'}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-white text-lg font-bold truncate">{title}</h3>
              {showItemCount !== undefined && (
                <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                  {showItemCount}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            <span>{isExpanded ? finalCollapseLabel : finalExpandLabel}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Preview Content (shown when collapsed) */}
        {!isExpanded && previewContent && (
          <div className="space-y-3">
            {previewContent}
          </div>
        )}

        {/* Full Content (shown when expanded) */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {isExpanded && (
            <div className="space-y-3 pt-2 border-t border-gray-700">
              {children}
            </div>
          )}
        </div>

        {/* Expand/Collapse Button (alternative placement) */}
        {!isExpanded && !previewContent && (
          <button
            onClick={toggleExpanded}
            className="w-full py-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors border-t border-gray-700 pt-3"
          >
            {finalExpandLabel} →
          </button>
        )}
      </div>
    </ResponsiveCard>
  );
};

export default ExpandableSection;
