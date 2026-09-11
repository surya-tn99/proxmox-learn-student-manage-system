import { useCallback, useEffect, useState } from 'react'
import api from '../api.js'
import Modal from '../components/Modal.jsx'
import { EmptyState, ErrorBanner, Spinner } from '../components/ui.jsx'

const emptyForm = { name: '', email: '', phone: '', enrollment_date: '' }

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/students', { params: search ? { q: search } : {} })
      setStudents(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const timer = setTimeout(load, 200)
    return () => clearTimeout(timer)
  }, [load])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (student) => {
    setEditing(student)
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone ?? '',
      enrollment_date: student.enrollment_date ?? '',
    })
    setModalOpen(true)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const coursePayload = { ...form, enrollment_date: form.enrollment_date || null }
      if (editing) {
        await api.put(`/api/students/${editing.id}`, coursePayload)
      } else {
        await api.post('/api/students', coursePayload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save student')
    }
  }

  const onDelete = async (student) => {
    if (!window.confirm(`Delete student "${student.name}"?`)) return
    try {
      await api.delete(`/api/students/${student.id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete student')
    }
  }

  const field = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="students-title">
            Students
          </h1>
          <p className="mt-1 text-sm text-gray-500">{students.length} registered</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Add Student
        </button>
      </div>

      <input
        data-testid="student-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email…"
        className="mt-4 w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner />}

      {!loading && !error && students.length === 0 && <EmptyState label="No students found." />}

      {!loading && students.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm" data-testid="students-table">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Enrolled</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{s.enrollment_date ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(s)}
                      className="mr-2 rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(s)}
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

      <Modal open={modalOpen} title={editing ? 'Edit Student' : 'Add Student'} onClose={() => setModalOpen(false)}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="name">Name</label>
            <input id="name" data-testid="student-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            <input id="email" data-testid="student-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="phone">Phone</label>
            <input id="phone" data-testid="student-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={field} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="enrollment_date">Enrollment Date</label>
            <input id="enrollment_date" data-testid="student-enrollment" type="date" value={form.enrollment_date} onChange={(e) => setForm({ ...form, enrollment_date: e.target.value })} className={field} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              {editing ? 'Save Changes' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  )
}