import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { FirebaseError } from 'firebase/app'
import bcrypt from 'bcryptjs'
import { auth, db } from './firebase.js'

function phoneToEmail(phone) {
  return `${phone}@surprisebet.app`
}

// Firebase Auth exige mínimo 6 chars; a autenticação real usa bcrypt
const FIREBASE_AUTH_PASSWORD = 'surprisebet_internal'

export async function registerUser({ phone, password, championPick, runnerUpPick }) {
  // 1. Verificar se número está na allowlist
  const allowedSnap = await getDocs(
    query(collection(db, 'allowedUsers'), where('phone', '==', phone))
  )
  if (allowedSnap.empty) {
    throw new Error('Número não autorizado. Fale com o administrador.')
  }
  const allowedData = allowedSnap.docs[0].data()

  // 2. Hash da senha
  const passwordHash = await bcrypt.hash(password, 10)

  // 3. Criar usuário no Firebase Auth
  // Se o email já existir, Firebase lança email-already-in-use
  let credential
  try {
    credential = await createUserWithEmailAndPassword(auth, phoneToEmail(phone), FIREBASE_AUTH_PASSWORD)
  } catch (err) {
    if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
      throw new Error('Número já cadastrado. Faça login.')
    }
    throw err
  }
  const uid = credential.user.uid

  // 4. Salvar documento no Firestore (usuário já autenticado neste ponto)
  await setDoc(doc(db, 'users', uid), {
    uid,
    phone,
    name: allowedData.name,
    passwordHash,
    championPick,
    runnerUpPick,
    isAdmin: false,
    totalPoints: 0,
    createdAt: serverTimestamp(),
  })

  return credential.user
}

export async function loginUser({ phone, password }) {
  // 1. Autenticar no Firebase Auth (não requer leitura do Firestore)
  let credential
  try {
    credential = await signInWithEmailAndPassword(auth, phoneToEmail(phone), FIREBASE_AUTH_PASSWORD)
  } catch (err) {
    if (err instanceof FirebaseError && (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/invalid-email'
    )) {
      throw new Error('Número não encontrado.')
    }
    throw err
  }

  // 2. Agora autenticado — buscar passwordHash no Firestore
  const snap = await getDocs(
    query(collection(db, 'users'), where('phone', '==', phone))
  )
  if (snap.empty) {
    await signOut(auth)
    throw new Error('Número não encontrado.')
  }

  // 3. Verificar senha com bcrypt
  const userData = snap.docs[0].data()
  const valid = await bcrypt.compare(password, userData.passwordHash)
  if (!valid) {
    await signOut(auth)
    throw new Error('Senha incorreta.')
  }

  return credential.user
}

export async function logoutUser() {
  await signOut(auth)
}
