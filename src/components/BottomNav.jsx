import { NavLink } from 'react-router-dom'
import { CalendarDays, Sun, Settings, Plus } from 'lucide-react'

export function BottomNav({ onLogPress }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-warm-border safe-bottom">
      <div className="relative flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        <NavItem to="/" icon={<CalendarDays size={22} />} label="Month" />
        <NavItem to="/overview" icon={<Sun size={22} />} label="Today" />

        {/* Elevated center FAB — sits above the bar */}
        <button
          onClick={onLogPress}
          className="absolute left-1/2 -translate-x-1/2 -top-7 w-14 h-14 rounded-full bg-primary text-white shadow-soft flex items-center justify-center active:scale-95 transition-transform ring-4 ring-white"
          aria-label="Log chore"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>

        {/* Ghost spacer keeps the two nav items symmetrical */}
        <div className="w-14" />

        <NavItem to="/manage" icon={<Settings size={22} />} label="Manage" />
      </div>
    </nav>
  )
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-xl transition-colors ${
          isActive ? 'text-primary' : 'text-warm-gray'
        }`
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  )
}
