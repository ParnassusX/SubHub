import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/Button'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Welcome back!
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your subscriptions efficiently
          </p>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span className="text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
