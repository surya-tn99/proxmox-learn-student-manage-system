import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ErrorBanner, Spinner } from '../components/ui.jsx'

const statCards = [
  { key: 'total_students', label: 'Students', icon: '👥', accent: 'bg-indigo-100 text-indigo-600' },
  { key: 'total_courses', label: 'Courses', icon: '📚', accent: 'bg-emerald-100 text-emerald-600' },
  { key: 'total_grades', label: 'Grades', icon: '📝', accent: 'bg-amber-100 text-amber-600' },
  { key: 'avg_marks', label: 'Average Marks', icon: '📊', accent: 'bg-rose-100 text-rose-600' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        if (user.role === 'admin') {
          const { data } = await api.get('/api/dashboard/stats')
          setStats({ ...data, avg_marks: `${data.avg_marks}%` })
        } else {
          const { data } = await api.get('/api/grades')
          const avg = data.length ? (data.reduce((s, g) => s + g.marks, 0) / data.length).toFixed(2) : 0
          setStats({ total_grades: data.length, avg_marks: `${avg}%` })
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load dashboard')
      }
    }
    load()
  }, [user.role])

  const cards =
    user.role === 'admin'
      ? statCards
      : [
          { key: 'total_grades', label: 'My Grades', icon: '📝', accent: 'bg-amber-100 text-amber-600' },
          { key: 'avg_marks', label: 'My Average', icon: '📊', accent: 'bg-rose-100 text-rose-600' },
        ]

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900" data-testid="dashboard-title">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Welcome back, <span className="font-medium text-gray-700">{user.username}</span>
        {user.role === 'student' && ' — here is your academic overview.'}
      </p>

      {error && <ErrorBanner message={error} />}

      {!stats && !error && <Spinner />}

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards
            .filter((c) => stats[c.key] !== undefined)
            .map((card) => (
              <div
                key={card.key}
                data-testid={`stat-${card.key}`}
                className="rounded-xl bg-white p-5 shadow-sm"
              >
                <div className={`mb-3 inline-grid h-10 w-10 place-items-center rounded-lg text-xl ${card.accent}`}>
                  {card.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats[card.key]}</div>
                <div className="text-sm text-gray-500">{card.label}</div>
              </div>
            ))}
        </div>
      )}

      {user.role === 'student' && (
        <div className="mt-8 rounded-xl bg-indigo-600 p-6 text-white">
          <h2 className="text-lg font-semibold">Your Grades</h2>
          <p className="mt-1 text-sm text-indigo-100">
            View all your course grades and track your performance.
          </p>
          <Link
            to="/my-grades"
            className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Go to My Grades →
          </Link>
        </div>
      )}
    </main>
  )
}