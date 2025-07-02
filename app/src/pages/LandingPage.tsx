// Landing Page for SubHub - Conversion Optimized Marketing Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Bell,
  BarChart3,
  Zap,
  TrendingUp,
  Calendar,
  PieChart,
  Smartphone
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useCurrency } from '../hooks/useCurrency';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { formatPrice: _formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background-primary text-white" style={{fontFamily: 'Epilogue, "Noto Sans", sans-serif'}}>
      {/* Navigation Header */}
      <nav className="relative z-50 bg-background-primary/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-white">SubHub</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                {t('features', 'Features')}
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                {t('pricing', 'Pricing')}
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
                {t('testimonials', 'Testimonials')}
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSignIn}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {t('signIn', 'Sign In')}
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {t('getStarted', 'Get Started')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-background-primary to-purple-900/20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Hero Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-700 rounded-full px-4 py-2 mb-8">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">
                {t('heroTag', 'Save $200-400 per year on unused subscriptions')}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {t('heroTitle1', 'Take Control of Your')}
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {t('heroTitle2', 'Subscriptions')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('heroSubtitle', 'Stop wasting money on forgotten subscriptions. SubHub helps you track, manage, and optimize all your recurring payments with intelligent insights.')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
              >
                {t('startFree', 'Start Free Today')}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto border border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                {t('watchDemo', 'Watch Demo')}
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('freeForever', 'Free forever')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('noCredit', 'No credit card required')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{t('setup', '2-minute setup')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('valueTitle', 'Why SubHub Users Save Money')}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('valueSubtitle', 'Our intelligent system helps you identify and eliminate subscription waste automatically')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Stat 1 */}
            <div className="text-center bg-background-tertiary rounded-xl p-8 border border-gray-700">
              <div className="text-4xl font-bold text-blue-400 mb-2">$347</div>
              <div className="text-gray-300 mb-2">{t('avgSavings', 'Average Annual Savings')}</div>
              <div className="text-sm text-gray-400">{t('avgSavingsDesc', 'From cancelled unused subscriptions')}</div>
            </div>

            {/* Stat 2 */}
            <div className="text-center bg-background-tertiary rounded-xl p-8 border border-gray-700">
              <div className="text-4xl font-bold text-green-400 mb-2">73%</div>
              <div className="text-gray-300 mb-2">{t('usersReduce', 'Users Reduce Spending')}</div>
              <div className="text-sm text-gray-400">{t('usersReduceDesc', 'Within first 30 days')}</div>
            </div>

            {/* Stat 3 */}
            <div className="text-center bg-background-tertiary rounded-xl p-8 border border-gray-700">
              <div className="text-4xl font-bold text-purple-400 mb-2">2.3</div>
              <div className="text-gray-300 mb-2">{t('avgUnused', 'Unused Subscriptions')}</div>
              <div className="text-sm text-gray-400">{t('avgUnusedDesc', 'Found per user on average')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('featuresTitle', 'Everything You Need to Manage Subscriptions')}
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('featuresSubtitle', 'Powerful features designed to help you save money and stay organized')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-background-secondary rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('smartTracking', 'Smart Tracking')}</h3>
              <p className="text-gray-300">
                {t('smartTrackingDesc', 'Automatically categorize and track all your subscriptions with intelligent spending insights')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-background-secondary rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('smartReminders', 'Smart Reminders')}</h3>
              <p className="text-gray-300">
                {t('smartRemindersDesc', 'Never miss a renewal with intelligent notifications that respect your schedule')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-background-secondary rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('unusedDetection', 'Unused Detection')}</h3>
              <p className="text-gray-300">
                {t('unusedDetectionDesc', 'AI-powered analysis identifies subscriptions you\'re not using to maximize savings')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-background-secondary rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('budgetManagement', 'Budget Management')}</h3>
              <p className="text-gray-300">
                {t('budgetManagementDesc', 'Set spending limits and get alerts when approaching your budget thresholds')}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-background-secondary rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('renewalCalendar', 'Renewal Calendar')}</h3>
              <p className="text-gray-300">
                {t('renewalCalendarDesc', 'Visual calendar view of all upcoming renewals and payment dates')}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-background-secondary rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-colors">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('mobileFirst', 'Mobile First')}</h3>
              <p className="text-gray-300">
                {t('mobileFirstDesc', 'Responsive design that works perfectly on all devices with PWA support')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
