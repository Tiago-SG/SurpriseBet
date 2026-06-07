import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Ranking from './pages/Ranking.jsx'
import Matches from './pages/Matches.jsx'
import MatchDetail from './pages/MatchDetail.jsx'
import PlayerPredictions from './pages/PlayerPredictions.jsx'
import AdminPanel from './pages/admin/AdminPanel.jsx'
import AdminMatches from './pages/admin/AdminMatches.jsx'
import AdminMatchForm from './pages/admin/AdminMatchForm.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminSync from './pages/admin/AdminSync.jsx'

const TRICOLOR = 'linear-gradient(90deg,#D93B22 0 33.33%,#2F6BF0 33.33% 66.66%,#1E9B55 66.66% 100%)'

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '4px', background: TRICOLOR, zIndex: 9999 }} />
      <div className="mx-auto w-full max-w-[480px] min-h-screen flex flex-col" style={{ paddingTop: '4px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/ranking" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute />}>
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/matches/:matchId" element={<MatchDetail />} />
            <Route path="/player/:userId" element={<PlayerPredictions />} />
          </Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/matches/new" element={<AdminMatchForm />} />
            <Route path="/admin/matches/:id" element={<AdminMatchForm />} />
            <Route path="/admin/matches" element={<AdminMatches />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/sync" element={<AdminSync />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  )
}
