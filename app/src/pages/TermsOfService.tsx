import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, AlertTriangle, Check } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-primary text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to SubHub
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-gray-400">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8">
          {/* Acceptance of Terms */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using SubHub ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the Service.
            </p>
          </section>

          {/* Description of Service */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                SubHub provides a subscription management platform that allows you to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Track and manage your recurring subscriptions</li>
                <li>Monitor spending and analyze subscription costs</li>
                <li>Receive renewal reminders and spending alerts</li>
                <li>Organize subscriptions by category</li>
                <li>Export your subscription data</li>
              </ul>
              <p className="mt-4">
                The Service is provided "as is" and we reserve the right to modify or discontinue features at any time.
              </p>
            </div>
          </section>

          {/* User Account */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">3. User Account</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Account Creation</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You must provide accurate and complete information during registration</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must not share your account credentials with others</li>
                  <li>You must notify us immediately of any unauthorized access</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Account Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You are solely responsible for all activities under your account</li>
                  <li>You agree to use the Service in compliance with all applicable laws</li>
                  <li>You will not use the Service for any illegal or unauthorized purpose</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-green-400" />
              <h2 className="text-2xl font-semibold">4. Acceptable Use Policy</h2>
            </div>
            
            <div className="space-y-4 text-gray-300">
              <p>You agree NOT to:</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Use the Service to violate any laws or regulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Attempt to gain unauthorized access to our systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Transmit malware, viruses, or any harmful code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Interfere with or disrupt the Service or servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Use automated systems to scrape or collect data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Reverse engineer or attempt to extract source code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">✗</span>
                  <span>Resell or redistribute the Service without permission</span>
                </li>
              </ul>
            </div>
          </section>

          {/* User Data and Privacy */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">5. User Data and Privacy</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                Your use of the Service is also governed by our{' '}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </Link>
                , which describes how we collect, use, and protect your data.
              </p>
              <p>
                <strong className="text-white">Data Ownership:</strong> You retain all rights to your subscription data. We do not claim ownership of any content you submit to the Service.
              </p>
              <p>
                <strong className="text-white">Data Backup:</strong> While we perform regular backups, you are responsible for maintaining your own backup copies of important data.
              </p>
            </div>
          </section>

          {/* Subscription Fees */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">6. Fees and Payment</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-white">Current Pricing:</strong> SubHub is currently offered free of charge during beta. We reserve the right to introduce pricing tiers in the future.
              </p>
              <p>
                <strong className="text-white">Future Premium Features:</strong> If we introduce paid plans, you will be notified in advance and given the option to opt in or continue with a free tier.
              </p>
              <p>
                <strong className="text-white">Billing:</strong> Any future charges will be billed in advance on a recurring basis (monthly or yearly).
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                The Service and its original content, features, and functionality are owned by SubHub and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                <strong className="text-white">Open Source:</strong> Portions of SubHub may be released as open source software. Any open source components are subject to their respective licenses.
              </p>
              <p>
                <strong className="text-white">Trademarks:</strong> All trademarks, service marks, and logos displayed on the Service are the property of their respective owners.
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-semibold">8. Disclaimer of Warranties</h2>
            </div>
            <div className="space-y-3 text-gray-300">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties of non-infringement</li>
                <li>Warranties regarding availability, reliability, or accuracy</li>
              </ul>
              <p className="mt-4 text-yellow-300">
                <strong>Important:</strong> SubHub is a tracking tool only. We do not have access to your actual subscription accounts and cannot cancel subscriptions on your behalf. You remain responsible for managing your actual subscriptions with service providers.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SUBHUB SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
              </p>
              <p>
                This includes but is not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Loss of data or subscription information</li>
                <li>Missed renewal payments or late fees</li>
                <li>Errors or inaccuracies in subscription tracking</li>
                <li>Service interruptions or downtime</li>
              </ul>
            </div>
          </section>

          {/* Termination */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-white">By You:</strong> You may terminate your account at any time through the Settings page or by contacting us.
              </p>
              <p>
                <strong className="text-white">By Us:</strong> We reserve the right to suspend or terminate your account if you violate these Terms of Service or engage in behavior harmful to other users or the Service.
              </p>
              <p>
                <strong className="text-white">Effect of Termination:</strong> Upon termination, your right to use the Service will immediately cease. You may request a copy of your data before deletion.
              </p>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes via email or in-app notification. Your continued use of the Service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Governing Law */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-gray-300">
              These Terms shall be governed by and construed in accordance with the laws of the European Union, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be resolved in accordance with EU law.
            </p>
          </section>

          {/* Contact */}
          <section className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-gray-300 mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-300">
              <p>
                <strong className="text-white">Email:</strong>{' '}
                <a href="mailto:legal@subhub.app" className="text-blue-400 hover:text-blue-300">
                  legal@subhub.app
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
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>
            © {new Date().getFullYear()} SubHub. All rights reserved.{' '}
            <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
