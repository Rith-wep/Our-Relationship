import {
  CalendarDays,
  Heart,
  House,
  Images,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, useLocation } from 'react-router'

interface NavigationItem {
  label: string
  path: string
  icon: LucideIcon
  end?: boolean
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', path: '/', icon: House, end: true },
  { label: 'Timeline', path: '/timeline', icon: CalendarDays },
  { label: 'Memories', path: '/memories', icon: Images },
  { label: 'Letters', path: '/letters', icon: Heart },
  { label: 'Us', path: '/us', icon: UserRound },
]

export function BottomNavigation() {
  const location = useLocation()
  const activeIndex = Math.max(
    0,
    navigationItems.findIndex((item) =>
      item.end
        ? location.pathname === item.path
        : location.pathname.startsWith(item.path),
    ),
  )

  return (
    <nav
      aria-label="Primary navigation"
      className="absolute inset-x-0 bottom-0 z-20 border-t border-border bg-card pb-nav-safe"
    >
      <ul className="relative mx-auto grid h-16 max-w-content grid-cols-5 px-1">
        <li
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1 top-1.5 h-9"
        >
          <span
            className="absolute left-0 flex h-9 w-1/5 justify-center transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          >
            <span className="h-9 w-11 rounded-full bg-primary-soft" />
          </span>
        </li>
        {navigationItems.map(({ label, path, icon: Icon, end }) => (
          <li key={path} className="min-w-0">
            <NavLink
              to={path}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                [
                  'group relative isolate flex h-full min-h-11 w-full flex-col items-center justify-center gap-1 rounded-xl px-1',
                  'text-text-muted transition-colors duration-150 ease-out motion-reduce:transition-none',
                  isActive ? 'text-primary' : 'hover:text-text-secondary',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    aria-hidden="true"
                    strokeWidth={isActive ? 2.25 : 1.9}
                    className={[
                      'relative z-10 size-[23px] transition-transform duration-150 group-active:scale-95 motion-reduce:transition-none',
                      isActive ? 'text-[#ff69b4]' : '',
                    ].join(' ')}
                  />
                  <span
                    className={`relative z-10 truncate text-[11px] leading-none font-medium ${isActive ? 'text-[#ff69b4]' : ''}`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
