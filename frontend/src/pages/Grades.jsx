import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '../api.js'
import Modal from '../components/Modal.jsx'
import { EmptyState, ErrorBanner, Spinner } from '../components/ui.jsx'

function letterFromMarks(m) {
  if (m >= 90) return 'A'
  if (m >= 80) return 'B'
  if (m >= 70) return 'C'
  if (m >= 60) return 'D'
  return 'F'
}

const emptyForm = { student_id: '', course_id: '', marks: '' }

export default function Grades() {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [grades, setGrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStudent, setFilterStudent] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [g, s, c] = await Promise.all([
        api.get('/api/grades'),
        api.get('/api/students'),
        api.get('/api/courses'),
      ])
      setGrades(g.data)
      setStudents(s.data)
      setCourses(c.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load grades')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const studentById = useMemo(() => Object.fromEntries(students.map((s) => [s.id, s])), [students])
  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses])

  const filtered = useMemo(() => {
    return grades.filter(
      (g) =>
        (!filterStudent || g.student_id === Number(filterStudent)) &&
        (!filterCourse || g.course_id === Number(filterCourse)),
    )
  }, [grades, filterStudent, filterCourse])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (grade) => {
    setEditing(grade)
    setForm({ student_id: grade.student_id, course_id: grade.course_id, marks: grade.marks })
    setModalOpen(true)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      student_id: Number(form.student_id),
      course_id: Number(form.course_id),
      marks: Number(form.marks),
      grade: letterFromMarks(Number(form.marks)),
    }
    try {
      if (editing) {
        await api.put(`/api/grades/${editing.id}`, payload)
      } else {
        await api.post('/api/grades', payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save grade')
    }
  }

  const onDelete = async (grade) => {
    if (!window.confirm('Delete this grade?')) return
    try {
      await api.delete(`/api/grades/${grade.id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete grade')
    }
  }

  const select = 'rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
  const gradeBadge = (g) => {
    const colors = { A: 'bg-emerald-100 text-emerald-700', B: 'bg-lime-100 text-lime-700', C: 'bg-amber-100 text-amber-700', D: 'bg-orange-100 text-orange-700', F: 'bg-red-100 text-red-700' }
    return (
      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${colors[g] ?? 'bg-gray-100 text-gray-700'}`}>
        {g}
      </span>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="grades-title">
            Grades
          </h1>
          <p className="mt-1 text-sm text-gray-500">{grades.length} records</p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Assign Grade
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <select data-testid="filter-student" value={filterStudent} onChange={(e) => setFilterStudent(e.target.value)} className={`${select} w-56`}>
          <option value="">All students</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select data-testid="filter-course" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className={`${select} w-56`}>
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner />}

      {!loading && !error && filtered.length === 0 && <EmptyState label="No grades match the filters." />}

      {!loading && filtered.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm" data-testid="grades-table">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((g) => (
                <tr key={g.id} data-testid={`grade-row-${g.id}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{studentById[g.student_id]?.name ?? `#${g.student_id}`}</td>
                  <td className="px-4 py-3 text-gray-600">{courseById[g.course_id]?.name ?? `#${g.course_id}`}</td>
                  <td className="px-4 py-3 text-gray-900">{g.marks}</td>
                  <td className="px-4 py-3">{gradeBadge(g.grade)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(g)} className="mr-2 rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200">
                      Edit
                    </button>
                    <button onClick={() => onDelete(g)} className="rounded-md bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} title={editing ? 'Edit Grade' : 'Assign Grade'} onClose={() => setModalOpen(false)}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="grade-student">Student</label>
            <select id="grade-student" data-testid="grade-student" required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} className={select}>
              <option value="" disabled>Select student…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="grade-course">Course</label>
            <select id="grade-course" data-testid="grade-course" required value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className={select}>
              <option value="" disabled>Select course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="grade-marks">Marks (0–100)</label>
            <input id="grade-marks" data-testid="grade-marks" type="number" min={0} max={100} required value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} className={select} />
            <div className="mt-2 text-sm text-gray-500">
              Letter grade:{' '}
              <span className="font-semibold text-indigo-600">{form.marks !== '' ? letterFromMarks(Number(form.marks)) : '—'}</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              {editing ? 'Save Changes' : 'Assign Grade'}
            </button>
          </div>
        </form>
      </Modal>
    </main>
  )
}