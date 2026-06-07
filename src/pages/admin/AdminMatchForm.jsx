import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Timestamp, doc, updateDoc, increment, collection, getDocs, query, where } from 'firebase/firestore'
import { getMatch, createMatch, updateMatch } from '../../services/matches.js'
import { calculatePoints } from '../../services/scoring.js'
import { db } from '../../services/firebase.js'
import { PHASES, GROUPS, TEAMS } from '../../utils/phases.js'

export default function AdminMatchForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = !id || id === 'new'

  const [phase, setPhase] = useState('group')
  const [groupName, setGroupName] = useState('A')
  const [homeTeam, setHomeTeam] = useState('')
  const [awayTeam, setAwayTeam] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [apiMatchId, setApiMatchId] = useState('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [brazilAdvanced, setBrazilAdvanced] = useState('')
  const [currentStatus, setCurrentStatus] = useState('upcoming')
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!isNew) {
      getMatch(id).then(m => {
        setPhase(m.phase)
        setGroupName(m.groupName || 'A')
        setHomeTeam(m.homeTeam)
        setAwayTeam(m.awayTeam)
        setCurrentStatus(m.status)
        if (m.scheduledAt) {
          const d = m.scheduledAt.toDate ? m.scheduledAt.toDate() : new Date(m.scheduledAt)
          setDate(d.toISOString().slice(0, 10))
          setTime(d.toISOString().slice(11, 16))
        }
        setApiMatchId(m.apiMatchId || '')
        setHomeScore(m.homeScore ?? '')
        setAwayScore(m.awayScore ?? '')
        setBrazilAdvanced(m.brazilAdvanced === null ? '' : String(m.brazilAdvanced))
        setLoading(false)
      })
    }
  }, [id, isNew])

  const homeFlag = TEAMS.find(t => t.code === homeTeam)?.flag || homeTeam?.toLowerCase() || ''
  const awayFlag = TEAMS.find(t => t.code === awayTeam)?.flag || awayTeam?.toLowerCase() || ''
  const involvesBrazil = homeTeam === 'BRA' || awayTeam === 'BRA'

  async function handleSave() {
    if (!homeTeam || !awayTeam || !date || !time) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setError('')
    setSuccessMsg('')
    setSaving(true)

    try {
      const dtLocal = new Date(`${date}T${time}:00`)
      const scheduledAt = Timestamp.fromDate(dtLocal)
      const lockedAt = Timestamp.fromDate(new Date(dtLocal.getTime() - 30 * 60 * 1000))

      const baseData = {
        phase,
        groupName: phase === 'group' ? groupName : null,
        homeTeam,
        awayTeam,
        homeFlag,
        awayFlag,
        scheduledAt,
        lockedAt,
        apiMatchId: apiMatchId || null,
      }

      if (isNew) {
        await createMatch(baseData)
        navigate('/admin/matches')
        return
      }

      const hasResult = homeScore !== '' && awayScore !== ''

      if (hasResult && currentStatus !== 'finished') {
        await updateMatch(id, {
          ...baseData,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
          status: 'finished',
          brazilAdvanced: brazilAdvanced === 'true' ? true
            : brazilAdvanced === 'false' ? false : null,
        })
        await applyPoints(id)
        setSuccessMsg('Resultado salvo e pontos calculados!')
      } else if (hasResult && currentStatus === 'finished') {
        await updateMatch(id, {
          ...baseData,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
          brazilAdvanced: brazilAdvanced === 'true' ? true
            : brazilAdvanced === 'false' ? false : null,
        })
        setSuccessMsg('Dados atualizados. Pontos NÃO recalculados (já finalizado).')
      } else {
        await updateMatch(id, baseData)
        setSuccessMsg('Partida atualizada.')
      }

      setTimeout(() => navigate('/admin/matches'), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function applyPoints(matchId) {
    const match = await getMatch(matchId)
    const snap = await getDocs(
      query(collection(db, 'predictions'), where('matchId', '==', matchId))
    )
    for (const predDoc of snap.docs) {
      const prediction = predDoc.data()
      const pts = calculatePoints(match, prediction)
      await updateDoc(doc(db, 'predictions', predDoc.id), { points: pts })
      await updateDoc(doc(db, 'users', prediction.userId), { totalPoints: increment(pts) })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f1a] text-white">
        Carregando...
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a]">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button onClick={() => navigate('/admin/matches')} className="text-gray-400 hover:text-white text-xl">←</button>
        <h1 className="text-xl font-bold text-white">{isNew ? 'Nova Partida' : 'Editar Partida'}</h1>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">

        <div>
          <label className="block text-sm text-gray-300 mb-1">Fase *</label>
          <select value={phase} onChange={e => setPhase(e.target.value)} className="field">
            {PHASES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
        </div>

        {phase === 'group' && (
          <div>
            <label className="block text-sm text-gray-300 mb-1">Grupo</label>
            <select value={groupName} onChange={e => setGroupName(e.target.value)} className="field">
              {GROUPS.map(g => <option key={g} value={g}>Grupo {g}</option>)}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Casa *</label>
            <select value={homeTeam} onChange={e => setHomeTeam(e.target.value)} className="field">
              <option value="">Selecione...</option>
              {TEAMS.map(t => <option key={t.code} value={t.code}>{t.code} — {t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Visitante *</label>
            <select value={awayTeam} onChange={e => setAwayTeam(e.target.value)} className="field">
              <option value="">Selecione...</option>
              {TEAMS.filter(t => t.code !== homeTeam).map(t => <option key={t.code} value={t.code}>{t.code} — {t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Data *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="field" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Hora (local) *</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="field" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">
            API Match ID <span className="text-gray-500">(opcional)</span>
          </label>
          <input type="text" value={apiMatchId} onChange={e => setApiMatchId(e.target.value)}
            placeholder="Ex: 1234567" className="field" />
        </div>

        {!isNew && (
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-300">Resultado</h2>
              {currentStatus === 'finished' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                  Pontos já calculados
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Gols {homeTeam || 'Casa'}</label>
                <input type="text" inputMode="numeric" maxLength={2} value={homeScore}
                  onChange={e => setHomeScore(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="0" className="field" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Gols {awayTeam || 'Visit.'}</label>
                <input type="text" inputMode="numeric" maxLength={2} value={awayScore}
                  onChange={e => setAwayScore(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="0" className="field" />
              </div>
            </div>

            {involvesBrazil && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Brasil avançou?</label>
                <select value={brazilAdvanced} onChange={e => setBrazilAdvanced(e.target.value)} className="field">
                  <option value="">Não aplicável / pendente</option>
                  <option value="true">Sim — aplica x2</option>
                  <option value="false">Não</option>
                </select>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
        )}
        {successMsg && (
          <p className="text-green-400 text-sm bg-green-400/10 px-3 py-2 rounded-lg">{successMsg}</p>
        )}

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors">
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </main>
    </div>
  )
}
