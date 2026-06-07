import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase.js'
import { registerUser } from '../services/auth.js'
import { TEAMS } from '../utils/phases.js'

export default function Register() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [championPick, setChampionPick] = useState('')
  const [runnerUpPick, setRunnerUpPick] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [phoneChecked, setPhoneChecked] = useState(false)

  async function checkPhone() {
    const cleaned = phone.replace(/\D/g, '')
    if (!cleaned) return
    setError('')
    try {
      const snap = await getDocs(
        query(collection(db, 'allowedUsers'), where('phone', '==', cleaned))
      )
      if (snap.empty) {
        setError('Número não autorizado. Fale com o administrador.')
        return
      }
      setName(snap.docs[0].data().name)
      setPhoneChecked(true)
    } catch {
      setError('Erro ao verificar número.')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) { setError('As senhas não conferem.'); return }
    if (!password) { setError('Informe uma senha.'); return }
    if (!championPick || !runnerUpPick) { setError('Selecione campeão e vice.'); return }
    setError('')
    setLoading(true)
    try {
      await registerUser({ phone: phone.replace(/\D/g, ''), password, championPick, runnerUpPick })
      navigate('/ranking')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8 bg-[#0f0f1a]">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Cadastro</h1>
          <p className="text-gray-400 mt-1">SurpriseBet — Copa 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm text-gray-300 mb-1">Celular</label>
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); setPhoneChecked(false); setName('') }}
                placeholder="34999999999"
                required
                className="field"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={checkPhone}
                className="px-4 py-3 rounded-lg border text-gray-300 hover:text-white hover:border-white/30 transition-colors text-sm"
                style={{ backgroundColor: '#1e1e35', borderColor: 'rgba(255,255,255,0.15)' }}
              >
                Verificar
              </button>
            </div>
          </div>

          {name && (
            <div>
              <label className="block text-sm text-gray-300 mb-1">Nome</label>
              <input
                type="text"
                value={name}
                readOnly
                className="w-full px-4 py-3 rounded-lg text-gray-400"
                style={{ backgroundColor: '#13132a', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
          )}

          {phoneChecked && (
            <>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Senha</label>
                <input type="password" value={password}
                  onChange={e => setPassword(e.target.value)} required className="field" />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Confirmar senha</label>
                <input type="password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} required className="field" />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Quem vai ser campeão?</label>
                <select value={championPick} onChange={e => setChampionPick(e.target.value)}
                  required className="field">
                  <option value="">Selecione...</option>
                  {TEAMS.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Quem vai ser vice?</label>
                <select value={runnerUpPick} onChange={e => setRunnerUpPick(e.target.value)}
                  required className="field">
                  <option value="">Selecione...</option>
                  {TEAMS.filter(t => t.code !== championPick).map(t => (
                    <option key={t.code} value={t.code}>{t.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}

          {phoneChecked && (
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-colors">
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          )}
        </form>

        <p className="text-center text-sm text-gray-400">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
