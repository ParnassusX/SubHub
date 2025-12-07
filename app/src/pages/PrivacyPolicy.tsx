import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Database, Users, Mail, FileText } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-primary text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to SubHub
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-gray-400">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              At SubHub, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our subscription management platform. Please read this policy carefully.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold">Information We Collect</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address (for authentication and communications)</li>
                  <li>Name (optional, if provided)</li>
                  <li>Password (encrypted and never stored in plain text)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Subscription Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Subscription names, costs, and billing frequencies</li>
                  <li>Service categories and descriptions</li>
                  <li>Start dates and renewal dates</li>
                  <li>Website URLs (if provided)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Usage Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Device information and browser type</li>
                  <li>IP address and general location</li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Error logs and performance data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
            </div>
            
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>To provide and maintain the SubHub service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>To notify you about subscription renewals and spending alerts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>To analyze usage patterns and improve our service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>To communicate with you about updates and features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>To protect against unauthorized access and security threats</span>
              </li>
            </ul>
          </section>

          {/* Data Storage & Security */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-semibold">Data Storage & Security</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p>
                Your data is stored securely using <strong className="text-white">Supabase</strong>, a trusted PostgreSQL database platform with enterprise-grade security:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Encryption:</strong> All data is encrypted in transit (HTTPS) and at rest</li>
                <li><strong className="text-white">EU Data Residency:</strong> Your data is stored in EU servers for GDPR compliance</li>
                <li><strong className="text-white">Row Level Security:</strong> Database policies ensure users can only access their own data</li>
                <li><strong className="text-white">Regular Backups:</strong> Automatic daily backups to prevent data loss</li>
                <li><strong className="text-white">Access Controls:</strong> Strict authentication and authorization mechanisms</li>
              </ul>
            </div>
          </section>

          {/* Your Rights (GDPR) */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-semibold">Your Rights (GDPR Compliant)</h2>
            </div>
            
            <p className="text-gray-300 mb-4">
              Under GDPR and other privacy laws, you have the following rights:
            </p>
            
            <div className="grid gap-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">→</span>
                <div>
                  <strong className="text-white">Right to Access:</strong> Request a copy of your personal data
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">→</span>
                <div>
                  <strong className="text-white">Right to Rectification:</strong> Correct inaccurate or incomplete data
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">→</span>
                <div>
                  <strong className="text-white">Right to Erasure:</strong> Request deletion of your personal data
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">→</span>
                <div>
                  <strong className="text-white">Right to Data Portability:</strong> Export your data in JSON/CSV format
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold">→</span>
                <div>
                  <strong className="text-white">Right to Object:</strong> Opt out of certain data processing activities
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-purple-900/20 border border-purple-600 rounded-lg">
              <p className="text-sm text-gray-300">
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:privacy@subhub.app" className="text-purple-400 hover:text-purple-300">
                  privacy@subhub.app
                </a>
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Cookies & Tracking</h2>
            <div className="space-y-3 text-gray-300">
              <p>We use minimal cookies and local storage for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Authentication:</strong> To keep you logged in securely</li>
                <li><strong className="text-white">Preferences:</strong> To remember your currency and language settings</li>
                <li><strong className="text-white">Performance:</strong> To cache data for faster loading</li>
              </ul>
              <p className="mt-4">
                We do <strong className="text-white">NOT</strong> use third-party advertising or tracking cookies.
              </p>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Data Sharing & Third Parties</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                We do <strong className="text-white">NOT sell or rent</strong> your personal information to third parties.
              </p>
              <p>We only share data with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Supabase:</strong> Our database and authentication provider</li>
                <li><strong className="text-white">Logo Services:</strong> Clearbit, Google Favicon (for service logos - no personal data)</li>
                <li><strong className="text-white">Email Service:</strong> For transactional emails (if you opt in to notifications)</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold">Contact Us</h2>
            </div>
            <p className="text-gray-300 mb-4">
              If you have questions or concerns about this Privacy Policy, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p>
                <strong className="text-white">Email:</strong>{' '}
                <a href="mailto:privacy@subhub.app" className="text-blue-400 hover:text-blue-300">
                  privacy@subhub.app
                </a>
              </p>
              <p>
                <strong className="text-white">GitHub:</strong>{' '}
                <a 
                  href="https://github.com/ParnassusX/SubHub" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  github.com/ParnassusX/SubHub
                </a>
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>
            © {new Date().getFullYear()} SubHub. All rights reserved.{' '}
            <Link to="/terms" className="text-blue-400 hover:text-blue-300">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
