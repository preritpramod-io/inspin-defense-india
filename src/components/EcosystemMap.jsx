import { useState } from 'react'
import { ChevronDown, ChevronRight, Building2, Landmark, FlaskConical, Factory, Zap, Target, Star, Globe } from 'lucide-react'

const ecosystemData = {
  name: 'Ministry of Defence', abbr: 'MoD', icon: 'Landmark', color: 'saffron',
  description: 'Government of India',
  children: [
    {
      name: 'Defence Innovation Organisation', abbr: 'DIO', icon: 'Zap', color: 'blue',
      description: 'Section 8 company (HAL + BEL). Implements the iDEX framework.',
      children: [{
        name: 'Innovations for Defence Excellence', abbr: 'iDEX', icon: 'Star', color: 'amber',
        description: 'Framework for engaging startups, MSMEs, and innovators to develop defence technologies.',
        children: [
          { name: 'DISC', fullName: 'Defence India Startup Challenge', grant: 'Up to INR 1.5 Cr', grantNote: 'Via SPARK framework, 50% matching', mechanism: 'Specific problem statements from Armed Forces', editions: 'DISC 1 through DISC 14', latest: 'DISC 14 (82 PS, closed May 2026)', color: 'sky' },
          { name: 'iDEX PRIME', fullName: 'iDEX Prime Challenges', grant: 'Up to INR 10 Cr', grantNote: 'Enhanced DISC for higher-value innovations', mechanism: 'Specific problem statements, elevated grant', editions: 'PRIME, PRIME X, PRIME SPRINT', latest: 'PRIME X (13 PS, closed Dec 2024)', color: 'violet' },
          { name: 'ADITI', fullName: 'Acing Development of Innovative Technologies with iDEX', grant: 'Up to INR 25 Cr', grantNote: '50% of Product Development Budget, deep-tech focus', mechanism: 'Critical and strategic defence technologies', editions: 'ADITI 1.0 through ADITI 4.0', latest: 'ADITI 4.0 (25 PS, closed May 2026)', color: 'rose', highlight: true },
          { name: 'DRISHTI', fullName: 'DPSU-driven Research & Innovation for Strategic and High-impact Technology Integration', grant: 'Up to INR 10 Cr', grantNote: 'Funded and managed by respective DPSU', mechanism: '101 problem statements from 16 DPSUs', editions: 'First edition (2026)', latest: '101 PS from HAL, BEL, BEML, AVNL, etc.', color: 'emerald', highlight: true },
          { name: 'Open Challenge', fullName: 'iDEX Open Challenge', grant: 'Up to INR 1.5 Cr', grantNote: 'Via SPARK framework, suo-moto innovations', mechanism: 'Self-proposed innovations with defence/aerospace applicability', editions: 'Rolling / periodic', latest: 'Open Challenge (deadline varies)', color: 'cyan' },
        ],
      }],
    },
    {
      name: 'Defence Public Sector Undertakings', abbr: 'DPSUs', icon: 'Factory', color: 'green',
      description: '16 entities: HAL, BEL, BEML, BDL, GRSE, GSL, HSL, MDL, MIDHANI, AVNL, GIL, TCL, MIL, IOL, AWEIL, YIL.',
      children: [],
    },
    {
      name: 'Defence Research & Development Organisation', abbr: 'DRDO', icon: 'FlaskConical', color: 'purple',
      description: 'Premier R&D agency of the Ministry of Defence.',
      children: [{
        name: 'Technology Development Fund', abbr: 'TDF', icon: 'Target', color: 'orange',
        description: 'Up to INR 50 Cr, 90% Grant-in-Aid. Open-ended proposals. TRL 3+. Focus on MSMEs and startups. Duration 2-4 years.',
        children: [], isScheme: true, grant: 'Up to INR 50 Cr', grantNote: '90% grant-in-aid, 10% industry contribution',
      }],
    },
  ],
}

const iconMap = { Landmark, Building2, FlaskConical, Factory, Zap, Target, Star, Globe }
const colorMap = {
  saffron: { bg: 'bg-saffron-500/10', border: 'border-saffron-500/30', text: 'text-saffron-500', badge: 'bg-saffron-500/20 text-saffron-400' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
  green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-300' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
}

function SchemeCard({ scheme }) {
  const [expanded, setExpanded] = useState(false)
  const c = colorMap[scheme.color] || colorMap.blue
  return (
    <div className={`${c.bg} border ${c.border} rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.01] ${scheme.highlight ? 'ring-1 ring-offset-1 ring-offset-navy-800 ring-saffron-500/30' : ''}`}
      onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`badge-status ${c.badge}`}>{scheme.name}</span>
          <span className="text-xs text-slate-500">{scheme.grant}</span>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </div>
      {expanded && (
        <div className="mt-3 space-y-2 text-sm">
          <p className={`font-medium ${c.text}`}>{scheme.fullName}</p>
          <p className="text-slate-400">{scheme.mechanism}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-slate-500">Grant:</span><span className="ml-1 text-slate-300">{scheme.grant}</span></div>
            <div><span className="text-slate-500">Note:</span><span className="ml-1 text-slate-300">{scheme.grantNote}</span></div>
            <div><span className="text-slate-500">Editions:</span><span className="ml-1 text-slate-300">{scheme.editions}</span></div>
            <div><span className="text-slate-500">Latest:</span><span className="ml-1 text-slate-300">{scheme.latest}</span></div>
          </div>
        </div>
      )}
    </div>
  )
}

function OrgNode({ node, depth = 0 }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const Icon = iconMap[node.icon] || Building2
  const c = colorMap[node.color] || colorMap.blue
  const hasChildren = node.children && node.children.length > 0
  const hasSchemes = node.children && node.children.some(ch => ch.fullName)
  return (
    <div className={depth > 0 ? 'ml-4 mt-3' : ''}>
      <div className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.03] ${depth === 0 ? 'bg-navy-700/40 border border-navy-500/20' : ''}`}
        onClick={() => setExpanded(!expanded)}>
        {depth > 0 && <div className="mt-1 w-px h-4 bg-navy-500/30 -ml-2 mr-1" />}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">{node.abbr || node.name}</span>
            {node.abbr && <span className="text-xs text-slate-500 truncate">{node.name}</span>}
            {hasChildren && (expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />)}
          </div>
          {node.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{node.description}</p>}
          {node.isScheme && node.grant && (
            <div className="mt-2 flex gap-2">
              <span className={`badge-status ${c.badge}`}>{node.grant}</span>
              <span className="text-xs text-slate-500 self-center">{node.grantNote}</span>
            </div>
          )}
        </div>
      </div>
      {expanded && hasChildren && (
        <div className={`${depth === 0 ? 'pl-4 border-l border-navy-500/20 ml-6' : 'pl-2 border-l border-navy-500/15 ml-6'}`}>
          {hasSchemes
            ? <div className="mt-3 space-y-2">{node.children.map((s, i) => s.fullName ? <SchemeCard key={i} scheme={s} /> : <OrgNode key={i} node={s} depth={depth + 1} />)}</div>
            : node.children.map((child, i) => <OrgNode key={i} node={child} depth={depth + 1} />)
          }
        </div>
      )}
    </div>
  )
}

export default function EcosystemMap() {
  return (
    <div className="card-glass p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-saffron-500 rounded-full" />
        <h2 className="text-lg font-bold text-white">Defence Innovation Ecosystem</h2>
      </div>
      <p className="text-xs text-slate-500 mb-4">Structure of India's defence innovation funding landscape. Click to expand.</p>
      <OrgNode node={ecosystemData} />
    </div>
  )
}
