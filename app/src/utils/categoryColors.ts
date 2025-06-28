export interface CategoryColor {
  name: string;
  hex: string;
  css: string;
  rgb: string;
  tailwindBg: string;
  tailwindText: string;
}

export const categoryColorMap: Record<string, CategoryColor> = {
  'Entertainment': {
    name: 'Entertainment',
    hex: '#ef4444',
    css: 'bg-red-500',
    rgb: '239, 68, 68',
    tailwindBg: 'bg-red-500',
    tailwindText: 'text-red-400'
  },
  'Productivity': {
    name: 'Productivity', 
    hex: '#3b82f6',
    css: 'bg-blue-500',
    rgb: '59, 130, 246',
    tailwindBg: 'bg-blue-500',
    tailwindText: 'text-blue-400'
  },
  'Health & Fitness': {
    name: 'Health & Fitness',
    hex: '#10b981', 
    css: 'bg-emerald-500',
    rgb: '16, 185, 129',
    tailwindBg: 'bg-emerald-500',
    tailwindText: 'text-emerald-400'
  },
  'Education': {
    name: 'Education',
    hex: '#f59e0b',
    css: 'bg-amber-500', 
    rgb: '245, 158, 11',
    tailwindBg: 'bg-amber-500',
    tailwindText: 'text-amber-400'
  },
  'Business': {
    name: 'Business',
    hex: '#8b5cf6',
    css: 'bg-violet-500',
    rgb: '139, 92, 246',
    tailwindBg: 'bg-violet-500',
    tailwindText: 'text-violet-400'
  },
  'News & Media': {
    name: 'News & Media',
    hex: '#f97316',
    css: 'bg-orange-500',
    rgb: '249, 115, 22',
    tailwindBg: 'bg-orange-500',
    tailwindText: 'text-orange-400'
  },
  'Cloud Storage': {
    name: 'Cloud Storage',
    hex: '#06b6d4',
    css: 'bg-cyan-500',
    rgb: '6, 182, 212',
    tailwindBg: 'bg-cyan-500',
    tailwindText: 'text-cyan-400'
  },
  'Software': {
    name: 'Software',
    hex: '#6366f1',
    css: 'bg-indigo-500',
    rgb: '99, 102, 241',
    tailwindBg: 'bg-indigo-500',
    tailwindText: 'text-indigo-400'
  },
  'Music': {
    name: 'Music',
    hex: '#ec4899',
    css: 'bg-pink-500',
    rgb: '236, 72, 153',
    tailwindBg: 'bg-pink-500',
    tailwindText: 'text-pink-400'
  },
  'Gaming': {
    name: 'Gaming',
    hex: '#84cc16',
    css: 'bg-lime-500',
    rgb: '132, 204, 22',
    tailwindBg: 'bg-lime-500',
    tailwindText: 'text-lime-400'
  },
  'Other': {
    name: 'Other',
    hex: '#6b7280',
    css: 'bg-gray-500',
    rgb: '107, 114, 128',
    tailwindBg: 'bg-gray-500',
    tailwindText: 'text-gray-400'
  }
};

// Default categories for new users
export const defaultCategories = [
  { name: 'Entertainment', color: '#ef4444' },
  { name: 'Productivity', color: '#3b82f6' },
  { name: 'Health & Fitness', color: '#10b981' },
  { name: 'Education', color: '#f59e0b' },
  { name: 'Business', color: '#8b5cf6' },
  { name: 'Other', color: '#6b7280' }
];

// Dynamic category storage for real-time updates
let dynamicCategoryMap: Record<string, CategoryColor> = { ...categoryColorMap };

// Function to update dynamic categories from database
export const updateDynamicCategories = (categories: Array<{ name: string; color: string }>) => {
  const newMap = { ...categoryColorMap };

  categories.forEach(cat => {
    newMap[cat.name] = {
      name: cat.name,
      hex: cat.color,
      css: `bg-[${cat.color}]`,
      rgb: hexToRgb(cat.color),
      tailwindBg: `bg-[${cat.color}]`,
      tailwindText: `text-[${cat.color}]`
    };
  });

  dynamicCategoryMap = newMap;
};

// Utility functions
export const getCategoryColor = (categoryName: string): CategoryColor => {
  return dynamicCategoryMap[categoryName] || dynamicCategoryMap['Other'];
};

export const getCategoryHex = (categoryName: string): string => {
  return getCategoryColor(categoryName).hex;
};

export const getCategoryCss = (categoryName: string): string => {
  return getCategoryColor(categoryName).css;
};

export const getCategoryTailwindBg = (categoryName: string): string => {
  return getCategoryColor(categoryName).tailwindBg;
};

export const getCategoryTailwindText = (categoryName: string): string => {
  return getCategoryColor(categoryName).tailwindText;
};

export const getCategoryRgb = (categoryName: string): string => {
  return getCategoryColor(categoryName).rgb;
};

// Convert hex to RGB for dynamic styling
export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '107, 114, 128'; // Default gray
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `${r}, ${g}, ${b}`;
};

// Generate category badge component props
export const getCategoryBadgeProps = (categoryName: string) => {
  const color = getCategoryColor(categoryName);
  return {
    style: { backgroundColor: color.hex },
    className: `px-2 py-1 text-xs text-white rounded-full ${color.tailwindBg}`,
    'data-category': categoryName
  };
};

// Generate category dot component props
export const getCategoryDotProps = (categoryName: string) => {
  const color = getCategoryColor(categoryName);
  return {
    style: { backgroundColor: color.hex },
    className: 'w-4 h-4 rounded-full flex-shrink-0',
    'data-category': categoryName
  };
};

// Validate if a category exists in our color map
export const isValidCategory = (categoryName: string): boolean => {
  return categoryName in categoryColorMap;
};

// Get all available categories
export const getAllCategories = (): CategoryColor[] => {
  return Object.values(categoryColorMap);
};

// Get category names only
export const getCategoryNames = (): string[] => {
  return Object.keys(categoryColorMap);
};

// Generate CSS custom properties for dynamic theming
export const generateCategoryCssVars = (categoryName: string): Record<string, string> => {
  const color = getCategoryColor(categoryName);
  return {
    '--category-color': color.hex,
    '--category-rgb': color.rgb,
    '--category-bg': color.css
  };
};

// For use with Tailwind's arbitrary value syntax
export const getCategoryArbitraryBg = (categoryName: string): string => {
  const hex = getCategoryHex(categoryName);
  return `bg-[${hex}]`;
};

export const getCategoryArbitraryText = (categoryName: string): string => {
  const hex = getCategoryHex(categoryName);
  return `text-[${hex}]`;
};

// Category color utilities for forms and selectors
export const getCategorySelectOptions = () => {
  return getAllCategories().map(category => ({
    value: category.name,
    label: category.name,
    color: category.hex,
    style: { backgroundColor: category.hex }
  }));
};

// Accessibility helpers
export const getCategoryAriaLabel = (categoryName: string): string => {
  return `Category: ${categoryName}`;
};

export const getCategoryColorContrast = (categoryName: string): 'light' | 'dark' => {
  const color = getCategoryColor(categoryName);
  const rgb = color.rgb.split(', ').map(Number);
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? 'dark' : 'light';
};

// For dynamic text color based on background
export const getCategoryTextColor = (categoryName: string): string => {
  const contrast = getCategoryColorContrast(categoryName);
  return contrast === 'light' ? '#000000' : '#ffffff';
};
