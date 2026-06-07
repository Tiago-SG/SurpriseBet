import { useNavigate } from 'react-router-dom'
import { useMatches } from '../../hooks/useMatches.js'
import { PHASE_MAP } from '../../utils/phases.js'

export default function AdminMatches() {
  const navigate = useNavigate()
  const { matches, loading } = useMatches()

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a]">
      <header className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white">←</button>
          <h1 className="text-xl font-bold text-white">Partidas</h1>
        </div>
        <button
          onClick={() => navigate('/admin/matches/new')}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium"
        >
          + Nova
        </button>
      </header>

      <main className="flex-1 px-4 py-4 space-y-2">
        {loading && <div className="text-center text-gray-400 py-8">Carregando...</div>}

        {!loading && matches.length === 0 && (
          <div className="text-center text-gray-500 py-8">Nenhuma partida cadastrada.</div>
        )}

        {matches.map(m => (
          <button
            key={m.id}
            onClick={() => navigate(`/admin/matches/${m.id}`)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-left"
          >
            <div>
              <span className="text-white font-medium">{m.homeTeam} x {m.awayTeam}</span>
              <p className="text-gray-400 text-xs mt-0.5">{PHASE_MAP[m.phase] || m.phase}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              m.status === 'finished' ? 'bg-green-500/20 text-green-400' :
              m.status === 'locked' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {m.status === 'finished' ? 'Finalizado' : m.status === 'locked' ? 'Bloqueado' : 'Aberto'}
            </span>
          </button>
        ))}
      </main>
    </div>
  )
}
