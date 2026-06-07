import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function PrivateRoute() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-lg">Carregando...</div>
      </div>
    )
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />
}
