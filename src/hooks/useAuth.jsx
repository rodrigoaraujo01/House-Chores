import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

const KNOWN_PROFILES = {
  'rmaraujo@me.com':    { display_name: 'Rodrigo', color: 'yellow' },
  'maiana.ds@gmail.com': { display_name: 'Maiana',  color: 'green'  },
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setSession(null)
        setProfile(null)
        return
      }
      setSession(user)

      const profileRef = doc(db, 'profiles', user.uid)
      const snap = await getDoc(profileRef)

      if (snap.exists()) {
        setProfile({ id: user.uid, ...snap.data() })
      } else {
        // Auto-create on first login
        const defaults = KNOWN_PROFILES[user.email] ?? {
          display_name: user.email.split('@')[0],
          color: 'yellow',
        }
        const newProfile = {
          email: user.email,
          display_name: defaults.display_name,
          color: defaults.color,
          created_at: serverTimestamp(),
        }
        await setDoc(profileRef, newProfile)
        setProfile({ id: user.uid, ...newProfile, created_at: new Date().toISOString() })
      }
    })
    return unsubscribe
  }, [])

  async function signIn(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signOut() {
    await firebaseSignOut(auth)
  }

  async function updateProfile(updates) {
    if (!session) return
    const ref = doc(db, 'profiles', session.uid)
    await updateDoc(ref, updates)
    setProfile((prev) => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider value={{ session, profile, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
