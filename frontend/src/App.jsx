import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute, { homePath } from './components/ProtectedRoute.jsx'
import Navbar from './components/Navbar.jsx'
import { useAuth } from './context/AuthContext.jsx'
import Courses from './pages/Courses.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Grades from './pages/Grades.jsx'
import Login from './pages/Login.jsx'
import MyGrades from './pages/MyGrades.jsx'
import Students from './pages/Students.jsx'

export default function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={homePath(user)} replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute role="admin">
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute role="admin">
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <ProtectedRoute role="admin">
              <Grades />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-grades"
          element={
            <ProtectedRoute role="student">
              <MyGrades />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? homePath(user) : '/login'} replace />} />
      </Routes>
    </div>
  )
}