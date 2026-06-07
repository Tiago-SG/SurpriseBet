import { useState, useEffect } from 'react'
import { flagUrl } from '../utils/flagUrl.js'
import { PHASE_MAP, TEAM_MAP } from '../utils/phases.js'

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function isLocked(match) {
  if (match.status !== 'upcoming') return true
  if (!match.lockedAt) return false
  const lockTime = match.lockedAt.toDate ? match.lockedAt.toDate() : new Date(match.lockedAt)
  return new Date() >= lockTime
}

export default function MatchCard({ match, prediction, onSave, mode = 'view', points, editable = false }) {
  const [homeInput, setHomeInput] = useState(prediction?.homeScore ?? '')
  const [awayInput, setAwayInput] = useState(prediction?.awayScore ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [now, setNow] = useState(new Date())

  // Sincroniza inputs quando prediction mudar externamente
  useEffect(() => {
    setHomeInput(prediction?.homeScore ?? '')
    setAwayInput(prediction?.awayScore ?? '')
  }, [prediction?.homeScore, prediction?.awayScore])

  // Atualiza o relógio a cada 30s para recalcular trava
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  const locked = isLocked(match)
  const canSave = editable && !locked && mode === 'input'

  const homeTeam = TEAM_MAP[match.homeTeam] || { code: match.homeTeam, name: match.homeTeam, flag: match.homeFlag }
  const awayTeam = TEAM_MAP[match.awayTeam] || { code: match.awayTeam, name: match.awayTeam, flag: match.awayFlag }

  async function handleSave(e) {
    e.stopPropagation()
    if (homeInput === '' || awayInput === '') return
    setSaving(true)
    try {
      await onSave(Number(homeInput), Number(awayInput))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const statusBadge = match.status === 'finished'
    ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Finalizado</span>
    : locked
      ? <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">🔒 travado</span>
      : <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Aberto</span>

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      {/* Header: fase + data */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          {PHASE_MAP[match.phase] || match.phase}
          {match.groupName ? ` · Grupo ${match.groupName}` : ''}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {formatDate(match.scheduledAt)} · {formatTime(match.scheduledAt)}
          </span>
          {statusBadge}
        </div>
      </div>

      {/* Times e placar */}
      <div className="flex items-center justify-center gap-3">
        {/* Time casa */}
        <div className="flex flex-col items-center gap-1 w-16">
          <img
            src={flagUrl(homeTeam.flag)}
            alt={homeTeam.name}
            className="w-10 h-auto"
            onError={e => { e.target.style.display = 'none' }}
          />
          <span className="text-xs font-bold text-white">{homeTeam.code}</span>
        </div>

        {/* Placar */}
        <div className="flex items-center gap-2">
          {canSave ? (
            <>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={homeInput}
                onClick={e => e.stopPropagation()}
                onChange={e => setHomeInput(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="0"
                className="w-12 h-12 text-center text-xl font-bold rounded-lg text-white focus:outline-none focus:border-blue-400 border placeholder-gray-600"
                style={{ backgroundColor: '#1e1e35', borderColor: 'rgba(255,255,255,0.2)' }}
              />
              <span className="text-white text-xl font-bold">×</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                value={awayInput}
                onClick={e => e.stopPropagation()}
                onChange={e => setAwayInput(e.target.value.replace(/\D/g, '').slice(0, 2))}
                placeholder="0"
                className="w-12 h-12 text-center text-xl font-bold rounded-lg text-white focus:outline-none focus:border-blue-400 border placeholder-gray-600"
                style={{ backgroundColor: '#1e1e35', borderColor: 'rgba(255,255,255,0.2)' }}
              />
            </>
          ) : (
            <>
              <span className="w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg text-white"
                style={{ backgroundColor: '#1e1e35' }}>
                {prediction?.homeScore ?? '-'}
              </span>
              <span className="text-white text-xl font-bold">×</span>
              <span className="w-12 h-12 flex items-center justify-center text-xl font-bold rounded-lg text-white"
                style={{ backgroundColor: '#1e1e35' }}>
                {prediction?.awayScore ?? '-'}
              </span>
            </>
          )}
        </div>

        {/* Time visitante */}
        <div className="flex flex-col items-center gap-1 w-16">
          <img
            src={flagUrl(awayTeam.flag)}
            alt={awayTeam.name}
            className="w-10 h-auto"
            onError={e => { e.target.style.display = 'none' }}
          />
          <span className="text-xs font-bold text-white">{awayTeam.code}</span>
        </div>
      </div>

      {/* Resultado oficial + pontos (mode result) */}
      {mode === 'result' && match.status === 'finished' && (
        <div className="text-center border-t border-white/10 pt-3 space-y-1">
          <p className="text-gray-400 text-sm">
            Resultado oficial:{' '}
            <span className="text-white font-semibold">
              {match.homeScore} × {match.awayScore}
            </span>
          </p>
          {points != null && (
            <p className={`font-bold text-sm ${points > 0 ? 'text-green-400' : 'text-gray-500'}`}>
              {points > 0 ? `+${points} pontos` : '0 pontos'}
            </p>
          )}
        </div>
      )}

      {/* Botão salvar */}
      {canSave && (
        <button
          onClick={handleSave}
          disabled={saving || homeInput === '' || awayInput === ''}
          className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
        >
          {saving ? 'Salvando...' : saved ? '✓ Salvo!' : prediction ? 'Atualizar palpite' : 'Salvar palpite'}
        </button>
      )}
    </div>
  )
}
