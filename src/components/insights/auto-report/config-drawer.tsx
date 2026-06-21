"use client"

import { useEffect, useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, ChevronDown, Folder, RotateCcw, Search, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  METRIC_CATEGORIES,
  PLATFORMS,
  PLATFORM_ACCOUNTS,
  SCENARIOS,
  SEGMENT_CATEGORIES,
  type AccountItem,
  type PlatformId,
} from "@/lib/insights/auto-report-data"
import { PlatformLogo } from "./platform-logo"

// ─── State types ────────────────────────────────────────────────────────────

export type AccountMode = "list" | "manual" | "upload"

export type PlatformAccountState = {
  mode: AccountMode
  list: Set<string>
  manual: string
  upload: string[]
}

export type AccountStateMap = Record<PlatformId, PlatformAccountState>

type Props = {
  open: boolean
  onClose: () => void
  scenario: typeof SCENARIOS[number]
  reportName: string
  onReportNameChange: (v: string) => void
  accountState: AccountStateMap
  onAccountStateChange: (next: AccountStateMap) => void
  segments: Set<string>
  onSegmentsChange: (next: Set<string>) => void
  metrics: Set<string>
  onMetricsChange: (next: Set<string>) => void
}

type SyncFrequency = "daily" | "hourly" | "weekly"

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseManualIds(input: string, platform: PlatformId): { valid: string[]; invalid: string[] } {
  const tokens = input.split(/[,\n\s]+/).map((s) => s.trim()).filter(Boolean)
  const prefixMap: Record<PlatformId, string> = {
    tiktok: "tt_",
    meta:   "act_",
    google: "gads_",
    amazon: "amz_",
    cross:  "tt_",
  }
  const prefix = prefixMap[platform] || ""
  const valid: string[] = []
  const invalid: string[] = []
  for (const t of tokens) {
    if (prefix && t.startsWith(prefix) && t.length > prefix.length + 4) valid.push(t)
    else invalid.push(t)
  }
  return { valid, invalid }
}

function countAccounts(state: PlatformAccountState | undefined, platform: PlatformId): number {
  if (!state) return 0
  if (state.mode === "manual") return parseManualIds(state.manual, platform).valid.length
  if (state.mode === "upload") return state.upload.length
  return state.list.size
}

function totalAccountCount(map: AccountStateMap): number {
  return (Object.entries(map) as [PlatformId, PlatformAccountState][])
    .reduce((sum, [pid, st]) => sum + countAccounts(st, pid), 0)
}

function syncFrequencyLabel(f: SyncFrequency): string {
  return f === "hourly" ? "每小时" : f === "weekly" ? "每周一 00:00" : "每日 00:00"
}

// ─── Main component ────────────────────────────────────────────────────────

export function ConfigDrawer({
  open,
  onClose,
  scenario,
  reportName,
  onReportNameChange,
  accountState,
  onAccountStateChange,
  segments,
  onSegmentsChange,
  metrics,
  onMetricsChange,
}: Props) {
  // 打开时取一个快照，用于「取消」回滚 + 「恢复默认」
  const [snapshot, setSnapshot] = useState<{
    accounts: AccountStateMap
    segments: Set<string>
    metrics: Set<string>
    reportName: string
    syncFrequency: SyncFrequency
  } | null>(null)

  useEffect(() => {
    if (open && !snapshot) {
      setSnapshot({
        accounts: cloneAccounts(accountState),
        segments: new Set(segments),
        metrics: new Set(metrics),
        reportName,
        syncFrequency,
      })
    }
    if (!open) {
      setSnapshot(null)
      setActiveStep(0)
      setDirty(false)
      setValidationMsg("")
      setScheduleExpanded(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const [activeStep, setActiveStep] = useState<0 | 1 | 2>(0)
  const [dirty, setDirty] = useState(false)
  const [validationMsg, setValidationMsg] = useState("")
  const [scheduleExpanded, setScheduleExpanded] = useState(false)
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>("daily")

  const [drawerPlatform, setDrawerPlatform] = useState<PlatformId>(scenario.platforms[0])

  // 步骤完成度
  const stepCounts: [number, number, number] = [
    totalAccountCount(accountState),
    segments.size,
    metrics.size,
  ]
  const stepComplete: [boolean, boolean, boolean] = [
    stepCounts[0] > 0,
    stepCounts[1] > 0,
    stepCounts[2] > 0,
  ]

  function markDirty() {
    setDirty(true)
    setValidationMsg("")
  }

  function handleCancel() {
    if (snapshot) {
      onAccountStateChange(cloneAccounts(snapshot.accounts))
      onSegmentsChange(new Set(snapshot.segments))
      onMetricsChange(new Set(snapshot.metrics))
      onReportNameChange(snapshot.reportName)
      setSyncFrequency(snapshot.syncFrequency)
    }
    onClose()
  }

  function handleApply() {
    if (stepCounts[0] < 1) { setActiveStep(0); setValidationMsg("请至少保留一个有效账户"); return }
    if (stepCounts[1] < 1) { setActiveStep(1); setValidationMsg("请至少选择一个维度"); return }
    if (stepCounts[2] < 1) { setActiveStep(2); setValidationMsg("请至少选择一个指标"); return }
    setDirty(false)
    onClose()
  }

  function handleNext() {
    if (activeStep < 2) {
      setActiveStep((activeStep + 1) as 0 | 1 | 2)
      setValidationMsg("")
    } else {
      handleApply()
    }
  }

  function handlePrev() {
    if (activeStep > 0) {
      setActiveStep((activeStep - 1) as 0 | 1 | 2)
      setValidationMsg("")
    }
  }

  function handleReset() {
    // 恢复 scenario 默认值（账户全选 active；段/指标使用 scenario 默认）
    const nextAccounts: Partial<AccountStateMap> = {}
    for (const p of scenario.platforms) {
      const accounts = PLATFORM_ACCOUNTS[p] || []
      nextAccounts[p] = {
        mode: "list",
        list: new Set(accounts.filter((a) => a.status === "active").map((a) => a.id)),
        manual: "",
        upload: [],
      }
    }
    onAccountStateChange(nextAccounts as AccountStateMap)
    onSegmentsChange(new Set(scenario.segments))
    onMetricsChange(new Set(scenario.metrics))
    setSyncFrequency("daily")
    markDirty()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && handleCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/35 z-[60] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed right-0 top-0 bottom-0 z-[65] w-[min(60vw,960px)] min-w-[860px] bg-white border-l border-[var(--line)] shadow-lg flex flex-col",
            "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-1/2"
          )}
        >
          {/* Header */}
          <header className="px-5 py-3.5 border-b border-[var(--line)] flex items-center justify-between shrink-0">
            <div>
              <Dialog.Title className="text-[15px] font-semibold tracking-tight text-[var(--text)]">
                修改报表配置
              </Dialog.Title>
              <Dialog.Description className="text-[11.5px] text-[var(--muted)] mt-0.5">
                按步骤确认账户、维度与指标
              </Dialog.Description>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="text-[11.5px] px-2.5 h-7 border border-[var(--line)] rounded-md hover:bg-[var(--soft-2)] transition inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={11} strokeWidth={2} />
                恢复默认
              </button>
              <button
                type="button"
                aria-label="关闭"
                onClick={handleCancel}
                className="w-9 h-9 rounded-md hover:bg-[var(--soft-2)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          {/* Step navigation cards */}
          <div className="px-5 py-3 border-b border-[var(--line)] bg-[var(--soft-2)]/30">
            <StepNav
              activeStep={activeStep}
              onSelect={setActiveStep}
              counts={stepCounts}
              complete={stepComplete}
            />
          </div>

          {/* Step content */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            <StepHeader activeStep={activeStep} />
            {validationMsg && (
              <div className="mx-5 mt-3 px-3 py-2.5 border border-red-200 bg-red-50 text-red-700 rounded-md text-[12px]" role="alert">
                {validationMsg}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              {activeStep === 0 && (
                <AccountStep
                  scenario={scenario}
                  drawerPlatform={drawerPlatform}
                  onChangeDrawerPlatform={(p) => {
                    setDrawerPlatform(p)
                    markDirty()
                  }}
                  accountState={accountState}
                  onAccountStateChange={(next) => {
                    onAccountStateChange(next)
                    markDirty()
                  }}
                />
              )}
              {activeStep === 1 && (
                <CategoryStep
                  kind="segments"
                  categories={SEGMENT_CATEGORIES}
                  selected={segments}
                  onChange={(next) => {
                    onSegmentsChange(next)
                    markDirty()
                  }}
                  defaultSet={new Set(scenario.segments)}
                />
              )}
              {activeStep === 2 && (
                <CategoryStep
                  kind="metrics"
                  categories={METRIC_CATEGORIES}
                  selected={metrics}
                  onChange={(next) => {
                    onMetricsChange(next)
                    markDirty()
                  }}
                  defaultSet={new Set(scenario.metrics)}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="shrink-0 border-t border-[var(--line)] bg-white">
            {/* Schedule */}
            <button
              type="button"
              onClick={() => setScheduleExpanded((v) => !v)}
              aria-expanded={scheduleExpanded}
              className="w-full px-5 py-2.5 border-b border-[var(--line)] flex items-center justify-between text-left hover:bg-[var(--soft-2)]/30 transition cursor-pointer"
            >
              <span>
                <span className="text-[12px] font-medium text-[var(--text)]">调度设置</span>
                <span className="text-[12px] text-[var(--muted)] ml-2">
                  {syncFrequencyLabel(syncFrequency)} · 自动合并 · 内部存储
                </span>
              </span>
              <ChevronDown size={14} className={cn("transition-transform", scheduleExpanded && "rotate-180")} />
            </button>
            {scheduleExpanded && (
              <div className="px-5 py-3 border-b border-[var(--line)] bg-[var(--soft-2)]/30 grid grid-cols-3 gap-3">
                <label className="text-[11.5px]">
                  <span className="block text-[var(--muted)] mb-1.5">同步频率</span>
                  <select
                    value={syncFrequency}
                    onChange={(e) => { setSyncFrequency(e.target.value as SyncFrequency); markDirty() }}
                    className="w-full h-9 px-2.5 border border-[var(--line)] bg-white rounded-md text-[12.5px] outline-none focus:border-[var(--line-strong)]"
                  >
                    <option value="daily">每日 00:00（推荐）</option>
                    <option value="hourly">每小时</option>
                    <option value="weekly">每周一 00:00</option>
                  </select>
                </label>
                <div className="text-[11.5px]">
                  <span className="block text-[var(--muted)] mb-1.5">数据自动合并</span>
                  <div className="h-9 border border-[var(--line)] rounded-md bg-white px-3 flex items-center gap-1.5 text-emerald-700">
                    <Check size={12} strokeWidth={2.5} /> 已启用
                  </div>
                </div>
                <div className="text-[11.5px]">
                  <span className="block text-[var(--muted)] mb-1.5">存储位置</span>
                  <div className="h-9 border border-[var(--line)] rounded-md bg-white px-3 flex items-center text-[var(--text)]">
                    Creatiads 内部存储
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="px-5 py-3 flex items-center justify-between gap-3">
              <div className={cn("text-[11.5px]", dirty ? "text-amber-700" : "text-[var(--muted)]")}>
                {dirty ? "● 有未应用的修改" : "尚未修改配置"}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="h-9 px-4 text-[12.5px] border border-[var(--line)] rounded-md hover:bg-[var(--soft-2)] transition cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={activeStep === 0}
                  className="h-9 px-3 text-[12.5px] border border-[var(--line)] rounded-md hover:bg-[var(--soft-2)] transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  上一步
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-9 px-4 text-[12.5px] font-medium bg-[var(--near-black)] text-white rounded-md hover:opacity-90 transition cursor-pointer"
                >
                  {activeStep === 2 ? "应用配置" : "下一步"}
                </button>
              </div>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Step navigation ────────────────────────────────────────────────────────

function StepNav({
  activeStep,
  onSelect,
  counts,
  complete,
}: {
  activeStep: 0 | 1 | 2
  onSelect: (i: 0 | 1 | 2) => void
  counts: [number, number, number]
  complete: [boolean, boolean, boolean]
}) {
  const steps = [
    { name: "账户", desc: "确定数据范围" },
    { name: "维度", desc: "确定分析切片" },
    { name: "指标", desc: "确定核心数值" },
  ]
  return (
    <div className="flex gap-2">
      {steps.map((s, i) => {
        const active = activeStep === i
        const done = complete[i]
        return (
          <button
            key={s.name}
            type="button"
            onClick={() => onSelect(i as 0 | 1 | 2)}
            aria-current={active ? "step" : undefined}
            className={cn(
              "flex-1 min-w-0 border rounded-md px-3 py-2.5 text-left transition-colors cursor-pointer",
              active
                ? "border-[var(--line-strong)] bg-[var(--soft)] shadow-[0_1px_2px_rgba(9,9,11,0.06)]"
                : "border-[var(--line)] bg-white hover:bg-[var(--soft-2)]/65"
            )}
          >
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0",
                  active
                    ? "bg-[var(--near-black)] text-white"
                    : done
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-50 text-red-600"
                )}
              >
                {done && !active ? <Check size={13} strokeWidth={2.5} /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium text-[var(--text)]">{s.name}</span>
                <span className="block text-[11px] text-[var(--muted)] truncate">
                  {counts[i]} 个已选 · {s.desc}
                </span>
              </span>
              {!done && <span className="ml-auto w-2 h-2 rounded-full bg-red-500" title="尚未完成" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Step header ────────────────────────────────────────────────────────────

function StepHeader({ activeStep }: { activeStep: 0 | 1 | 2 }) {
  const titles = [
    ["配置账户", "选择参与报表的数据账户和输入方式"],
    ["配置维度", "决定报表按哪些字段切分和聚合"],
    ["配置指标", "决定 Dashboard 展示与计算哪些核心数值"],
  ]
  const [title, desc] = titles[activeStep]
  return (
    <div className="px-5 py-3.5 border-b border-[var(--line)] flex items-center justify-between bg-white shrink-0">
      <div>
        <h4 className="text-[13px] font-semibold text-[var(--text)]">{title}</h4>
        <p className="text-[11.5px] text-[var(--muted)] mt-0.5">{desc}</p>
      </div>
      <span className="text-[11.5px] text-[var(--muted)]">步骤 {activeStep + 1} / 3</span>
    </div>
  )
}

// ─── Step 1: Accounts ──────────────────────────────────────────────────────

function AccountStep({
  scenario,
  drawerPlatform,
  onChangeDrawerPlatform,
  accountState,
  onAccountStateChange,
}: {
  scenario: typeof SCENARIOS[number]
  drawerPlatform: PlatformId
  onChangeDrawerPlatform: (p: PlatformId) => void
  accountState: AccountStateMap
  onAccountStateChange: (next: AccountStateMap) => void
}) {
  const current = accountState[drawerPlatform]
  const mode = current?.mode ?? "list"

  function patchPlatform(patch: Partial<PlatformAccountState>) {
    const next = cloneAccounts(accountState)
    const cur: PlatformAccountState = next[drawerPlatform] ?? { mode: "list", list: new Set(), manual: "", upload: [] }
    next[drawerPlatform] = { ...cur, ...patch }
    onAccountStateChange(next)
  }

  function switchMode(m: AccountMode) {
    patchPlatform({ mode: m })
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Top: platform tabs + mode tabs */}
      <div className="px-5 py-4 border-b border-[var(--line)] bg-white shrink-0">
        <div className="flex flex-wrap gap-2">
          {scenario.platforms.map((pid) => {
            const platform = PLATFORMS.find((x) => x.id === pid)
            const active = pid === drawerPlatform
            const n = countAccounts(accountState[pid], pid)
            return (
              <button
                key={pid}
                type="button"
                onClick={() => onChangeDrawerPlatform(pid)}
                data-state={active ? "active" : "inactive"}
                className={cn(
                  "h-9 px-3 rounded-md border text-[12px] font-medium inline-flex items-center gap-2 transition-colors cursor-pointer",
                  active
                    ? "border-[var(--line-strong)] bg-[var(--soft)] shadow-[0_1px_2px_rgba(9,9,11,0.06)] text-[var(--text)]"
                    : "border-[var(--line)] bg-white text-[var(--text)] hover:bg-[var(--soft-2)]/65"
                )}
              >
                <PlatformLogo id={pid} size={14} />
                {platform?.name}
                <span className="text-[var(--muted)] tabular-nums">{n}</span>
              </button>
            )
          })}
        </div>
        <div className="inline-flex bg-[var(--soft)] rounded-md p-1 mt-3">
          {([
            { id: "list",   label: "列表筛选" },
            { id: "manual", label: "手动输入" },
            { id: "upload", label: "线下表上传" },
          ] as { id: AccountMode; label: string }[]).map((m) => {
            const active = mode === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => switchMode(m.id)}
                className={cn(
                  "px-3 h-7 text-[11.5px] rounded transition cursor-pointer",
                  active ? "bg-white shadow-[0_1px_2px_rgba(9,9,11,0.08)] font-medium text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                )}
              >
                {m.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2-column layout: editor (3fr) + summary (2fr) */}
      <div className="flex-1 min-h-0 grid grid-cols-[minmax(0,3fr)_minmax(280px,2fr)] overflow-hidden">
        <div className="border-r border-[var(--line)] overflow-hidden flex flex-col min-h-0">
          {mode === "list" && (
            <AccountListMode
              platform={drawerPlatform}
              state={current ?? { mode: "list", list: new Set(), manual: "", upload: [] }}
              onChange={(set) => patchPlatform({ list: set })}
            />
          )}
          {mode === "manual" && (
            <AccountManualMode
              platform={drawerPlatform}
              value={current?.manual ?? ""}
              onChange={(v) => patchPlatform({ manual: v })}
            />
          )}
          {mode === "upload" && (
            <AccountUploadMode
              upload={current?.upload ?? []}
              onChange={(arr) => patchPlatform({ upload: arr })}
            />
          )}
        </div>
        <aside className="overflow-hidden">
          <AccountSummary platforms={scenario.platforms} accountState={accountState} />
        </aside>
      </div>
    </div>
  )
}

function AccountListMode({
  platform,
  state,
  onChange,
}: {
  platform: PlatformId
  state: PlatformAccountState
  onChange: (next: Set<string>) => void
}) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all")
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)

  const all = PLATFORM_ACCOUNTS[platform] || []
  const sel = state.list

  const visible = useMemo(() => {
    return all.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false
      if (search && !(a.name + " " + a.id).toLowerCase().includes(search.toLowerCase())) return false
      if (showSelectedOnly && !sel.has(a.id)) return false
      return true
    })
  }, [all, statusFilter, search, showSelectedOnly, sel])

  const allVisibleSelected = visible.length > 0 && visible.every((a) => sel.has(a.id))

  function toggle(id: string) {
    const next = new Set(sel)
    if (next.has(id)) next.delete(id); else next.add(id)
    onChange(next)
  }

  function selectAllVisible() {
    const next = new Set(sel)
    if (allVisibleSelected) visible.forEach((a) => next.delete(a.id))
    else visible.forEach((a) => next.add(a.id))
    onChange(next)
  }

  function invert() {
    const next = new Set(sel)
    all.forEach((a) => { if (next.has(a.id)) next.delete(a.id); else next.add(a.id) })
    onChange(next)
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-5 py-3 border-b border-[var(--line)] space-y-2 shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索账户名或 ID..."
            className="w-full h-9 pl-9 pr-3 border border-[var(--line)] bg-white rounded-md text-[12.5px] outline-none focus:border-[var(--line-strong)]"
          />
        </div>
        <div className="flex items-center gap-2 text-[11.5px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "paused")}
            className="h-7 px-2 border border-[var(--line)] bg-white rounded text-[11.5px] outline-none focus:border-[var(--line-strong)]"
          >
            <option value="all">全部状态</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showSelectedOnly}
              onChange={(e) => setShowSelectedOnly(e.target.checked)}
              className="w-3.5 h-3.5"
            />
            <span className="text-[var(--text)]">仅看已选</span>
          </label>
          <div className="ml-auto text-[var(--muted)]">
            已选 <b className="text-[var(--text)] tabular-nums">{sel.size}</b> / 共 <b className="text-[var(--text)] tabular-nums">{all.length}</b>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11.5px]">
          <button
            type="button"
            onClick={selectAllVisible}
            className="px-2 h-6 border border-[var(--line)] rounded hover:bg-[var(--soft-2)] cursor-pointer transition"
          >
            {allVisibleSelected ? "取消全选" : "全选当前"}
          </button>
          <button
            type="button"
            onClick={invert}
            className="px-2 h-6 border border-[var(--line)] rounded hover:bg-[var(--soft-2)] cursor-pointer transition"
          >
            反选
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-1.5 min-h-0">
        {visible.length === 0 ? (
          <div className="text-center text-[11.5px] text-[var(--muted)] py-10">无匹配账户</div>
        ) : (
          visible.map((a) => {
            const checked = sel.has(a.id)
            return (
              <label
                key={a.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[var(--soft-2)]/60 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(a.id)}
                  className="w-4 h-4 rounded shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--text)] truncate">{a.name}</div>
                  <div className="text-[11.5px] text-[var(--muted)] truncate">
                    {a.id} · {a.created}
                  </div>
                </div>
                <StatusPill status={a.status} />
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}

function AccountManualMode({
  platform,
  value,
  onChange,
}: {
  platform: PlatformId
  value: string
  onChange: (v: string) => void
}) {
  const parsed = parseManualIds(value, platform)
  const platName = PLATFORMS.find((p) => p.id === platform)?.name ?? platform
  const placeholderFmt = platform === "meta" ? "act_1234567890"
    : platform === "google" ? "gads_123-456-7890"
    : platform === "amazon" ? "amz_84291037"
    : "tt_6921837465"
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-5 py-4 border-b border-[var(--line)] shrink-0">
        <div className="text-[11.5px] text-[var(--muted)] mb-2">
          输入 <b className="text-[var(--text)]">{platName}</b> 账户 ID，使用 <b className="text-[var(--text)]">英文逗号</b> 分隔，支持换行
        </div>
        <textarea
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${placeholderFmt}, ${placeholderFmt}, ...`}
          className="w-full p-3 border border-[var(--line)] bg-white rounded-md text-[12.5px] font-mono outline-none focus:border-[var(--line-strong)] resize-none"
        />
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-3 min-h-0">
        {parsed.valid.length === 0 && parsed.invalid.length === 0 ? (
          <div className="text-[11.5px] text-[var(--muted)] text-center py-8">输入账户 ID 后会在此显示校验结果</div>
        ) : (
          <>
            <div className="text-[11.5px] text-[var(--muted)] mb-2">
              校验结果：<b className="text-[var(--text)]">{parsed.valid.length}</b> 个有效，
              <b className={parsed.invalid.length > 0 ? "text-red-600" : "text-[var(--text)]"}>{parsed.invalid.length}</b> 个无效
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsed.valid.map((id) => (
                <span key={id} className="inline-flex items-center text-[11px] px-2 py-1 border rounded font-mono bg-emerald-50 border-emerald-200 text-emerald-700">
                  {id}
                </span>
              ))}
              {parsed.invalid.map((id) => (
                <span key={id} className="inline-flex items-center text-[11px] px-2 py-1 border rounded font-mono bg-red-50 border-red-200 text-red-700 gap-1" title="格式不符合">
                  ⚠ {id}
                </span>
              ))}
            </div>
            {parsed.invalid.length > 0 && (
              <div className="text-[11.5px] text-red-600 mt-2">⚠ 标红的 ID 格式无效，请使用对应平台前缀</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function AccountUploadMode({
  upload,
  onChange,
}: {
  upload: string[]
  onChange: (arr: string[]) => void
}) {
  function mockUpload() {
    onChange([
      "tt_8472019384", "tt_2837465019", "tt_9384756102", "tt_5647382910",
      "tt_3948572610", "tt_1729384756", "tt_8273645102",
    ])
  }
  function clear() { onChange([]) }
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-5 py-4 border-b border-[var(--line)] shrink-0">
        <div className="border-2 border-dashed border-[var(--line-strong)] rounded-lg p-6 text-center">
          <Upload size={28} strokeWidth={1.5} className="mx-auto text-[var(--muted)] mb-2" />
          <div className="text-[13px] font-medium text-[var(--text)] mb-1">拖拽 CSV / Excel 文件到此处</div>
          <div className="text-[11.5px] text-[var(--muted)] mb-3">或点击下方按钮选择文件，第一列将作为账户 ID</div>
          <button
            type="button"
            onClick={mockUpload}
            className="px-3 h-8 text-[11.5px] border border-[var(--line)] rounded-md hover:bg-[var(--soft-2)] transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Folder size={11} strokeWidth={2} />
            选择文件
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-3 min-h-0">
        {upload.length === 0 ? (
          <div className="text-[11.5px] text-[var(--muted)] text-center py-8">尚未上传文件</div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11.5px] text-[var(--muted)]">
                已解析 <b className="text-[var(--text)] tabular-nums">{upload.length}</b> 个账户 ID · 预览前 5 行
              </div>
              <button
                type="button"
                onClick={clear}
                className="text-[11.5px] text-[var(--muted)] hover:text-red-600 cursor-pointer"
              >
                清空
              </button>
            </div>
            <div className="border border-[var(--line)] rounded-md overflow-hidden">
              <table className="w-full text-[11.5px]">
                <thead className="bg-[var(--soft)]/50">
                  <tr>
                    <th className="text-left px-3 py-1.5 font-medium">#</th>
                    <th className="text-left px-3 py-1.5 font-medium">账户 ID</th>
                    <th className="text-left px-3 py-1.5 font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {upload.slice(0, 5).map((id, i) => (
                    <tr key={i} className="border-t border-[var(--line)]">
                      <td className="px-3 py-1.5 text-[var(--muted)]">{i + 1}</td>
                      <td className="px-3 py-1.5 font-mono">{id}</td>
                      <td className="px-3 py-1.5">
                        <span className="inline-flex text-[10px] px-1.5 py-0.5 border rounded bg-emerald-50 border-emerald-200 text-emerald-700">
                          已识别
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {upload.length > 5 && (
              <div className="text-[11.5px] text-[var(--muted)] mt-2">还有 {upload.length - 5} 行未显示</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function AccountSummary({
  platforms,
  accountState,
}: {
  platforms: PlatformId[]
  accountState: AccountStateMap
}) {
  const total = totalAccountCount(accountState)
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-[var(--line)] bg-[var(--soft-2)]/30 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-[13px] font-semibold text-[var(--text)]">已选账户</h5>
            <p className="text-[11.5px] text-[var(--muted)] mt-0.5">应用后将使用这些账户生成报表</p>
          </div>
          <span className="text-[11.5px] font-medium text-[var(--text)] tabular-nums">{total} 个有效</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {platforms.map((pid) => {
          const platform = PLATFORMS.find((p) => p.id === pid)
          const st = accountState[pid]
          const modeLabel = st?.mode === "manual" ? "手动输入" : st?.mode === "upload" ? "线下表" : "账户列表"
          const accounts = PLATFORM_ACCOUNTS[pid] || []
          let names: string[] = []
          if (!st || st.mode === "list") {
            names = accounts.filter((a) => st?.list.has(a.id)).map((a) => a.name)
          } else if (st.mode === "manual") {
            names = parseManualIds(st.manual, pid).valid
          } else {
            names = st.upload
          }
          return (
            <div key={pid} className="border border-[var(--line)] rounded-md p-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 border border-[var(--line)] rounded-md bg-white inline-flex items-center justify-center shrink-0">
                  <PlatformLogo id={pid} size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[11.5px] font-medium text-[var(--text)] truncate">{platform?.name}</div>
                  <div className="text-[10.5px] text-[var(--muted)]">{modeLabel}</div>
                </div>
                <b className="text-[13px] text-[var(--text)] tabular-nums">{names.length}</b>
              </div>
              <div className="mt-2 space-y-1">
                {names.slice(0, 4).map((n) => (
                  <div key={n} className="text-[11px] text-[var(--muted)] truncate">· {n}</div>
                ))}
                {names.length > 4 && (
                  <div className="text-[11px] text-[var(--muted)]">还有 {names.length - 4} 个</div>
                )}
                {names.length === 0 && (
                  <div className="text-[11px] text-red-600">尚无有效账户</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div
        className={cn(
          "px-4 py-3 border-t border-[var(--line)] text-[11.5px] shrink-0",
          total > 0 ? "text-emerald-700 bg-emerald-50/60" : "text-red-700 bg-red-50/60"
        )}
      >
        {total > 0 ? "账户配置完整，可以继续下一步" : "请至少保留一个有效账户"}
      </div>
    </div>
  )
}

// ─── Step 2/3: Segment / Metric category editor ─────────────────────────────

function CategoryStep({
  kind,
  categories,
  selected,
  onChange,
  defaultSet,
}: {
  kind: "segments" | "metrics"
  categories: Record<string, string[]>
  selected: Set<string>
  onChange: (next: Set<string>) => void
  defaultSet: Set<string>
}) {
  const [search, setSearch] = useState("")
  const [expandedCats, setExpandedCats] = useState<Set<string>>(() => new Set(Object.keys(categories)))
  const label = kind === "segments" ? "维度" : "指标"

  function toggle(item: string) {
    const next = new Set(selected)
    if (next.has(item)) next.delete(item); else next.add(item)
    onChange(next)
  }

  function restoreRecommended() { onChange(new Set(defaultSet)) }
  function clearAll() { onChange(new Set()) }

  function move(from: number, to: number) {
    const arr = [...selected]
    const item = arr[from]
    arr.splice(from, 1)
    arr.splice(to, 0, item)
    onChange(new Set(arr))
  }

  function toggleCat(c: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev)
      if (next.has(c)) next.delete(c); else next.add(c)
      return next
    })
  }

  const items = [...selected]

  return (
    <div className="h-full grid grid-cols-[minmax(0,3fr)_minmax(280px,2fr)] overflow-hidden min-h-0">
      {/* Left: search + categories */}
      <div className="border-r border-[var(--line)] flex flex-col overflow-hidden min-h-0">
        <div className="px-5 py-4 border-b border-[var(--line)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`搜索${label}...`}
                className="w-full h-9 pl-9 pr-3 border border-[var(--line)] bg-white rounded-md text-[12.5px] outline-none focus:border-[var(--line-strong)]"
              />
            </div>
            <button
              type="button"
              onClick={restoreRecommended}
              className="h-9 px-3 text-[11.5px] border border-[var(--line)] rounded-md hover:bg-[var(--soft-2)] transition cursor-pointer"
            >
              恢复推荐
            </button>
          </div>
          <p className="text-[11.5px] text-[var(--muted)] mt-2">勾选后会立即加入右侧，应用前仍可取消全部修改。</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 content-start gap-3 min-h-0">
          {Object.entries(categories).map(([cat, list]) => {
            const filtered = search.trim()
              ? list.filter((x) => x.toLowerCase().includes(search.toLowerCase()))
              : list
            if (filtered.length === 0) return null
            const isExpanded = expandedCats.has(cat)
            const selectedInCat = list.filter((x) => selected.has(x)).length
            return (
              <div key={cat} className="border border-[var(--line)] rounded-md bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCat(cat)}
                  className="w-full px-3 py-2.5 cursor-pointer flex items-center justify-between text-[11.5px] font-medium hover:bg-[var(--soft-2)]/40"
                >
                  <span className="flex items-center gap-1.5">
                    <ChevronDown size={11} className={cn("text-[var(--muted)] transition-transform", !isExpanded && "-rotate-90")} />
                    {cat}
                  </span>
                  <span className="text-[var(--muted)] tabular-nums">{selectedInCat}/{list.length}</span>
                </button>
                {isExpanded && (
                  <div className="px-2 pb-2">
                    {filtered.map((item) => {
                      const checked = selected.has(item)
                      return (
                        <label
                          key={item}
                          className="flex items-center gap-2 px-2 py-2 rounded hover:bg-[var(--soft-2)]/50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(item)}
                            className="w-3.5 h-3.5 rounded"
                          />
                          <span className="text-[11.5px] text-[var(--text)]">{item}</span>
                          {checked && <span className="ml-auto text-[10px] text-emerald-700">已选</span>}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: ordered selection */}
      <aside className="flex flex-col overflow-hidden min-h-0">
        <div className="px-4 py-3 border-b border-[var(--line)] bg-[var(--soft-2)]/30 flex items-start justify-between gap-3 shrink-0">
          <div>
            <h5 className="text-[13px] font-semibold text-[var(--text)]">已选{label}</h5>
            <p className="text-[11.5px] text-[var(--muted)] mt-0.5">使用按钮调整最终展示顺序</p>
          </div>
          <button
            type="button"
            onClick={clearAll}
            disabled={items.length === 0}
            className="text-[11.5px] text-[var(--muted)] hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            清空
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {items.length === 0 ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center px-6">
              <div className="w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3 text-[15px] font-bold">!</div>
              <div className="text-[13px] font-medium text-[var(--text)]">尚未选择{label}</div>
              <div className="text-[11.5px] text-[var(--muted)] mt-1">请从左侧选择至少一个{label}</div>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item}
                className="flex items-center gap-2 px-3 py-2 border border-[var(--line)] rounded-md bg-white mb-2"
              >
                <span className="w-5 h-5 rounded bg-[var(--soft)] text-[10px] font-semibold flex items-center justify-center text-[var(--text)] tabular-nums">
                  {idx + 1}
                </span>
                <span className="text-[11.5px] font-medium flex-1 min-w-0 truncate text-[var(--text)]">{item}</span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(idx, Math.max(0, idx - 1))}
                    disabled={idx === 0}
                    aria-label="上移"
                    className="w-6 h-6 rounded hover:bg-[var(--soft-2)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    <ChevronDown size={11} className="rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, Math.min(items.length - 1, idx + 1))}
                    disabled={idx === items.length - 1}
                    aria-label="下移"
                    className="w-6 h-6 rounded hover:bg-[var(--soft-2)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)]"
                  >
                    <ChevronDown size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(item)}
                    aria-label="移除"
                    className="w-6 h-6 rounded hover:bg-red-50 cursor-pointer flex items-center justify-center text-[var(--muted)] hover:text-red-600"
                  >
                    <X size={11} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div
          className={cn(
            "px-4 py-3 border-t border-[var(--line)] text-[11.5px] shrink-0",
            items.length > 0 ? "text-emerald-700 bg-emerald-50/60" : "text-red-700 bg-red-50/60"
          )}
        >
          {items.length > 0
            ? `已选择 ${items.length} 个${label}，顺序已保存到草稿`
            : `至少需要 1 个${label}`}
        </div>
      </aside>
    </div>
  )
}

// ─── Small primitives ──────────────────────────────────────────────────────

function StatusPill({ status }: { status: AccountItem["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-5 px-1.5 rounded text-[10px] font-medium border",
        status === "active"
          ? "bg-white text-[var(--text)] border-[var(--line)]"
          : "bg-[var(--soft)] text-[var(--muted)] border-[var(--line)]"
      )}
    >
      {status}
    </span>
  )
}

// ─── Utilities ─────────────────────────────────────────────────────────────

function cloneAccounts(src: AccountStateMap): AccountStateMap {
  const next: Partial<AccountStateMap> = {}
  for (const [k, v] of Object.entries(src) as [PlatformId, PlatformAccountState][]) {
    next[k] = {
      mode: v.mode,
      list: new Set(v.list),
      manual: v.manual,
      upload: [...v.upload],
    }
  }
  return next as AccountStateMap
}
