import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const links = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'student'] },
  { to: '/students', label: 'Students', roles: ['admin'] },
  { to: '/courses', label: 'Courses', roles: ['admin'] },
  { to: '/grades', label: 'Grades', roles: ['admin'] },
  { to: '/my-grades', label: 'My Grades', roles: ['student'] },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const visible = links.filter((l) => l.roles.includes(user.role))

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500 text-sm">🎓</span>
          Student Manager
        </NavLink>
        <div className="flex items-center gap-1">
          {visible.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm font-medium ${
                  isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">
            {user.username} <span className="rounded bg-slate-700 px-1.5 py-0.5 text-xs uppercase">{user.role}</span>
          </span>
          <button
            onClick={logout}
            className="rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}