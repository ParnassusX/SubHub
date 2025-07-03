import React, { useState } from 'react';
import {
  // Category-related icons
  Tag, FolderOpen, Bookmark, Hash, Star, Heart,
  // Entertainment & Media
  Music, Video, Tv, Radio, Headphones, Camera,
  // Shopping & Commerce
  ShoppingCart, ShoppingBag, CreditCard, DollarSign, Gift, Package,
  // Technology & Software
  Smartphone, Laptop, Monitor, Wifi, Cloud, Code,
  // Health & Fitness
  Activity, Heart as HeartIcon, Zap, Target, Dumbbell, Apple,
  // Travel & Transportation
  Car, Plane, Train, MapPin, Compass, Globe,
  // Food & Dining
  Coffee, Pizza, Utensils, ChefHat, Wine, IceCream,
  // Education & Learning
  BookOpen, GraduationCap, PenTool, FileText, Library, Award,
  // Business & Finance
  Briefcase, TrendingUp, PieChart, Calculator, Building, Banknote,
  // Communication & Social
  MessageCircle, Mail, Phone, Users, Share, Bell,
  // Utilities & Services
  Home, Lightbulb, Wrench, Shield, Lock, Key,
  // Gaming & Entertainment
  Gamepad2, Dice1, Trophy, Puzzle, Sparkles, Rocket,
  // News & Information
  Newspaper, Rss, Search, Eye, Info, AlertCircle
} from 'lucide-react';

// Define icon categories for better organization
const iconCategories = {
  'General': [Tag, FolderOpen, Bookmark, Hash, Star, Heart],
  'Entertainment': [Music, Video, Tv, Radio, Headphones, Camera],
  'Shopping': [ShoppingCart, ShoppingBag, CreditCard, DollarSign, Gift, Package],
  'Technology': [Smartphone, Laptop, Monitor, Wifi, Cloud, Code],
  'Health': [Activity, HeartIcon, Zap, Target, Dumbbell, Apple],
  'Travel': [Car, Plane, Train, MapPin, Compass, Globe],
  'Food': [Coffee, Pizza, Utensils, ChefHat, Wine, IceCream],
  'Education': [BookOpen, GraduationCap, PenTool, FileText, Library, Award],
  'Business': [Briefcase, TrendingUp, PieChart, Calculator, Building, Banknote],
  'Communication': [MessageCircle, Mail, Phone, Users, Share, Bell],
  'Utilities': [Home, Lightbulb, Wrench, Shield, Lock, Key],
  'Gaming': [Gamepad2, Dice1, Trophy, Puzzle, Sparkles, Rocket],
  'News': [Newspaper, Rss, Search, Eye, Info, AlertCircle]
};

// Create a mapping of icon names to components for storage
const iconMap: Record<string, React.ComponentType<any>> = {
  // General
  'Tag': Tag, 'FolderOpen': FolderOpen, 'Bookmark': Bookmark, 'Hash': Hash, 'Star': Star, 'Heart': Heart,
  // Entertainment
  'Music': Music, 'Video': Video, 'Tv': Tv, 'Radio': Radio, 'Headphones': Headphones, 'Camera': Camera,
  // Shopping
  'ShoppingCart': ShoppingCart, 'ShoppingBag': ShoppingBag, 'CreditCard': CreditCard, 
  'DollarSign': DollarSign, 'Gift': Gift, 'Package': Package,
  // Technology
  'Smartphone': Smartphone, 'Laptop': Laptop, 'Monitor': Monitor, 'Wifi': Wifi, 'Cloud': Cloud, 'Code': Code,
  // Health
  'Activity': Activity, 'HeartIcon': HeartIcon, 'Zap': Zap, 'Target': Target, 'Dumbbell': Dumbbell, 'Apple': Apple,
  // Travel
  'Car': Car, 'Plane': Plane, 'Train': Train, 'MapPin': MapPin, 'Compass': Compass, 'Globe': Globe,
  // Food
  'Coffee': Coffee, 'Pizza': Pizza, 'Utensils': Utensils, 'ChefHat': ChefHat, 'Wine': Wine, 'IceCream': IceCream,
  // Education
  'BookOpen': BookOpen, 'GraduationCap': GraduationCap, 'PenTool': PenTool, 
  'FileText': FileText, 'Library': Library, 'Award': Award,
  // Business
  'Briefcase': Briefcase, 'TrendingUp': TrendingUp, 'PieChart': PieChart,
  'Calculator': Calculator, 'Building': Building, 'Banknote': Banknote,
  // Communication
  'MessageCircle': MessageCircle, 'Mail': Mail, 'Phone': Phone, 'Users': Users, 'Share': Share, 'Bell': Bell,
  // Utilities
  'Home': Home, 'Lightbulb': Lightbulb, 'Wrench': Wrench, 'Shield': Shield, 'Lock': Lock, 'Key': Key,
  // Gaming
  'Gamepad2': Gamepad2, 'Dice1': Dice1, 'Trophy': Trophy, 'Puzzle': Puzzle, 'Sparkles': Sparkles, 'Rocket': Rocket,
  // News
  'Newspaper': Newspaper, 'Rss': Rss, 'Search': Search, 'Eye': Eye, 'Info': Info, 'AlertCircle': AlertCircle
};

interface IconPickerProps {
  selectedIcon?: string | null;
  onIconSelect: (iconName: string | null) => void;
  className?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  onIconSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('General');

  const handleIconSelect = (iconName: string) => {
    onIconSelect(iconName);
    setIsOpen(false);
  };

  const clearIcon = () => {
    onIconSelect(null);
    setIsOpen(false);
  };

  // Get the selected icon component
  const SelectedIconComponent = selectedIcon ? iconMap[selectedIcon] : null;

  return (
    <div className={`relative ${className}`}>
      {/* Icon Picker Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white hover:bg-gray-600 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors flex items-center justify-center min-h-[40px] sm:min-h-[44px] touch-manipulation"
      >
        {SelectedIconComponent ? (
          <div className="flex items-center gap-2">
            <SelectedIconComponent className="w-4 h-4" />
            <span className="text-sm">Change Icon</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Select Icon</span>
        )}
      </button>

      {/* Icon Picker Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 max-h-80 sm:max-h-96 overflow-hidden">
          {/* Category Tabs */}
          <div className="border-b border-gray-600 p-2">
            <div className="flex flex-wrap gap-1">
              {Object.keys(iconCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 py-1 text-xs sm:text-sm rounded transition-colors touch-manipulation ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Grid */}
          <div className="p-3 max-h-60 sm:max-h-72 overflow-y-auto">
            {/* Clear Icon Option */}
            <div className="mb-3">
              <button
                onClick={clearIcon}
                className="w-full px-2 py-2 text-left text-sm text-gray-400 hover:bg-gray-700 active:bg-gray-600 rounded transition-colors touch-manipulation"
              >
                No Icon
              </button>
            </div>

            {/* Icons Grid - Responsive columns */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
              {iconCategories[selectedCategory as keyof typeof iconCategories].map((IconComponent, index) => {
                const iconName = Object.keys(iconMap).find(
                  key => iconMap[key] === IconComponent
                );
                
                if (!iconName) return null;

                const isSelected = selectedIcon === iconName;

                return (
                  <button
                    key={`${selectedCategory}-${index}`}
                    onClick={() => handleIconSelect(iconName)}
                    className={`p-2 sm:p-3 rounded hover:bg-gray-700 active:bg-gray-600 transition-colors flex items-center justify-center touch-manipulation min-h-[40px] sm:min-h-[44px] ${
                      isSelected ? 'bg-blue-600 text-white' : 'text-gray-300'
                    }`}
                    title={iconName}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Utility function to render an icon by name
export const renderIcon = (iconName: string | null, className: string = 'w-4 h-4') => {
  if (!iconName || !iconMap[iconName]) return null;
  
  const IconComponent = iconMap[iconName];
  return <IconComponent className={className} />;
};

export default IconPicker;
