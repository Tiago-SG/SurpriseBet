import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../services/firebase.js'

export function useMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('scheduledAt', 'asc'))
    const unsubscribe = onSnapshot(q, (snap) => {
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return { matches, loading }
}
