import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export function homePath(user) {
  return user?.role === 'admin' ? '/' : '/my-grades'
}

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={homePath(user)} replace />
  return children
}