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
              <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">
                Benefits
              </a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">
                {t('testimonials', 'Testimonials')}
              </a>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Live Demo
              </button>
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400 mb-16">
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

            {/* Hero Dashboard Preview */}
            <div className="relative max-w-5xl mx-auto">
              <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-gray-400 text-sm">SubHub Dashboard</div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                      <div className="text-blue-400 text-sm mb-1">Monthly Spending</div>
                      <div className="text-2xl font-bold text-white">$247.99</div>
                    </div>
                    <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                      <div className="text-purple-400 text-sm mb-1">Active Subscriptions</div>
                      <div className="text-2xl font-bold text-white">14</div>
                    </div>
                    <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                      <div className="text-green-400 text-sm mb-1">Potential Savings</div>
                      <div className="text-2xl font-bold text-white">$89.97</div>
                    </div>
                  </div>

                  {/* Mock Chart */}
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="text-white font-medium mb-4">Spending Trends</div>
                    <div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded flex items-end justify-between px-4 pb-4">
                      <div className="w-8 bg-blue-500 rounded-t" style={{height: '60%'}}></div>
                      <div className="w-8 bg-blue-500 rounded-t" style={{height: '80%'}}></div>
                      <div className="w-8 bg-blue-500 rounded-t" style={{height: '45%'}}></div>
                      <div className="w-8 bg-blue-500 rounded-t" style={{height: '90%'}}></div>
                      <div className="w-8 bg-blue-500 rounded-t" style={{height: '70%'}}></div>
                      <div className="w-8 bg-blue-500 rounded-t" style={{height: '55%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Live Demo
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Real-time Data
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-background-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How SubHub Works
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Get started in minutes and start saving immediately with our simple 3-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Connect Your Accounts</h3>
              <p className="text-gray-300">
                Securely link your bank accounts and credit cards. We use bank-level encryption to keep your data safe.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">AI Discovers Subscriptions</h3>
              <p className="text-gray-300">
                Our smart AI automatically identifies all your recurring payments and categorizes them for easy management.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Optimize & Save</h3>
              <p className="text-gray-300">
                Get personalized recommendations to cancel unused services and find better deals on the ones you keep.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              onClick={handleGetStarted}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg mx-auto"
            >
              Start Your Free Analysis
              <ArrowRight className="w-5 h-5" />
            </button>
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

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-background-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose SubHub?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of users who have taken control of their subscription spending
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Save Money Automatically</h3>
                  <p className="text-gray-300">Our AI identifies unused subscriptions and suggests cancellations, saving you hundreds per year.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Never Miss a Payment</h3>
                  <p className="text-gray-300">Get smart notifications before renewals so you can decide whether to keep or cancel each service.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Complete Privacy</h3>
                  <p className="text-gray-300">Your financial data is encrypted and secure. We never sell your information or share it with third parties.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Easy Setup</h3>
                  <p className="text-gray-300">Connect your accounts in minutes and start seeing results immediately. No complex setup required.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-gray-700">
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-4">$2,847</div>
                <div className="text-xl text-gray-300 mb-6">Average annual savings</div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">94%</div>
                    <div className="text-sm text-gray-400">User satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">50K+</div>
                    <div className="text-sm text-gray-400">Active users</div>
                  </div>
                </div>
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Saving Today
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-background-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real stories from people who've transformed their subscription management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background-secondary rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "SubHub helped me discover I was paying for 3 streaming services I forgot about. Saved me $47/month!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">SM</span>
                </div>
                <div>
                  <div className="text-white font-medium">Sarah M.</div>
                  <div className="text-gray-400 text-sm">Marketing Manager</div>
                </div>
              </div>
            </div>

            <div className="bg-background-secondary rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The renewal alerts are a game-changer. I can now make informed decisions about what to keep or cancel."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">DJ</span>
                </div>
                <div>
                  <div className="text-white font-medium">David J.</div>
                  <div className="text-gray-400 text-sm">Software Developer</div>
                </div>
              </div>
            </div>

            <div className="bg-background-secondary rounded-xl p-6 border border-gray-700">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Finally have visibility into where my money goes each month. The dashboard is clean and easy to understand."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">AL</span>
                </div>
                <div>
                  <div className="text-white font-medium">Alex L.</div>
                  <div className="text-gray-400 text-sm">Freelance Designer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Take Control of Your Subscriptions?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who are saving money and staying organized with SubHub
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto bg-transparent border border-gray-600 hover:border-gray-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              View Live Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
