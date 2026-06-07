import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { logoutUser } from '../services/auth.js'
import RankingRow from '../components/RankingRow.jsx'

export default function Ranking() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('totalPoints', 'desc'))
    const unsub = onSnapshot(q, snap => {
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  function getRankedUsers() {
    let position = 1
    return users.map((user, idx) => {
      if (idx > 0 && user.totalPoints < users[idx - 1].totalPoints) {
        position = idx + 1
      }
      return { ...user, position }
    })
  }

  async function handleLogout() {
    await logoutUser()
    navigate('/login')
  }

  const rankedUsers = getRankedUsers()

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a]">
      <header className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <h1 className="text-xl font-bold text-white">SurpriseBet</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/matches')}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
          >
            Partidas
          </button>
          {currentUser?.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm"
            >
              Admin
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-sm"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-2">
        <h2 className="text-lg font-semibold text-gray-300 mb-3">Classificação</h2>

        {loading && (
          <div className="text-center text-gray-400 py-8">Carregando...</div>
        )}

        {!loading && rankedUsers.map(user => (
          <RankingRow
            key={user.uid}
            user={user}
            position={user.position}
            isCurrentUser={user.uid === currentUser?.uid}
          />
        ))}

        {!loading && users.length === 0 && (
          <div className="text-center text-gray-500 py-8">Nenhum participante ainda.</div>
        )}
      </main>
    </div>
  )
}
