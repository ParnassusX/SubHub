import React from 'react';

// Category color system
export const CATEGORY_COLORS = {
  entertainment: { 
    primary: '#ef4444', 
    light: '#fef2f2', 
    border: '#fecaca',
    icon: '🎬'
  },
  productivity: { 
    primary: '#3b82f6', 
    light: '#eff6ff', 
    border: '#bfdbfe',
    icon: '💼'
  },
  development: { 
    primary: '#10b981', 
    light: '#f0fdf4', 
    border: '#bbf7d0',
    icon: '💻'
  },
  health: { 
    primary: '#ec4899', 
    light: '#fdf2f8', 
    border: '#fbcfe8',
    icon: '🏥'
  },
  finance: { 
    primary: '#6366f1', 
    light: '#eef2ff', 
    border: '#c7d2fe',
    icon: '💰'
  },
  education: { 
    primary: '#f59e0b', 
    light: '#fffbeb', 
    border: '#fed7aa',
    icon: '📚'
  },
  gaming: {
    primary: '#8b5cf6',
    light: '#f5f3ff',
    border: '#c4b5fd',
    icon: '🎮'
  },
  music: {
    primary: '#06b6d4',
    light: '#ecfeff',
    border: '#a5f3fc',
    icon: '🎵'
  },
  news: {
    primary: '#64748b',
    light: '#f8fafc',
    border: '#cbd5e1',
    icon: '📰'
  },
  shopping: {
    primary: '#d946ef',
    light: '#fdf4ff',
    border: '#f0abfc',
    icon: '🛒'
  },
  travel: {
    primary: '#0ea5e9',
    light: '#f0f9ff',
    border: '#7dd3fc',
    icon: '✈️'
  },
  food: {
    primary: '#f97316',
    light: '#fff7ed',
    border: '#fed7aa',
    icon: '🍕'
  },
  utilities: {
    primary: '#84cc16',
    light: '#f7fee7',
    border: '#bef264',
    icon: '⚡'
  },
  other: {
    primary: '#6b7280',
    light: '#f9fafb',
    border: '#d1d5db',
    icon: '📦'
  }
} as const;

export type CategoryKey = keyof typeof CATEGORY_COLORS;

// Get category colors with fallback
export const getCategoryColors = (category: string) => {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '') as CategoryKey;
  return CATEGORY_COLORS[normalizedCategory] || CATEGORY_COLORS.other;
};

// Category indicator component props
export interface CategoryIndicatorProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

// Category indicator component
export const CategoryIndicator: React.FC<CategoryIndicatorProps> = ({ 
  category, 
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const colors = getCategoryColors(category);
  
  const sizeClasses = {
    sm: 'w-3 h-3 text-xs',
    md: 'w-4 h-4 text-sm',
    lg: 'w-6 h-6 text-base'
  };
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full border-2 flex items-center justify-center ${className}`}
      style={{
        backgroundColor: colors.light,
        borderColor: colors.border,
        color: colors.primary
      }}
    >
      {showIcon && <span>{colors.icon}</span>}
    </div>
  );
};

// Category badge component
export interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ 
  category, 
  className = '' 
}) => {
  const colors = getCategoryColors(category);
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: colors.light,
        color: colors.primary,
        borderColor: colors.border
      }}
    >
      <span className="mr-1">{colors.icon}</span>
      {category}
    </span>
  );
};

// Get category color for charts/graphs
export const getCategoryColor = (category: string): string => {
  return getCategoryColors(category).primary;
};

// Get all category colors for legends
export const getAllCategoryColors = (): Array<{ category: string; color: string; icon: string }> => {
  return Object.entries(CATEGORY_COLORS).map(([category, colors]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    color: colors.primary,
    icon: colors.icon
  }));
};

// Severity color system for insights - Dark theme compatible
export const SEVERITY_COLORS = {
  low: {
    bg: 'bg-success-500/10',
    border: 'border-success-500/20',
    text: 'text-success-400',
    icon: '✅'
  },
  medium: {
    bg: 'bg-warning-500/10',
    border: 'border-warning-500/20',
    text: 'text-warning-400',
    icon: '⚠️'
  },
  high: {
    bg: 'bg-error-500/10',
    border: 'border-error-500/20',
    text: 'text-error-400',
    icon: '🚨'
  }
} as const;

export type SeverityLevel = keyof typeof SEVERITY_COLORS;

export const getSeverityColors = (severity: SeverityLevel) => {
  return SEVERITY_COLORS[severity];
};
