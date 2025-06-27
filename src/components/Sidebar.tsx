import { Link, useLocation } from 'react-router-dom'
import { cn } from '../utils/cn'
import {
  Home,
  Plus,
  FileText,
  BarChart3,
  Tag,
  Bell,
  Settings,
  Download,
  Gift,
  CreditCard,
  HelpCircle,
  Mail,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/app/dashboard', icon: Home },
  { name: 'Add Subscriptions', href: '/app/add-subscriptions', icon: Plus },
  { name: 'Subscription Details', href: '/app/subscription-details', icon: FileText },
  { name: 'Reports', href: '/app/reports', icon: BarChart3 },
  { name: 'Categories', href: '/app/categories', icon: Tag },
  { name: 'Notifications', href: '/app/notifications', icon: Bell },
  { name: 'Settings', href: '/app/settings', icon: Settings },
  { name: 'Import/Export', href: '/app/import-export', icon: Download },
  { name: 'Offers', href: '/app/offers', icon: Gift },
  { name: 'Plans', href: '/app/plans', icon: CreditCard },
  { name: 'Help', href: '/app/help', icon: HelpCircle },
  { name: 'Contact', href: '/app/contact', icon: Mail },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-foreground">SubHub</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href || 
            (item.href === '/app/dashboard' && location.pathname === '/app')
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
