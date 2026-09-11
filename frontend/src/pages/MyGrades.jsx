import { useEffect, useState } from 'react'
import api from '../api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { EmptyState, ErrorBanner, Spinner } from '../components/ui.jsx'

const gradeColors = {
  A: 'bg-emerald-100 text-emerald-700',
  B: 'bg-lime-100 text-lime-700',
  C: 'bg-amber-100 text-amber-700',
  D: 'bg-orange-100 text-orange-700',
  F: 'bg-red-100 text-red-700',
}

export default function MyGrades() {
  const { user } = useAuth()
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/grades')
        setGrades(data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load grades')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const avg = grades.length ? (grades.reduce((s, g) => s + g.marks, 0) / grades.length).toFixed(2) : 0

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900" data-testid="mygrades-title">
        My Grades
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {grades.length} courses · average <span className="font-semibold text-gray-700">{avg}%</span>
      </p>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner />}

      {!loading && !error && grades.length === 0 && <EmptyState label="No grades assigned yet." />}

      {!loading && grades.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm" data-testid="mygrades-table">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grades.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{g.course_name ?? `#${g.course_id}`}</td>
                  <td className="px-4 py-3 text-gray-900">{g.marks}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${gradeColors[g.grade] ?? 'bg-gray-100 text-gray-700'}`}>
                      {g.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {user && (
        <p className="mt-6 text-xs text-gray-400">Logged in as {user.username} — read-only view.</p>
      )}
    </main>
  )
}