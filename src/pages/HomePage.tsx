import { Link } from 'react-router-dom'

const pages = [
  { name: 'Landing Page', href: '/landing', icon: '🏠', description: 'Marketing homepage with features and benefits' },
  { name: 'Dashboard', href: '/app/dashboard', icon: '📊', description: 'Main interface with subscription overview and calendar' },
  { name: 'Add Subscriptions', href: '/app/add-subscriptions', icon: '➕', description: 'Form to add new subscription services' },
  { name: 'Subscription Details', href: '/app/subscription-details', icon: '📋', description: 'Detailed view and management of individual subscriptions' },
  { name: 'Reports', href: '/app/reports', icon: '📈', description: 'Analytics and spending reports' },
  { name: 'Categories', href: '/app/categories', icon: '🏷️', description: 'Organize subscriptions by category' },
  { name: 'Notifications', href: '/app/notifications', icon: '🔔', description: 'Manage alerts and reminders' },
  { name: 'Settings', href: '/app/settings', icon: '⚙️', description: 'User preferences and configuration' },
  { name: 'Import/Export', href: '/app/import-export', icon: '💾', description: 'Data management and backup' },
  { name: 'Offers', href: '/app/offers', icon: '🎁', description: 'Special deals and promotions' },
  { name: 'Plans', href: '/app/plans', icon: '💳', description: 'Pricing plans and tiers' },
  { name: 'Help', href: '/app/help', icon: '❓', description: 'Documentation and FAQ' },
  { name: 'Contact', href: '/app/contact', icon: '📧', description: 'Support and contact information' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-10 py-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">SubHub</h1>
          <span className="text-sm text-muted-foreground ml-2">Subscription Management System</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-10 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Welcome to SubHub</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive subscription management tool. Navigate through the different sections below to explore all features.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pages.map((page) => (
            <Link
              key={page.name}
              to={page.href}
              className="page-card block bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">{page.icon}</span>
                </div>
                <h3 className="text-lg font-semibold">{page.name}</h3>
              </div>
              <p className="text-muted-foreground text-sm">{page.description}</p>
            </Link>
          ))}
        </div>

        {/* Development Info */}
        <div className="mt-16 text-center">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-3">🚀 Modern React Application</h3>
            <p className="text-muted-foreground text-sm">
              This is now a modern React application with TypeScript, TailwindCSS, and Supabase integration.
              All animations and modern development features are working properly.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-10 text-center text-muted-foreground">
          <p>&copy; 2024 SubHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
