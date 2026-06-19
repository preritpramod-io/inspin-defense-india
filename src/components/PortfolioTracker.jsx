import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle, Clock, XCircle, HelpCircle, AlertTriangle, FileText, Calendar, IndianRupee, Building } from 'lucide-react'
import portfolioData from '../data/portfolio.json'

const statusConfig = {
  submitted: { label: 'Submitted', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle, dot: 'bg-emerald-500' },
  'in-progress': { label: 'In Progress', color: 'bg-amber-500/20 text-amber-400', icon: Clock, dot: 'bg-amber-500' },
  'not-started': { label: 'Not Started', color: 'bg-slate-500/20 text-slate-400', icon: Clock, dot: 'bg-slate-500' },
  scrapped: { label: 'Scrapped', color: 'bg-red-500/20 text-red-400', icon: XCircle, dot: 'bg-red-500' },
  unconfirmed: { label: 'Unconfirmed', color: 'bg-orange-500/20 text-orange-400', icon: HelpCircle, dot: 'bg-orange-500' },
  preliminary: { label: 'Preliminary', color: 'bg-blue-500/20 text-blue-400', icon: AlertTriangle, dot: 'bg-blue-500' },
  complete: { label: 'Complete', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle, dot: 'bg-emerald-500' },
}
const ecosystemColors = {
  'iDEX DRISHTI': 'border-l-emerald-500',
  'iDEX ADITI 4.0': 'border-l-rose-500',
  'DRDO TDF': 'border-l-purple-500',
  'Private': 'border-l-blue-500',
}

function ActivityCard({ activity }) {
  const [expanded, setExpanded] = useState(false)
  const submission = statusConfig[activity.submissionStatus] || statusConfig['not-started']
  const SubmitIcon = submission.icon
  const borderColor = ecosystemColors[activity.ecosystem] || 'border-l-slate-500'
  return (
    <div className={`card-glass border-l-4 ${borderColor} cursor-pointer transition-all hover:bg-white/[0.02]`} onClick={() => setExpanded(!expanded)}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge-status bg-navy-600 text-slate-300">{activity.ecosystem}</span>
              {activity.challengeId !== '--' && <span className="text-xs text-slate-500 font-mono">{activity.challengeId}</span>}
              {activity.highlight && <span className="badge-status bg-saffron-500/20 text-saffron-400">Active</span>}
            </div>
            <h3 className="mt-1.5 text-sm font-semibold text-white leading-snug">{activity.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{activity.sponsor}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className={`badge-status ${submission.color}`}><SubmitIcon className="w-3 h-3 mr-1" />{submission.label}</span>
            {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><IndianRupee className="w-3 h-3" />{activity.budgetCr ? `${activity.budgetCr} Cr` : 'TBD'}</span>
          <span className="flex items-center gap-1"><Building className="w-3 h-3" />{activity.entity}</span>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-4 border-t border-navy-500/20 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-slate-500">Sponsor:</span><span className="ml-1 text-slate-300">{activity.sponsorFull}</span></div>
            <div><span className="text-slate-500">Partner:</span><span className="ml-1 text-slate-300">{activity.partner}</span></div>
            <div><span className="text-slate-500">Proposal:</span><span className={`ml-1 badge-status ${statusConfig[activity.proposalStatus]?.color || 'text-slate-300'}`}>{statusConfig[activity.proposalStatus]?.label || activity.proposalStatus}</span></div>
            <div><span className="text-slate-500">Submission:</span><span className={`ml-1 badge-status ${submission.color}`}>{submission.label}</span></div>
          </div>
          {activity.notes && (
            <div className="flex gap-2 text-xs">
              <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-400">{activity.notes}</p>
            </div>
          )}
          {activity.timeline && activity.timeline.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Timeline</p>
              <div className="pl-2 border-l border-navy-500/30 space-y-1">
                {activity.timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${i === activity.timeline.length - 1 ? submission.dot : 'bg-slate-600'}`} />
                    <span className="text-slate-500 font-mono w-16 flex-shrink-0">{item.date}</span>
                    <span className="text-slate-300">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, subvalue, color }) {
  const colors = {
    saffron: 'border-saffron-500/30 text-saffron-500',
    emerald: 'border-emerald-500/30 text-emerald-400',
    amber: 'border-amber-500/30 text-amber-400',
    blue: 'border-blue-500/30 text-blue-400',
  }
  return (
    <div className={`card-glass p-4 border-t-2 ${colors[color]?.split(' ')[0] || ''}`}>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color]?.split(' ')[1] || 'text-white'}`}>{value}</p>
      {subvalue && <p className="text-xs text-slate-500 mt-0.5">{subvalue}</p>}
    </div>
  )
}

export default function PortfolioTracker() {
  const { activities, summary } = portfolioData
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? activities : activities.filter(a => {
    if (filter === 'active') return ['submitted', 'in-progress', 'unconfirmed', 'preliminary'].includes(a.submissionStatus)
    if (filter === 'submitted') return a.submissionStatus === 'submitted'
    return a.ecosystem.toLowerCase().includes(filter.toLowerCase())
  })
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'submitted', label: 'Submitted' },
    { key: 'DRISHTI', label: 'DRISHTI' },
    { key: 'ADITI', label: 'ADITI' },
    { key: 'DRDO', label: 'DRDO TDF' },
  ]
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard label="Total Activities" value={summary.totalActivities} color="saffron" />
        <SummaryCard label="Submitted" value={summary.submitted} color="emerald" />
        <SummaryCard label="In Progress" value={summary.inProgress} color="amber" />
        <SummaryCard label="Portfolio Floor" value={`INR ${summary.portfolioFloorCr} Cr`} subvalue={`~$${summary.portfolioFloorUSD}`} color="blue" />
      </div>
      <div className="card-glass p-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-6 bg-saffron-500 rounded-full" />
          <h2 className="text-lg font-bold text-white">Proposal Portfolio</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === f.key ? 'bg-saffron-500 text-navy-900' : 'bg-navy-700 text-slate-400 hover:text-white hover:bg-navy-600'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map(activity => <ActivityCard key={activity.id} activity={activity} />)}
      </div>
    </div>
  )
}
