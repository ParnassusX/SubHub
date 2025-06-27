import React, { useState } from 'react'
import { Search, HelpCircle, Book, MessageCircle, Mail, ExternalLink, ChevronDown, ChevronRight, Star, Clock, Shield } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I add a new subscription?',
      answer: 'Navigate to the Subscriptions page and click the "Add Subscription" button. Fill in the required details including name, cost, billing cycle, and next payment date.',
      category: 'subscriptions'
    },
    {
      id: '2',
      question: 'Can I organize my subscriptions by category?',
      answer: 'Yes! Use the Categories page to create custom categories and organize your subscriptions. You can assign colors and organize them however you like.',
      category: 'categories'
    },
    {
      id: '3',
      question: 'How do renewal notifications work?',
      answer: 'SubHub automatically tracks your subscription renewal dates and shows upcoming renewals on the Dashboard and dedicated Renewals page.',
      category: 'renewals'
    },
    {
      id: '4',
      question: 'Is my data secure?',
      answer: 'Yes, all your data is stored securely using Supabase with enterprise-grade security, including Row Level Security (RLS) to ensure your data is only accessible to you.',
      category: 'security'
    },
    {
      id: '5',
      question: 'Can I export my subscription data?',
      answer: 'Data export functionality is coming soon. You will be able to export your subscription data in various formats.',
      category: 'data'
    },
    {
      id: '6',
      question: 'How do I cancel a subscription?',
      answer: 'SubHub helps you track subscriptions but doesn\'t directly cancel them. Use the subscription details to find cancellation information for each service.',
      category: 'subscriptions'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book },
    { id: 'subscriptions', name: 'Subscriptions', icon: HelpCircle },
    { id: 'categories', name: 'Categories', icon: Book },
    { id: 'renewals', name: 'Renewals', icon: Clock },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'data', name: 'Data Management', icon: Book }
  ]

  const filteredFAQs = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <div className="flex-1 bg-[#0f1a24] text-white">
      <div className="w-full max-w-full min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 border-b border-[#2e4e6b]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Help & Support</h1>
            <p className="text-gray-400 mt-1">Find answers to common questions and get support</p>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 sm:p-6 border-b border-[#2e4e6b]">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a2332] border border-[#2e4e6b] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Categories Sidebar */}
          <div className="lg:w-64 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-[#2e4e6b]">
            <h3 className="font-semibold text-white mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#1a2332]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{category.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6">
            {/* FAQ Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-[#1a2332] rounded-xl border border-[#2e4e6b] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-[#20364b] transition-colors"
                    >
                      <span className="font-medium text-white">{faq.question}</span>
                      {expandedFAQ === faq.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {expandedFAQ === faq.id && (
                      <div className="px-4 pb-4">
                        <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No results found</h3>
                  <p className="text-gray-400">
                    Try adjusting your search terms or browse different categories
                  </p>
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2e4e6b]">
                <div className="flex items-center gap-3 mb-3">
                  <Book className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Getting Started</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  New to SubHub? Learn the basics of managing your subscriptions.
                </p>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                  View Guide
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2e4e6b]">
                <div className="flex items-center gap-3 mb-3">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Contact Support</h3>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  Can't find what you're looking for? Get in touch with our support team.
                </p>
                <button className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1">
                  Contact Us
                  <Mail className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Feature Status */}
            <div className="bg-[#1a2332] rounded-xl p-4 border border-[#2e4e6b]">
              <h3 className="font-semibold text-white mb-4">Feature Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Subscription Management</span>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Categories & Organization</span>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Renewal Tracking</span>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Analytics & Reports</span>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Data Export</span>
                  <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Mobile App</span>
                  <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded-full">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
