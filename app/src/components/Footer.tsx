import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Mail, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-white font-bold text-lg mb-3">SubHub</h3>
            <p className="text-gray-400 text-sm mb-4">
              Smart subscription management for the modern age. Track, optimize, and save.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>for subscribers</span>
            </div>
          </div>

          {/* Product */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/subscriptions" className="text-gray-400 hover:text-white transition-colors">
                  Subscriptions
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="text-gray-400 hover:text-white transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link to="/settings?tab=subscription" className="text-gray-400 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Settings
                </a>
              </li>
              <li>
                <a href="mailto:legal@subhub.app" className="text-gray-400 hover:text-white transition-colors">
                  GDPR Requests
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="col-span-1">
            <h4 className="text-white font-semibold mb-3">Connect</h4>
            <ul className="space-y-2 text-sm mb-4">
              <li>
                <a 
                  href="https://github.com/ParnassusX/SubHub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@subhub.app" 
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Support
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/subhubapp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {currentYear} SubHub. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span>Version 1.0.0</span>
              <span>•</span>
              <a 
                href="https://github.com/ParnassusX/SubHub/releases" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                What's New
              </a>
              <span>•</span>
              <Link to="/help" className="hover:text-white transition-colors">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
