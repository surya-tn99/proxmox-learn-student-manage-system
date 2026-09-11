import { useCallback, useEffect, useState } from 'react'
import api from '../api.js'
import Modal from '../components/Modal.jsx'
import { EmptyState, ErrorBanner, Spinner } from '../components/ui.jsx'

const emptyForm = { name: '', code: '', description: '', credits: 3 }

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/courses')
      setCourses(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (course) => {
    setEditing(course)
    setForm({
      name: course.name,
      code: course.code,
      description: course.description ?? '',
      credits: course.credits,
    })
    setModalOpen(true)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = { ...form, description: form.description || null }
    try {
      if (editing) {
        await api.put(`/api/courses/${editing.id}`, payload)
      } else {
        await api.post('/api/courses', payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save course')
    }
  }

  const onDelete = async (course) => {
    if (!window.confirm(`Delete course "${course.name}"?`)) return
    try {
      await api.delete(`/api/courses/${course.id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete course')
    }
  }

  const field = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="courses-title">
            Courses
          </h1>
          <p className="mt-1 text-sm text-gray-500">{courses.length} offered</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Course
        </button>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner />}

      {!loading && !error && courses.length === 0 && <EmptyState label="No courses yet." />}

      {!loading && courses.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm" data-testid="courses-table">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Credits</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{c.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.description ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.credits}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(c)}
                      className="mr-2 rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(c)}
                      className="rounded-md bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit Course' : 'Add Course'} onClose={() => setModalOpen(false)}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="course-code">Code</label>
            <input id="course-code" data-testid="course-code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className={field} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="course-name">Name</label>
            <input id="course-name" data-testid="course-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="course-desc">Description</label>
            <textarea id="course-desc" data-testid="course-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={field} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="course-credits">Credits</label>
            <input id="course-credits" data-testid="course-credits" type="number" min={1} max={10} required value={form.credits} onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })} className={field} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              {editing ? 'Save Changes' : 'Add Course'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  )
}