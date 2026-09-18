import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/resume', label: 'Resume Gap' },
  { to: '/interview', label: 'Interview Prep' },
  { to: '/roadmap', label: 'Roadmap' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="flex h-[72px] items-center justify-between border-b border-border bg-surface px-6 sm:px-12">
        <NavLink to="/" className="flex items-center gap-2.5">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0E7490"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 16.9 6.2 19.9l1.1-6.5-4.7-4.6 6.5-.9L12 2z" />
          </svg>
          <span className="font-heading text-lg font-bold text-text">Career Agent</span>
        </NavLink>
        <nav className="flex items-center gap-9">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `text-sm ${isActive ? 'font-semibold text-accent' : 'font-medium text-text-secondary hover:text-text'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
