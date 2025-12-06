import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'false');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn" />

      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slideUp">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-6 shadow-2xl border border-gray-700">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-2">
                  🍪 We Value Your Privacy
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  We use essential cookies and local storage to keep you logged in and remember your preferences. 
                  We do <strong className="text-white">NOT</strong> use tracking or advertising cookies. 
                  By continuing, you agree to our use of essential cookies.
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAccept}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
                    >
                      Accept
                    </button>
                    <button
                      onClick={handleDecline}
                      className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Decline
                    </button>
                  </div>

                  {/* Links */}
                  <div className="flex gap-4 text-sm">
                    <Link 
                      to="/privacy" 
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <Link 
                      to="/terms" 
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Terms
                    </Link>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDecline}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(100%); 
          }
          to { 
            opacity: 1;
            transform: translateY(0); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default CookieConsent;
