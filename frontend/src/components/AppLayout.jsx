import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import { Building2, Heart, KeyRound, Landmark, LayoutDashboard, LogOut } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/listings', label: 'Listings', icon: Building2 },
  { to: '/saved', label: 'Saved', icon: Heart },
  { to: '/rentals', label: 'Rentals', icon: KeyRound },
  { to: '/projects', label: 'Projects', icon: Landmark },
]

export function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-card px-4">
        <p className="font-serif text-xl font-bold tracking-tight text-primary">Ivy Homes</p>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted-foreground sm:inline">{user?.email}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut />
            Log out
          </Button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-56 shrink-0 border-r bg-sidebar text-sidebar-foreground md:flex md:flex-col">
          <nav className="flex flex-col gap-1 p-3">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/70',
                  )
                }
              >
                <Icon className="size-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6">
          <nav className="mb-4 flex gap-2 overflow-auto md:hidden">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full border px-3 py-1 text-sm whitespace-nowrap',
                    isActive ? 'border-primary bg-primary text-primary-foreground' : 'bg-card',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
