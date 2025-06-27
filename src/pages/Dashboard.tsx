import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CreditCard, TrendingUp, Calendar, Bell } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    monthlySpending: 0,
    upcomingRenewals: 0,
    notifications: 0
  })

  // Coming Soon - Real data integration
  useEffect(() => {
    setStats({
      totalSubscriptions: 0,
      monthlySpending: 0,
      upcomingRenewals: 0,
      notifications: 0
    })
  }, [])

  const statCards = [
    {
      title: 'Active Subscriptions',
      value: stats.totalSubscriptions,
      icon: CreditCard,
      color: 'text-blue-500'
    },
    {
      title: 'Monthly Spending',
      value: `$${stats.monthlySpending}`,
      icon: TrendingUp,
      color: 'text-green-500'
    },
    {
      title: 'Upcoming Renewals',
      value: stats.upcomingRenewals,
      icon: Calendar,
      color: 'text-orange-500'
    },
    {
      title: 'Notifications',
      value: stats.notifications,
      icon: Bell,
      color: 'text-red-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of your subscription management.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-orange-500 mt-1">Coming Soon</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4">Recent Subscriptions</h3>
          <div className="space-y-3">
            {[
              { name: 'Netflix', amount: '$15.99', date: '2 days ago' },
              { name: 'Spotify', amount: '$9.99', date: '1 week ago' },
              { name: 'Adobe Creative', amount: '$52.99', date: '2 weeks ago' }
            ].map((sub, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{sub.name}</p>
                  <p className="text-sm text-muted-foreground">{sub.date}</p>
                </div>
                <p className="font-semibold">{sub.amount}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold mb-4">Upcoming Renewals</h3>
          <div className="space-y-3">
            {[
              { name: 'Dropbox', amount: '$11.99', date: 'Tomorrow' },
              { name: 'GitHub Pro', amount: '$4.00', date: 'In 3 days' },
              { name: 'Figma', amount: '$12.00', date: 'In 5 days' }
            ].map((renewal, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{renewal.name}</p>
                  <p className="text-sm text-muted-foreground">{renewal.date}</p>
                </div>
                <p className="font-semibold">{renewal.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left">
            <CreditCard className="w-6 h-6 mb-2 text-primary" />
            <p className="font-medium">Add Subscription</p>
            <p className="text-sm text-muted-foreground">Track a new service</p>
          </button>
          <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left">
            <TrendingUp className="w-6 h-6 mb-2 text-primary" />
            <p className="font-medium">View Analytics</p>
            <p className="text-sm text-muted-foreground">See spending trends</p>
          </button>
          <button className="p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left">
            <Calendar className="w-6 h-6 mb-2 text-primary" />
            <p className="font-medium">Calendar View</p>
            <p className="text-sm text-muted-foreground">See billing dates</p>
          </button>
        </div>
      </div>
    </div>
  )
}
