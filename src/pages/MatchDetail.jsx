import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  doc, collection, query, where,
  onSnapshot, getDoc,
} from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { savePrediction } from '../services/predictions.js'
import MatchCard from '../components/MatchCard.jsx'

function isLocked(match) {
  if (match.status !== 'upcoming') return true
  if (!match.lockedAt) return false
  const lockTime = match.lockedAt.toDate ? match.lockedAt.toDate() : new Date(match.lockedAt)
  return new Date() >= lockTime
}

export default function MatchDetail() {
  const { matchId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [match, setMatch] = useState(null)
  const [myPrediction, setMyPrediction] = useState(null)
  const [allPredictions, setAllPredictions] = useState([])
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true)

  // Partida em realtime
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'matches', matchId), snap => {
      if (snap.exists()) setMatch({ id: snap.id, ...snap.data() })
      setLoading(false)
    })
    return unsub
  }, [matchId])

  // Palpite do usuário logado em realtime
  useEffect(() => {
    if (!currentUser) return
    const predId = `${currentUser.uid}_${matchId}`
    const unsub = onSnapshot(doc(db, 'predictions', predId), snap => {
      setMyPrediction(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
    return unsub
  }, [currentUser, matchId])

  // Todos os palpites da partida em realtime
  useEffect(() => {
    const q = query(collection(db, 'predictions'), where('matchId', '==', matchId))
    const unsub = onSnapshot(q, snap => {
      setAllPredictions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [matchId])

  // Usuários em realtime (para exibir nomes)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      const map = {}
      snap.docs.forEach(d => { map[d.id] = d.data() })
      setUsers(map)
    })
    return unsub
  }, [])

  async function handleSave(homeScore, awayScore) {
    await savePrediction(currentUser.uid, matchId, homeScore, awayScore)
  }

  if (loading || !match) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f1a] text-white">
        Carregando...
      </div>
    )
  }

  const locked = isLocked(match)
  const finished = match.status === 'finished'
  const mode = finished ? 'result' : 'input'

  // Ordena: eu primeiro, depois alfabético
  const sortedPredictions = [...allPredictions].sort((a, b) => {
    if (a.userId === currentUser.uid) return -1
    if (b.userId === currentUser.uid) return 1
    return (users[a.userId]?.name || '').localeCompare(users[b.userId]?.name || '')
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a]">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button onClick={() => navigate('/matches')} className="text-gray-400 hover:text-white text-xl">←</button>
        <div>
          <h1 className="text-xl font-bold text-white">
            {match.homeTeam} × {match.awayTeam}
          </h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-5 pb-8">
        {/* Card principal com palpite do usuário */}
        <MatchCard
          match={match}
          prediction={myPrediction}
          onSave={handleSave}
          mode={mode}
          points={myPrediction?.points}
          editable={!locked && !finished}
        />

        {/* Lista de palpites */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Palpites ({allPredictions.length})
          </h2>

          {allPredictions.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">Nenhum palpite ainda.</p>
          )}

          <div className="space-y-2">
            {sortedPredictions.map(pred => {
              const user = users[pred.userId]
              const isMe = pred.userId === currentUser.uid
              if (!user) return null

              return (
                <div
                  key={pred.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                    isMe
                      ? 'bg-blue-600/20 border-blue-500/40'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className={`font-medium text-sm ${isMe ? 'text-blue-300' : 'text-white'}`}>
                    {user.name}
                    {isMe && <span className="text-blue-400 ml-1 text-xs">(você)</span>}
                  </span>

                  {/* Mostrar placar se: partida finalizada OU é o próprio usuário */}
                  {finished || isMe ? (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-200 text-sm font-mono">
                        {pred.homeScore} × {pred.awayScore}
                      </span>
                      {finished && pred.points != null && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          pred.points > 0
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {pred.points > 0 ? `+${pred.points}` : '0'} pts
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs">Palpitou ✓</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
