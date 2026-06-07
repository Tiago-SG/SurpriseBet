import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase.js'

export async function getMatches() {
  const snap = await getDocs(
    query(collection(db, 'matches'), orderBy('scheduledAt', 'asc'))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getMatch(matchId) {
  const snap = await getDoc(doc(db, 'matches', matchId))
  if (!snap.exists()) throw new Error('Partida não encontrada.')
  return { id: snap.id, ...snap.data() }
}

export async function createMatch(data) {
  const ref = await addDoc(collection(db, 'matches'), {
    ...data,
    homeScore: null,
    awayScore: null,
    brazilAdvanced: null,
    status: 'upcoming',
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateMatch(matchId, data) {
  await updateDoc(doc(db, 'matches', matchId), data)
}
