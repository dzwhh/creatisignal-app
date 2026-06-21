"use client"

import { use, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Edit3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Topbar } from "@/components/layout/topbar"
import {
  DASHBOARD_MOCK,
  PLATFORMS,
  PLATFORM_ACCOUNTS,
  SCENARIOS,
  type PlatformId,
} from "@/lib/insights/auto-report-data"
import { PlatformLogo, PlatformLogoTile } from "@/components/insights/auto-report/platform-logo"
import { ConfigDrawer, type AccountStateMap, type PlatformAccountState } from "@/components/insights/auto-report/config-drawer"
import { addReport } from "@/lib/insights/reports-store"

type SearchParams = { scenario?: string; nl?: string }

export default function PreviewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = use(searchParams)
  const scenarioId = params.scenario || "gmv_max_product_daily"
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0]

  const router = useRouter()

  // ─── Config state（初始来自 scenario 默认） ──────────────────────────────
  const [accountState, setAccountState] = useState<AccountStateMap>(() => {
    const initial: Partial<AccountStateMap> = {}
    for (const p of scenario.platforms) {
      const accounts = PLATFORM_ACCOUNTS[p] || []
      const entry: PlatformAccountState = {
        mode: "list",
        list: new Set(accounts.filter((a) => a.status === "active").map((a) => a.id)),
        manual: "",
        upload: [],
      }
      initial[p] = entry
    }
    return initial as AccountStateMap
  })
  const [segments, setSegments] = useState<Set<string>>(() => new Set(scenario.segments))
  const [metrics, setMetrics] = useState<Set<string>>(() => new Set(scenario.metrics))
  const [reportName, setReportName] = useState<string>(
    `${scenario.defaultName} · ${new Date().toISOString().slice(0, 10)}`
  )

  const [authExpanded, setAuthExpanded] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)
  const [generatedReportId, setGeneratedReportId] = useState<string | null>(null)

  const pendingPlatforms = useMemo(
    () => scenario.platforms.filter((p) => !PLATFORMS.find((x) => x.id === p)?.connected),
    [scenario.platforms]
  )
  const allConnected = pendingPlatforms.length === 0

  function handleGenerate() {
    const item = addReport({
      name: reportName,
      description: scenario.description,
      template: scenario.id,
      platform: scenario.platforms.join(","),
      folderId: "folder_default",
    })
    setGeneratedReportId(item.id)
    setSuccessOpen(true)
  }

  function handleViewReport() {
    setSuccessOpen(false)
    router.push(`/insights?report=${generatedReportId ?? ""}`)
  }

  const platformNames = scenario.platforms.map((p) => PLATFORMS.find((x) => x.id === p)?.name).join(" × ")

  return (
    <>
      <Topbar title="自定义报表" />
      <main className="flex-1 overflow-y-auto bg-[var(--soft-2)]/30">
        {/* Sticky header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[var(--line)]">
          <div className="max-w-[1180px] mx-auto px-8 py-4 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => router.push("/insights/custom-report")}
                className="text-[11px] text-[var(--muted)] hover:text-[var(--text)] mb-1.5 inline-flex items-center gap-1 cursor-pointer"
              >
                <ChevronDown size={13} className="rotate-90" />
                返回
              </button>
              <h1 className="text-[18px] font-semibold tracking-tight text-[var(--text)] truncate">{reportName}</h1>
              <p className="text-[11.5px] text-[var(--muted)] mt-1">
                {platformNames} · 最近 30 天 · {scenario.name}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 h-10 text-[13px] font-medium rounded-md border border-[var(--line)] bg-white hover:bg-[var(--soft-2)] transition cursor-pointer"
              >
                <Edit3 size={13} strokeWidth={1.8} />
                修改配置
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="inline-flex items-center gap-1.5 px-4 h-10 text-[13px] font-medium rounded-md bg-[var(--near-black)] text-white hover:opacity-90 transition cursor-pointer"
              >
                <Check size={14} strokeWidth={2.4} />
                生成报表
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-[1180px] mx-auto px-8 py-6">
          <AuthorizationPanel
            platforms={scenario.platforms}
            allConnected={allConnected}
            expanded={authExpanded}
            onToggle={() => setAuthExpanded((v) => !v)}
          />
          <DashboardPreview platforms={scenario.platforms} />
        </div>
      </main>

      {/* Configuration Drawer (3-step wizard) */}
      <ConfigDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        scenario={scenario}
        reportName={reportName}
        onReportNameChange={setReportName}
        accountState={accountState}
        onAccountStateChange={setAccountState}
        segments={segments}
        onSegmentsChange={setSegments}
        metrics={metrics}
        onMetricsChange={setMetrics}
      />

      {/* Success Modal */}
      <SuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        reportName={reportName}
        platforms={platformNames}
        onView={handleViewReport}
      />
    </>
  )
}

// ─── Authorization Panel ────────────────────────────────────────────────────

function AuthorizationPanel({
  platforms,
  allConnected,
  expanded,
  onToggle,
}: {
  platforms: PlatformId[]
  allConnected: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const tone = allConnected
    ? "border-emerald-200 bg-emerald-50/70"
    : "border-red-200 bg-red-50/70"
  const iconTone = allConnected ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
  const title = allConnected ? "数据源已授权成功" : "数据源未授权"
  const desc = allConnected
    ? `已连接 ${platforms.length} 个平台，可直接生成报表`
    : "请完成全部数据源授权后再生成报表"
  return (
    <div className={cn("mb-5 border rounded-lg overflow-hidden", tone)}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full px-4 py-3.5 flex items-center gap-3 text-left hover:bg-white/30 transition cursor-pointer"
      >
        <span className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", iconTone)}>
          <Check size={14} strokeWidth={2.5} />
        </span>
        <span className="flex-1 min-w-0">
          <span className={cn("block text-[13px] font-semibold", allConnected ? "text-emerald-900" : "text-red-900")}>
            {title}
          </span>
          <span className={cn("block text-[11.5px] mt-0.5", allConnected ? "text-emerald-700" : "text-red-700")}>
            {desc}
          </span>
        </span>
        <span className="flex -space-x-1.5 mr-2">
          {platforms.map((p) => (
            <span
              key={p}
              className="w-7 h-7 border border-[var(--line)] rounded-md bg-white inline-flex items-center justify-center"
              style={{ boxShadow: "0 0 0 2px white" }}
            >
              <PlatformLogo id={p} size={14} />
            </span>
          ))}
        </span>
        <ChevronDown size={14} className={cn("transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded && (
        <div className={cn("border-t bg-white px-4", allConnected ? "border-emerald-200" : "border-red-200")}>
          {platforms.map((pid) => {
            const platform = PLATFORMS.find((p) => p.id === pid)
            if (!platform) return null
            const accounts = PLATFORM_ACCOUNTS[pid] || []
            return (
              <div key={pid} className="flex items-center gap-3 py-3 border-b border-[var(--line)] last:border-b-0">
                <PlatformLogoTile id={pid} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--text)]">{platform.name}</div>
                  <div className="text-[11.5px] text-[var(--muted)] mt-0.5">{accounts.length} 个可用账户</div>
                </div>
                {platform.connected ? (
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-emerald-700 font-medium">
                    <CheckCircle2 size={12} strokeWidth={2.4} />
                    已授权
                  </span>
                ) : (
                  <button
                    type="button"
                    className="h-9 px-3 text-[11.5px] font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
                  >
                    立即授权
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Dashboard Preview ─────────────────────────────────────────────────────

function chartPoints(values: number[], w: number, h: number, padding = 10): string {
  const max = Math.max(...values)
  const min = Math.min(...values)
  return values
    .map((value, i) => {
      const x = padding + i * ((w - padding * 2) / (values.length - 1))
      const y = padding + (max - value) * ((h - padding * 2) / Math.max(1, max - min))
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
}

function DashboardPreview({ platforms }: { platforms: PlatformId[] }) {
  const data = DASHBOARD_MOCK
  const currentPts = chartPoints(data.trend.current, 760, 220, 14)
  const previousPts = chartPoints(data.trend.previous, 760, 220, 14)
  const gradient = data.distribution
    .reduce<string[]>((acc, item, i, arr) => {
      const start = arr.slice(0, i).reduce((s, e) => s + e.value, 0)
      const end = start + item.value
      acc.push(`${item.color} ${start}% ${end}%`)
      return acc
    }, [])
    .join(", ")

  const platformNames = platforms.map((p) => PLATFORMS.find((x) => x.id === p)?.name).join("、")

  return (
    <section className="bg-white border border-[var(--line)] rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--text)]">Report Preview · Comprehensive Dashboard</h2>
          <p className="text-[11.5px] text-[var(--muted)] mt-1">{platformNames} · 最近 30 天 · 每日同步</p>
        </div>
        <span className="text-[11px] px-2 py-1 bg-[var(--soft)] text-[var(--muted)] rounded">演示数据</span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-6 gap-3 mb-5">
          {data.kpis.map((kpi) => (
            <article key={kpi.label} className="border border-[var(--line)] rounded-md p-3.5 min-w-0">
              <div className="text-[11.5px] text-[var(--muted)] truncate">{kpi.label}</div>
              <div className="text-[19px] font-semibold tracking-tight mt-1.5 text-[var(--text)] tabular-nums">{kpi.value}</div>
              <div className={cn("text-[11px] mt-2 tabular-nums", kpi.up ? "text-emerald-600" : "text-red-600")}>
                {kpi.up ? "↑" : "↓"} {kpi.change} <span className="text-[var(--muted)]">较上期</span>
              </div>
            </article>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <article className="col-span-2 border border-[var(--line)] rounded-md p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[13px] font-semibold text-[var(--text)]">GMV 趋势</h3>
                <p className="text-[11.5px] text-[var(--muted)] mt-0.5">按日对比本期与上期</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[var(--muted)]">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-[var(--text)]" /> 本期
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-slate-400" /> 上期
                </span>
              </div>
            </div>
            <div className="relative h-[250px] pl-10 pb-6">
              <div className="absolute left-0 top-1 bottom-6 flex flex-col justify-between text-[10px] text-[var(--muted)]">
                <span>$120K</span>
                <span>$90K</span>
                <span>$60K</span>
                <span>$30K</span>
                <span>$0</span>
              </div>
              <div
                className="h-full rounded-sm"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(228,228,231,.7) 1px, transparent 1px), linear-gradient(to bottom, rgba(228,228,231,.7) 1px, transparent 1px)",
                  backgroundSize: "14.285% 100%, 100% 25%",
                }}
              >
                <svg viewBox="0 0 760 220" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <polyline points={previousPts} fill="none" stroke="#94A3B8" strokeWidth={2} strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
                  <polyline points={currentPts} fill="none" stroke="#111827" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <div className="absolute left-10 right-0 bottom-0 flex justify-between text-[10px] text-[var(--muted)]">
                {data.trend.labels.map((l) => (
                  <span key={l}>{l}</span>
                ))}
              </div>
            </div>
          </article>

          <article className="border border-[var(--line)] rounded-md p-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--text)]">投放类型分布</h3>
              <p className="text-[11.5px] text-[var(--muted)] mt-0.5">按花费占比</p>
            </div>
            <div className="flex items-center justify-center py-5">
              <div className="relative w-36 h-36 rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
                <div className="absolute inset-5 rounded-full bg-white flex flex-col items-center justify-center">
                  <span className="text-[11px] text-[var(--muted)]">总花费</span>
                  <b className="text-[15px] mt-0.5 text-[var(--text)]">$324.8K</b>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {data.distribution.map((d) => (
                <div key={d.label} className="flex items-center justify-between gap-2 text-[11.5px]">
                  <span className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
                    <span className="truncate text-[var(--text)]">{d.label}</span>
                  </span>
                  <b className="text-[var(--text)] tabular-nums">{d.value}%</b>
                </div>
              ))}
            </div>
          </article>
        </div>

        <article className="border border-[var(--line)] rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-semibold text-[var(--text)]">商品 × 素材明细</h3>
              <p className="text-[11.5px] text-[var(--muted)] mt-0.5">按 Cost 从高到低，展示前 7 个商品素材组合</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px]">
              <thead className="bg-[var(--soft)]/40">
                <tr>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[var(--muted)]">商品</th>
                  <th className="text-left px-4 py-2.5 text-[11px] font-medium text-[var(--muted)]">素材</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-medium text-[var(--muted)]">Cost</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-medium text-[var(--muted)]">Orders</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-medium text-[var(--muted)]">Gross Revenue</th>
                  <th className="text-right px-4 py-2.5 text-[11px] font-medium text-[var(--muted)]">ROI</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i} className="border-t border-[var(--line)] hover:bg-[var(--soft-2)]/40 transition">
                    <td className="px-4 py-3 text-[12px] font-medium text-[var(--text)]">{row.product}</td>
                    <td className="px-4 py-3 text-[11.5px] text-[var(--muted)]">{row.creative}</td>
                    <td className="px-4 py-3 text-[12px] text-right tabular-nums">{row.cost}</td>
                    <td className="px-4 py-3 text-[12px] text-right tabular-nums text-[var(--muted)]">{row.orders}</td>
                    <td className="px-4 py-3 text-[12px] text-right tabular-nums">{row.gmv}</td>
                    <td className="px-4 py-3 text-[12px] text-right tabular-nums font-medium">{row.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  )
}

// ─── Success Modal ─────────────────────────────────────────────────────────

function SuccessModal({
  open,
  onClose,
  reportName,
  platforms,
  onView,
}: {
  open: boolean
  onClose: () => void
  reportName: string
  platforms: string
  onView: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[70] data-[state=open]:animate-in data-[state=open]:fade-in-0 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[75] w-[440px] bg-white border border-[var(--line)] rounded-lg shadow-lg p-6 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="w-10 h-10 bg-[var(--soft)] rounded-full flex items-center justify-center mb-4">
            <Check size={18} strokeWidth={2.5} className="text-[var(--text)]" />
          </div>
          <Dialog.Title className="text-[17px] font-semibold tracking-tight mb-1 text-[var(--text)]">
            报表已创建
          </Dialog.Title>
          <Dialog.Description className="text-[12.5px] text-[var(--muted)] mb-5">
            配置已保存，首次数据同步正在进行
          </Dialog.Description>
          <div className="border border-[var(--line)] rounded-md p-3 mb-5 text-[12.5px] space-y-1.5">
            <div className="flex justify-between gap-3">
              <span className="text-[var(--muted)]">报表名称</span>
              <span className="font-medium text-[var(--text)] truncate text-right">{reportName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--muted)]">数据源</span>
              <span className="font-medium text-[var(--text)] text-right">{platforms}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--muted)]">首次同步</span>
              <span className="font-medium text-[var(--text)]">已开始 · 预计 2 分钟</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex-1 px-4 h-10 border border-[var(--line)] rounded-md text-[13px] hover:bg-[var(--soft-2)] transition cursor-pointer"
              >
                留在这里
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onView}
              className="flex-1 px-4 h-10 bg-[var(--near-black)] text-white rounded-md text-[13px] hover:opacity-90 font-medium transition cursor-pointer"
            >
              查看最近报表
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
