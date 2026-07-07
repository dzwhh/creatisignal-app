"use client"

import { ArrowDown, BarChart3, CircleCheck, TrendingDown } from "lucide-react"

// ─── A. 生命周期趋势 ───────────────────────────────────────────────────────

export function LifecycleCurveSection({ className }: { className?: string }) {
  const W = 880
  const H = 320
  const padL = 56
  const padR = 40
  const padT = 36
  const padB = 56

  // 曲线关键点
  const tStart = { x: padL, y: H - padB - 4 }
  const peak   = { x: padL + (W - padL - padR) * 0.42, y: padT + 14 }
  const tDecay = { x: padL + (W - padL - padR) * 0.74, y: padT + 80 }
  const tEnd   = { x: W - padR, y: H - padB - 8 }

  const curve = `M ${tStart.x} ${tStart.y}
                 C ${tStart.x + 160} ${tStart.y}, ${peak.x - 120} ${peak.y + 20}, ${peak.x} ${peak.y}
                 S ${tDecay.x - 40} ${tDecay.y - 10}, ${tDecay.x} ${tDecay.y}
                 S ${tEnd.x - 80} ${tEnd.y - 20}, ${tEnd.x} ${tEnd.y}`

  const currentNode = { x: padL + (W - padL - padR) * 0.68, y: padT + 60 }

  return (
    <section className={`rounded-lg border border-[var(--line)] bg-white p-5 ${className ?? ""}`}>
      <h3 className="text-sm font-semibold text-[var(--text)] mb-2">生命周期趋势</h3>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lc-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor="#3b82f6" />
              <stop offset="45%"  stopColor="#10b981" />
              <stop offset="75%"  stopColor="#84cc16" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <marker id="lc-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3.5" orient="auto">
              <path d="M0,0 L6,3.5 L0,7 Z" fill="#71717a" />
            </marker>
          </defs>

          <line x1={padL} y1={padT - 6} x2={padL} y2={H - padB} stroke="#a1a1aa" strokeWidth="1" />
          <line x1={padL - 6} y1={H - padB} x2={W - padR + 6} y2={H - padB} stroke="#a1a1aa" strokeWidth="1" markerEnd="url(#lc-arrow)" />
          <line x1={padL} y1={padT} x2={padL} y2={padT - 6} stroke="#a1a1aa" strokeWidth="1" markerEnd="url(#lc-arrow)" />

          <text x={padL - 32} y={padT - 8} fontSize="13" fill="#3f3f46" fontWeight="500">效果</text>
          <text x={W - padR + 10} y={H - padB + 4} fontSize="13" fill="#3f3f46" fontWeight="500">时间</text>

          <text x={tStart.x} y={H - padB + 20} fontSize="11" fill="#71717a" textAnchor="middle">T0</text>
          <text x={peak.x}   y={H - padB + 20} fontSize="11" fill="#71717a" textAnchor="middle">T_peak</text>
          <text x={tDecay.x} y={H - padB + 20} fontSize="11" fill="#71717a" textAnchor="middle">T_decay</text>

          <path d={curve} fill="none" stroke="url(#lc-stroke)" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />

          <circle cx={peak.x} cy={peak.y} r={6} fill="#10b981" stroke="white" strokeWidth={2} />
          <text x={peak.x} y={peak.y - 16} fontSize="12" fill="#0f766e" fontWeight="600" textAnchor="middle">爆款拐点</text>

          <path
            d={`M ${peak.x - 90} ${peak.y + 70} Q ${peak.x - 50} ${peak.y + 50}, ${peak.x - 30} ${peak.y + 24}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            markerEnd="url(#lc-arrow)"
            opacity="0.55"
          />

          <text x={currentNode.x} y={currentNode.y - 24} fontSize="12" fill="#3f3f46" fontWeight="500" textAnchor="middle">当前节点</text>
          <line
            x1={currentNode.x}
            y1={currentNode.y - 18}
            x2={currentNode.x}
            y2={currentNode.y - 4}
            stroke="#52525b"
            strokeWidth="1.5"
            markerEnd="url(#lc-arrow)"
          />
          <circle cx={currentNode.x} cy={currentNode.y} r={4} fill="white" stroke="#52525b" strokeWidth={1.8} />
        </svg>

        <div className="absolute" style={{ left: "12%", top: "58%" }}>
          <div className="flex items-center gap-2 rounded-md bg-white border border-[#bfdbfe] shadow-sm px-2.5 py-1.5">
            <span className="inline-flex items-center h-4 px-1.5 rounded text-[9.5px] font-medium bg-[#3b82f6] text-white">
              预测
            </span>
            <div>
              <p className="text-[11.5px] font-medium text-[var(--text)] leading-tight">爆款预测窗口</p>
              <p className="text-[10.5px] text-[var(--muted)] leading-tight mt-0.5">T0 + 3 即可判断潜力</p>
            </div>
          </div>
        </div>

        <div className="absolute" style={{ right: "7%", top: "26%" }}>
          <div className="flex items-center gap-2 rounded-md bg-white border border-[#fed7aa] shadow-sm px-2.5 py-1.5">
            <span className="inline-flex items-center h-4 px-1.5 rounded text-[9.5px] font-medium bg-[#f59e0b] text-white">
              预警
            </span>
            <div>
              <p className="text-[11.5px] font-medium text-[var(--text)] leading-tight">衰退预警窗口</p>
              <p className="text-[10.5px] text-[var(--muted)] leading-tight mt-0.5">T_peak + 3 信号出现</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <PhaseCard icon={BarChart3}     name="爬坡期" desc="3-7 天建立表现趋势"   color="#3b82f6" bg="#eff6ff" />
        <PhaseCard icon={CircleCheck}   name="成熟期" desc="稳定放量，确认峰值"   color="#10b981" bg="#ecfdf5" />
        <PhaseCard icon={TrendingDown}  name="衰退期" desc="识别疲劳，切换新素材" color="#f59e0b" bg="#fff7ed" />
      </div>
    </section>
  )
}

function PhaseCard({
  icon: Icon,
  name,
  desc,
  color,
  bg,
}: {
  icon: typeof BarChart3
  name: string
  desc: string
  color: string
  bg: string
}) {
  return (
    <div className="rounded-md overflow-hidden" style={{ backgroundColor: bg }}>
      <div className="px-4 py-3 flex items-center gap-3">
        <span className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 bg-white" style={{ color }}>
          <Icon size={16} strokeWidth={1.8} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color }}>{name}</p>
          <p className="text-[11.5px] text-[var(--muted)] mt-0.5 leading-tight">{desc}</p>
        </div>
        <ArrowDown size={12} strokeWidth={1.8} style={{ color: color, opacity: 0.5 }} className="-rotate-90" />
      </div>
      <div className="h-[3px]" style={{ backgroundColor: color }} />
    </div>
  )
}
