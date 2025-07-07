/**
 * Categories Navigation Test Script
 * Tests the navigation blocking issue with the Categories page
 */

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:5173',
  testAccount: {
    email: 'test@subhub.com',
    password: 'test123456'
  },
  timeout: 10000
};

// Performance monitoring
const performanceMetrics = {
  navigationTimes: [],
  queryTimes: [],
  errors: []
};

// Test functions
async function testCategoriesNavigation() {
  console.log('🧪 Starting Categories Navigation Test...');
  
  try {
    // Open the application
    console.log('📱 Opening application...');
    window.open(TEST_CONFIG.baseUrl, '_blank');
    
    // Wait for page load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Monitor console for errors
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args) => {
      performanceMetrics.errors.push({
        type: 'error',
        message: args.join(' '),
        timestamp: new Date().toISOString()
      });
      originalConsoleError.apply(console, args);
    };
    
    console.warn = (...args) => {
      performanceMetrics.errors.push({
        type: 'warning',
        message: args.join(' '),
        timestamp: new Date().toISOString()
      });
      originalConsoleWarn.apply(console, args);
    };
    
    console.log('✅ Test setup complete');
    console.log('📋 Manual testing steps:');
    console.log('1. Login with test@subhub.com / test123456');
    console.log('2. Navigate to Categories page');
    console.log('3. Observe any blocking or unresponsive behavior');
    console.log('4. Try navigating to other pages after Categories');
    console.log('5. Check browser console for errors');
    
    // Monitor performance
    if (typeof window !== 'undefined' && window.performance) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            performanceMetrics.navigationTimes.push({
              name: entry.name,
              duration: entry.duration,
              timestamp: new Date().toISOString()
            });
          }
        }
      });
      observer.observe({ entryTypes: ['navigation'] });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    performanceMetrics.errors.push({
      type: 'test-error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Export for browser console use
if (typeof window !== 'undefined') {
  window.testCategoriesNavigation = testCategoriesNavigation;
  window.performanceMetrics = performanceMetrics;
  
  // Auto-start test
  console.log('🚀 Categories Navigation Test Script Loaded');
  console.log('Run testCategoriesNavigation() to start the test');
  console.log('Check performanceMetrics for collected data');
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCategoriesNavigation, performanceMetrics };
}
