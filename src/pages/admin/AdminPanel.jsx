import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../services/firebase.js'

function formatTs(ts) {
  if (!ts) return 'Nunca'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleString('pt-BR')
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    getDoc(doc(db, 'settings', 'general')).then(snap => {
      if (snap.exists()) setLastSync(snap.data().lastApiSync)
    })
  }, [])

  const cards = [
    { label: 'Partidas', desc: 'Cadastrar e editar partidas', path: '/admin/matches' },
    { label: 'Usuários', desc: 'Gerenciar números permitidos', path: '/admin/users' },
    { label: 'Sincronizar API', desc: 'Buscar resultados da API-Football', path: '/admin/sync' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a]">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button onClick={() => navigate('/ranking')} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold text-white">Painel Admin</h1>
      </header>

      <main className="flex-1 px-4 py-4 space-y-3">
        <p className="text-sm text-gray-400">Última sincronização: {formatTs(lastSync)}</p>

        {cards.map(c => (
          <button
            key={c.path}
            onClick={() => navigate(c.path)}
            className="w-full flex flex-col items-start px-4 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left"
          >
            <span className="text-white font-semibold">{c.label}</span>
            <span className="text-gray-400 text-sm mt-0.5">{c.desc}</span>
          </button>
        ))}
      </main>
    </div>
  )
}
