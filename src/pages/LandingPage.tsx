import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-10 py-6">
        <div className="flex items-center justify-between">
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
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            <Link to="/app">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-10 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold mb-6">
            Take Control of Your
            <span className="text-primary"> Subscriptions</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Never lose track of your recurring payments again. SubHub helps you manage, 
            monitor, and optimize all your subscription services in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/app">
              <Button size="lg" className="text-lg px-8 py-4">
                Start Managing Now
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Everything</h3>
            <p className="text-muted-foreground">
              Monitor all your subscriptions, billing cycles, and spending patterns in one dashboard.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔔</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Never Miss a Payment</h3>
            <p className="text-muted-foreground">
              Get timely reminders before renewals and avoid unwanted charges.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Save Money</h3>
            <p className="text-muted-foreground">
              Identify unused subscriptions and optimize your spending with detailed analytics.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
