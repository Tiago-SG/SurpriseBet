import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function AdminRoute() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />
  if (!currentUser.isAdmin) return <Navigate to="/ranking" replace />

  return <Outlet />
}
