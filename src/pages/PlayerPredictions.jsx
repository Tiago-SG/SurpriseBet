import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { useMatches } from '../hooks/useMatches.js'
import MatchCard from '../components/MatchCard.jsx'

export default function PlayerPredictions() {
  const { userId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const { matches } = useMatches()

  const [player, setPlayer] = useState(null)
  const [predictions, setPredictions] = useState({}) // matchId → prediction

  const isOwnProfile = userId === currentUser?.uid

  useEffect(() => {
    getDoc(doc(db, 'users', userId)).then(snap => {
      if (snap.exists()) setPlayer(snap.data())
    })
  }, [userId])

  useEffect(() => {
    const q = query(collection(db, 'predictions'), where('userId', '==', userId))
    const unsub = onSnapshot(q, snap => {
      const map = {}
      snap.docs.forEach(d => { map[d.data().matchId] = { id: d.id, ...d.data() } })
      setPredictions(map)
    })
    return unsub
  }, [userId])

  // Partidas visíveis:
  // - finalizadas para todos
  // - com palpite do próprio usuário (mesmo não finalizadas) se for perfil próprio
  const visibleMatches = matches.filter(m => {
    if (m.status === 'finished') return true
    if (isOwnProfile && predictions[m.id]) return true
    return false
  })

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f1a] text-white">
        Carregando...
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a]">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button onClick={() => navigate('/ranking')} className="text-gray-400 hover:text-white text-xl">←</button>
        <div>
          <h1 className="text-xl font-bold text-white">{player.name}</h1>
          <p className="text-sm text-gray-400">{player.totalPoints ?? 0} pontos</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-3 pb-8">
        {visibleMatches.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p>Nenhum resultado disponível ainda.</p>
          </div>
        )}

        {visibleMatches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            prediction={predictions[match.id] || null}
            mode={match.status === 'finished' ? 'result' : 'view'}
            points={predictions[match.id]?.points}
            editable={false}
          />
        ))}
      </main>
    </div>
  )
}
