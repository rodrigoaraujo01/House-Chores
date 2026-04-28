import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(err.message ?? 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6">
      {/* Logo area */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-4xl">
          🏠
        </div>
        <h1 className="text-2xl font-semibold text-text-main">House Chores</h1>
        <p className="text-warm-gray text-sm mt-1">Track your home, together</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-2xl">{error}</p>
        )}

        <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {/* Legend */}
      <div className="mt-10 flex items-center gap-6 text-xs text-warm-gray">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rodrigo inline-block" />
          Rodrigo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-maiana inline-block" />
          Maiana
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-both inline-block" />
          Both
        </span>
      </div>
    </div>
  )
}
