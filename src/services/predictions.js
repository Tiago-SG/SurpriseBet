import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase.js'

export async function getPrediction(userId, matchId) {
  const id = `${userId}_${matchId}`
  const snap = await getDoc(doc(db, 'predictions', id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function getPredictionsByMatch(matchId) {
  const snap = await getDocs(
    query(collection(db, 'predictions'), where('matchId', '==', matchId))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function getPredictionsByUser(userId) {
  const snap = await getDocs(
    query(collection(db, 'predictions'), where('userId', '==', userId))
  )
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function savePrediction(userId, matchId, homeScore, awayScore) {
  const id = `${userId}_${matchId}`
  const existing = await getDoc(doc(db, 'predictions', id))

  if (existing.exists()) {
    await setDoc(doc(db, 'predictions', id), {
      userId,
      matchId,
      homeScore,
      awayScore,
      points: null,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  } else {
    await setDoc(doc(db, 'predictions', id), {
      userId,
      matchId,
      homeScore,
      awayScore,
      points: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
}
