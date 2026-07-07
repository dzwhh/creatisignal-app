"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  CheckCircle2,
  Cog,
  Plug,
  RefreshCw,
  Zap,
} from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { cn } from "@/lib/utils"

type Status = "connected" | "needs_reauth" | "disconnected"

type ConnectorMeta = {
  id: "tiktok" | "meta" | "google"
  name: string
  category: string
  brandColor: string
  initial: string
  description: string
}

type ConnectorState = {
  id: ConnectorMeta["id"]
  status: Status
  accounts: number          // 已授权广告账户数 (mock，仅 KPI 汇总用)
  rowsToday?: number        // 当日抓取的数据行数 (mock，仅 KPI 汇总用)
}

const CONNECTORS: ConnectorMeta[] = [
  {
    id: "tiktok",
    name: "TikTok Ads",
    category: "Performance Ads · Spark Ads · GMV Max",
    brandColor: "#000000",
    initial: "TT",
    description: "拉取 TikTok Ads Manager 的素材表现、GMV Max 自动投放与 Spark Ads 数据。",
  },
  {
    id: "meta",
    name: "Meta Ads",
    category: "Facebook · Instagram · Audience Network",
    brandColor: "#1877F2",
    initial: "M",
    description: "覆盖 Facebook / Instagram / Reels 投放，含创意、受众、转化与 CAPI。",
  },
  {
    id: "google",
    name: "Google Ads",
    category: "Search · Display · YouTube · PMax",
    brandColor: "#4285F4",
    initial: "G",
    description: "导入 Google Ads 全渠道数据，包含 Performance Max 与 YouTube Shorts 投放。",
  },
]

const INITIAL_STATES: ConnectorState[] = [
  { id: "tiktok", status: "connected",     accounts: 6, rowsToday: 24830 },
  { id: "meta",   status: "needs_reauth",  accounts: 3, rowsToday: 0     },
  { id: "google", status: "disconnected",  accounts: 0                   },
]

const STATUS_META: Record<Status, { label: string; dot: string; bg: string; text: string }> = {
  connected:     { label: "已连接",     dot: "#16a34a", bg: "#dcfce7", text: "#15803d" },
  needs_reauth:  { label: "需要重连",   dot: "#f59e0b", bg: "#fff7ed", text: "#9a3412" },
  disconnected:  { label: "未连接",     dot: "#a1a1aa", bg: "#f4f4f5", text: "#52525b" },
}

export default function DataSourcesPage() {
  const [states, setStates] = useState<ConnectorState[]>(INITIAL_STATES)

  const summary = useMemo(() => {
    const connected = states.filter((s) => s.status === "connected").length
    const reauth = states.filter((s) => s.status === "needs_reauth").length
    const accounts = states.reduce((sum, s) => sum + s.accounts, 0)
    const rowsToday = states.reduce((sum, s) => sum + (s.rowsToday ?? 0), 0)
    return { connected, reauth, accounts, rowsToday }
  }, [states])

  function patch(id: ConnectorState["id"], patch: Partial<ConnectorState>) {
    setStates((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  function connect(id: ConnectorState["id"]) {
    patch(id, { status: "connected", accounts: id === "google" ? 4 : 5, rowsToday: 0 })
  }
  function reauth(id: ConnectorState["id"]) {
    patch(id, { status: "connected" })
  }
  function sync(_id: ConnectorState["id"]) {
    // mock: 真实环境下会触发一次拉取请求
  }

  return (
    <>
      <Topbar title="数据源管理" />
      <SettingsShell
        title="数据源管理"
        subtitle="通过 OAuth 连接广告平台后，CreatiSignal 会自动同步素材、账户与花费数据。"
      >
        {/* 汇总 KPI */}
        <SettingsCard
          icon={Activity}
          title="数据源概览"
          description="所有平台连接器的实时状态。"
          actions={
            <button
              type="button"
              onClick={() => states.filter((s) => s.status === "connected").forEach((s) => sync(s.id))}
              className="h-9 px-3.5 rounded-full border border-[var(--line)] text-[12px] font-bold text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw size={11} strokeWidth={2.4} />
              全部同步
            </button>
          }
        >
          <div className="grid grid-cols-4 gap-3">
            <SummaryStat label="已连接平台" value={`${summary.connected} / ${CONNECTORS.length}`} accent="ok" />
            <SummaryStat label="需要重连"   value={summary.reauth.toString()} accent={summary.reauth > 0 ? "warn" : "neutral"} />
            <SummaryStat label="已授权账户" value={summary.accounts.toString()} />
            <SummaryStat label="今日抓取行" value={formatRows(summary.rowsToday)} />
          </div>
        </SettingsCard>

        {/* 平台连接器卡片 */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-[13.5px] font-extrabold text-[var(--text)]">平台连接器</h3>
            <p className="text-[11.5px] text-[var(--muted)]">支持 OAuth 一键授权 · 自动续期</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CONNECTORS.map((meta) => {
              const state = states.find((s) => s.id === meta.id)!
              return (
                <ConnectorCard
                  key={meta.id}
                  meta={meta}
                  state={state}
                  onConnect={() => connect(meta.id)}
                  onReauth={() => reauth(meta.id)}
                  onSync={() => sync(meta.id)}
                />
              )
            })}
          </div>
        </section>

        {/* 同步规则说明 */}
        <SettingsCard
          icon={Zap}
          title="同步规则"
          description="所有数据源遵循统一的同步与重试策略。"
        >
          <ul className="space-y-2 text-[12.5px] text-[var(--text)]">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-[#16a34a] mt-0.5 shrink-0" strokeWidth={2.4} />
              <span>OAuth Token 在到期前 7 天自动刷新；刷新失败会标记为「需要重连」并发送通知。</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-[#16a34a] mt-0.5 shrink-0" strokeWidth={2.4} />
              <span>近 30 天数据会全量回填，30 天前数据按需懒加载。</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={12} className="text-[#16a34a] mt-0.5 shrink-0" strokeWidth={2.4} />
              <span>失败请求按 30s / 2min / 10min 三档指数回退；连续失败 5 次会暂停该数据源。</span>
            </li>
          </ul>
        </SettingsCard>
      </SettingsShell>
    </>
  )
}

// ─── Connector card ──────────────────────────────────────────────────────────

function ConnectorCard({
  meta,
  state,
  onConnect,
  onReauth,
  onSync,
}: {
  meta: ConnectorMeta
  state: ConnectorState
  onConnect: () => void
  onReauth: () => void
  onSync: () => void
}) {
  const reauthNeeded = state.status === "needs_reauth"

  return (
    <article className="rounded-2xl border border-[var(--line)] bg-white p-5 flex flex-col">
      {/* Brand header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-[14px] font-extrabold shrink-0"
            style={{ backgroundColor: meta.brandColor }}
          >
            {meta.initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-extrabold text-[var(--text)] truncate">{meta.name}</p>
            <p className="text-[11px] text-[var(--muted)] truncate">{meta.category}</p>
          </div>
        </div>
        <div className="shrink-0">
          <StatusPill status={state.status} />
        </div>
      </div>

      <p className="text-[12px] text-[var(--muted)] leading-relaxed mb-4 line-clamp-3">{meta.description}</p>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto min-w-0">
        {state.status === "disconnected" ? (
          <button
            type="button"
            onClick={onConnect}
            className="flex-1 min-w-0 h-9 px-3 rounded-full text-white text-[12.5px] font-extrabold cursor-pointer hover:opacity-90 flex items-center justify-center gap-1.5 whitespace-nowrap"
            style={{ backgroundColor: meta.brandColor }}
          >
            <Plug size={12} strokeWidth={2.4} className="shrink-0" />
            连接
          </button>
        ) : reauthNeeded ? (
          <button
            type="button"
            onClick={onReauth}
            className="flex-1 min-w-0 h-9 px-3 rounded-full bg-[#f59e0b] text-white text-[12.5px] font-extrabold cursor-pointer hover:opacity-90 flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <RefreshCw size={12} strokeWidth={2.4} className="shrink-0" />
            重新授权
          </button>
        ) : (
          <button
            type="button"
            onClick={onSync}
            className="flex-1 min-w-0 h-9 px-3 rounded-full border border-[var(--line)] text-[12.5px] font-bold text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <RefreshCw size={11} strokeWidth={2.4} className="shrink-0" />
            立即同步
          </button>
        )}
        <button
          type="button"
          aria-label="设置"
          className="h-9 px-3 rounded-full border border-[var(--line)] text-[12.5px] font-bold text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Cog size={12} strokeWidth={2.2} className="text-[var(--muted)]" />
          设置
        </button>
      </div>
    </article>
  )
}

function StatusPill({ status }: { status: Status }) {
  const m = STATUS_META[status]
  return (
    <span
      className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10.5px] font-extrabold"
      style={{ backgroundColor: m.bg, color: m.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.dot }} />
      {m.label}
    </span>
  )
}


function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: "ok" | "warn" | "neutral" }) {
  const cls =
    accent === "ok" ? "text-[#15803d]" :
    accent === "warn" ? "text-[#9a3412]" :
    "text-[var(--text)]"
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--soft-2)] p-3">
      <p className="text-[10.5px] font-bold text-[var(--muted)] uppercase tracking-wide">{label}</p>
      <p className={cn("text-[18px] font-extrabold mt-1 tabular-nums", cls)}>{value}</p>
    </div>
  )
}




function formatRows(n: number) {
  if (n === 0) return "0"
  if (n < 1000) return n.toString()
  if (n < 1_000_000) return `${(n / 1000).toFixed(1)}k`
  return `${(n / 1_000_000).toFixed(1)}m`
}
