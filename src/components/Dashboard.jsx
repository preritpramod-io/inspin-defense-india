import { useState } from 'react'
import { Shield, LogOut, Map, Briefcase, AlertCircle } from 'lucide-react'
import EcosystemMap from './EcosystemMap'
import PortfolioTracker from './PortfolioTracker'

export default function Dashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('portfolio')

  const tabs = [
    { key: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { key: 'ecosystem', label: 'Ecosystem', icon: Map },
  ]

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="sticky top-0 z-50 bg-navy-800/90 backdrop-blur-md border-b border-navy-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-saffron-500" />
              <span className="font-extrabold text-white tracking-tight">
                INSPIN <span className="text-saffron-500">DEF</span> IND
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500 hidden sm:block">Defence Activities Dashboard</span>
              <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-navy-700 transition-colors">
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-navy-800/50 border-b border-navy-500/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key ? 'border-saffron-500 text-saffron-500' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-red-500/10 border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-300 space-y-0.5">
              <p className="font-semibold">Critical: No IP agreement with Ashutosh Lal. No provisional patents on submitted proposals.</p>
              <p className="text-red-400/70">Novel inventions have been disclosed in submitted proposals without IP protection. File both immediately.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'portfolio' && <PortfolioTracker />}
        {activeTab === 'ecosystem' && <EcosystemMap />}
      </main>

      <footer className="border-t border-navy-500/15 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>INSPIN Private Limited &middot; Restricted Access</span>
            <span>Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
