import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db } from '../../services/firebase.js'

function formatTs(ts) {
  if (!ts) return 'Nunca'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('pt-BR')
}

export default function AdminSync() {
  const navigate = useNavigate()
  const [lastSync, setLastSync] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDoc(doc(db, 'settings', 'general')).then(snap => {
      if (snap.exists()) setLastSync(snap.data().lastApiSync)
    })
  }, [])

  async function handleSync() {
    setSyncing(true)
    setError('')
    setResult(null)
    try {
      const fns = getFunctions()
      const res = await httpsCallable(fns, 'manualApiSync')()
      setResult(res.data)
      const snap = await getDoc(doc(db, 'settings', 'general'))
      if (snap.exists()) setLastSync(snap.data().lastApiSync)
    } catch (err) {
      setError(err.message)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a]">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold text-white">Sincronizar API</h1>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        <p className="text-gray-400 text-sm">
          Última sincronização: <span className="text-white">{formatTs(lastSync)}</span>
        </p>
        <p className="text-gray-500 text-xs">
          Importa partidas novas e atualiza resultados de partidas já encerradas.
        </p>

        <button onClick={handleSync} disabled={syncing}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold">
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        {result && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-1">
            {result.imported > 0 && (
              <p className="text-green-400 text-sm">{result.imported} partida(s) nova(s) importada(s)</p>
            )}
            <p className="text-blue-300 text-sm">{result.updated} resultado(s) atualizado(s)</p>
            {result.log?.map((l, i) => (
              <p key={i} className="text-gray-400 text-xs">{l}</p>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
