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

export default function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto w-full max-w-[480px] min-h-screen flex flex-col">
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
