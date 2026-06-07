import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import bcrypt from 'bcryptjs'
import { db } from '../../services/firebase.js'

export default function AdminUsers() {
  const navigate = useNavigate()
  const [allowedUsers, setAllowedUsers] = useState([])
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [resetting, setResetting] = useState(null) // userId em processo
  const [resetSuccess, setResetSuccess] = useState(null) // userId com sucesso

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'allowedUsers'), snap => {
      setAllowedUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setRegisteredUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  async function handleAdd() {
    const cleaned = phone.replace(/\D/g, '')
    if (!cleaned || !name.trim()) { setError('Preencha número e nome.'); return }
    setError('')
    setAdding(true)
    try {
      await addDoc(collection(db, 'allowedUsers'), { phone: cleaned, name: name.trim() })
      setPhone('')
      setName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(id) {
    if (!confirm('Remover este número da lista?')) return
    await deleteDoc(doc(db, 'allowedUsers', id))
  }

  async function handleResetPassword(user) {
    if (!confirm(`Redefinir a senha de ${user.name} para a senha padrão?`)) return
    setResetting(user.id)
    setResetSuccess(null)
    try {
      const passwordHash = await bcrypt.hash('1234', 10)
      await updateDoc(doc(db, 'users', user.id), { passwordHash })
      setResetSuccess(user.id)
      setTimeout(() => setResetSuccess(null), 4000)
    } finally {
      setResetting(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f1a]">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-xl font-bold text-white">Usuários</h1>
      </header>

      <main className="flex-1 px-4 py-4 space-y-6">

        {/* Usuários cadastrados */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Cadastrados ({registeredUsers.length})
          </h2>
          {registeredUsers.length === 0 && (
            <p className="text-center text-gray-500 py-4 text-sm">Nenhum usuário cadastrado ainda.</p>
          )}
          {registeredUsers.map(u => (
            <div key={u.id} className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{u.name}</p>
                  <p className="text-gray-400 text-xs">{u.phone}{u.isAdmin ? ' · admin' : ''}</p>
                </div>
                <button
                  onClick={() => handleResetPassword(u)}
                  disabled={resetting === u.id}
                  className="text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 disabled:opacity-50 transition-colors"
                >
                  {resetting === u.id ? 'Redefinindo...' : 'Redefinir senha'}
                </button>
              </div>
              {resetSuccess === u.id && (
                <p className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded">
                  Senha redefinida para 1234. Comunique o usuário.
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-white/10" />

        {/* Números permitidos */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Números Permitidos ({allowedUsers.length})
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="34999999999"
              className="field"
            />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome completo"
              className="field"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={handleAdd} disabled={adding}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm">
              {adding ? 'Adicionando...' : 'Adicionar número'}
            </button>
          </div>

          <div className="space-y-2">
            {allowedUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="text-white font-medium">{u.name}</p>
                  <p className="text-gray-400 text-xs">{u.phone}</p>
                </div>
                <button onClick={() => handleRemove(u.id)}
                  className="text-red-400 hover:text-red-300 text-sm px-2 py-1">
                  Remover
                </button>
              </div>
            ))}
            {allowedUsers.length === 0 && (
              <p className="text-center text-gray-500 py-4 text-sm">Nenhum número cadastrado.</p>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
