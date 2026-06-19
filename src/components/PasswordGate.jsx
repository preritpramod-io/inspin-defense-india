import { useState } from 'react'
import { Shield, Lock, ArrowRight } from 'lucide-react'

export default function PasswordGate({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const success = onLogin(password)
    if (!success) {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setTimeout(() => setError(false), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,153,51,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,153,51,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className={`relative z-10 w-full max-w-md px-6 ${shake ? 'animate-shake' : ''}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-navy-700 border border-navy-500/40 mb-6 shadow-lg shadow-navy-900/50">
            <Shield className="w-10 h-10 text-saffron-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            INSPIN <span className="text-saffron-500">DEF</span> IND
          </h1>
          <p className="mt-2 text-sm text-slate-400 tracking-widest uppercase">
            Defence Activities Dashboard
          </p>
        </div>
        <div className="card-glass p-8">
          <div className="text-center mb-6">
            <p className="text-lg text-slate-300">Welcome.</p>
            <p className="text-sm text-slate-500 mt-1">Enter your access credential below.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access password"
                className={`w-full pl-10 pr-4 py-3 bg-navy-800 border rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                  error
                    ? 'border-red-500/60 focus:ring-red-500/30'
                    : 'border-navy-500/40 focus:ring-saffron-500/30 focus:border-saffron-500/50'
                }`}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">Invalid password. Contact the administrator.</p>
            )}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-saffron-500 hover:bg-saffron-600 text-navy-900 font-semibold rounded-lg transition-colors"
            >
              Enter Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-slate-600">
          INSPIN Private Limited &middot; Restricted Access
        </p>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  )
}
