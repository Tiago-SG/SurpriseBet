import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { useMatches } from '../hooks/useMatches.js'
import { savePrediction } from '../services/predictions.js'
import MatchCard from '../components/MatchCard.jsx'
import { PHASE_MAP } from '../utils/phases.js'

const PHASE_ORDER = ['group', 'pre-round-of-16', 'round-of-16', 'quarters', 'semis', 'third', 'final']

function isLocked(match) {
  if (match.status !== 'upcoming') return true
  if (!match.lockedAt) return false
  const lockTime = match.lockedAt.toDate ? match.lockedAt.toDate() : new Date(match.lockedAt)
  return new Date() >= lockTime
}

export default function Matches() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { matches, loading } = useMatches()
  const [predictions, setPredictions] = useState({}) // matchId → prediction

  // Carrega palpites do usuário em realtime
  useEffect(() => {
    if (!currentUser) return
    const q = query(
      collection(db, 'predictions'),
      where('userId', '==', currentUser.uid)
    )
    const unsub = onSnapshot(q, snap => {
      const map = {}
      snap.docs.forEach(d => { map[d.data().matchId] = { id: d.id, ...d.data() } })
      setPredictions(map)
    })
    return unsub
  }, [currentUser])

  async function handleSave(matchId, homeScore, awayScore) {
    await savePrediction(currentUser.uid, matchId, homeScore, awayScore)
  }

  // Agrupa por fase, só mostra fases com partidas
  const grouped = matches.reduce((acc, m) => {
    if (!acc[m.phase]) acc[m.phase] = []
    acc[m.phase].push(m)
    return acc
  }, {})
  const phases = PHASE_ORDER.filter(p => grouped[p]?.length > 0)

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a]">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button onClick={() => navigate('/ranking')} className="text-gray-400 hover:text-white text-xl">←</button>
        <h1 className="text-xl font-bold text-white">Partidas</h1>
      </header>

      <main className="flex-1 px-4 py-4 space-y-6 pb-8">
        {loading && (
          <div className="text-center text-gray-400 py-12">Carregando...</div>
        )}

        {!loading && phases.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">Nenhuma partida cadastrada.</p>
            <p className="text-sm mt-1">O administrador precisa cadastrar as partidas.</p>
          </div>
        )}

        {phases.map(phase => (
          <section key={phase}>
            <h2 className="section-title-wc mb-3 px-1">
              {PHASE_MAP[phase] || phase}
            </h2>
            <div className="space-y-3">
              {grouped[phase].map(match => {
                const pred = predictions[match.id] || null
                const locked = isLocked(match)
                const finished = match.status === 'finished'
                const mode = finished ? 'result' : 'input'

                return (
                  <div
                    key={match.id}
                    onClick={() => navigate(`/matches/${match.id}`)}
                    className="cursor-pointer active:opacity-80"
                  >
                    <MatchCard
                      match={match}
                      prediction={pred}
                      onSave={(h, a) => {
                        // Impede navegação ao clicar no botão salvar
                        handleSave(match.id, h, a)
                      }}
                      mode={mode}
                      points={pred?.points}
                      editable={!locked && !finished}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
