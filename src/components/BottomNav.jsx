import { NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, Sun, Settings } from 'lucide-react'

export function BottomNav({ onLogPress }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-warm-border safe-bottom">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        <NavItem to="/" icon={<CalendarDays size={22} />} label="Month" />

        {/* FAB log button */}
        <button
          onClick={onLogPress}
          className="flex flex-col items-center justify-center w-14 h-14 -mt-5 rounded-full bg-primary text-white shadow-soft active:scale-95 transition-transform"
          aria-label="Log chore"
        >
          <span className="text-2xl font-light leading-none">+</span>
        </button>

        <NavItem to="/overview" icon={<Sun size={22} />} label="Today" />
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
