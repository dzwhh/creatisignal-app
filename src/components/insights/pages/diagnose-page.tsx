"use client"

import { useMemo, useState } from "react"
import { Filter, ChevronDown, Search, ArrowUpDown, Settings2, Sparkles, Wand2 } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { ACCOUNTS, MATERIALS } from "@/lib/insights/mock"
import { BUCKET_META, STATUS_META, type Material, type MaterialBucket, type Account, type AccountStatus, type ViewMode } from "@/lib/insights/types"
import { AccountDistBar, ActionBadge, MaterialThumb, MoneyShort, Pct, StatusBadge } from "../shared"
import { MaterialDrawer } from "../material-drawer"
import { AccountDrawer } from "../account-drawer"
import { BriefDrawer, type BriefSeedTrigger } from "../brief-drawer"

export function DiagnosePage({
  accountIds,
  view,
}: {
  accountIds: string[]
  view: ViewMode
  onChangeView: (v: ViewMode) => void
}) {
  const accountSet = useMemo(() => new Set(accountIds), [accountIds])

  if (view === "material") {
    return <MaterialView accountSet={accountSet} />
  }
  return <AccountView accountIds={accountIds} />
}

// ─── Material View ───────────────────────────────────────────────────────────

function MaterialView({ accountSet }: { accountSet: Set<string> }) {
  const [bucket, setBucket] = useState<MaterialBucket | "all">("core")
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<"rating" | "ctr" | "spend" | "roi" | "cpo">("rating")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [drawerMaterial, setDrawerMaterial] = useState<Material | null>(null)
  const [briefSeed, setBriefSeed] = useState<BriefSeedTrigger>(null)

  const filtered = useMemo(() => {
    let list = MATERIALS.filter((m) => m.accountRows.some((r) => accountSet.has(r.accountId)))
    if (bucket !== "all") list = list.filter((m) => m.bucket === bucket)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.fingerprint.includes(q) || m.sku.toLowerCase().includes(q))
    }
    const dir = sortDir === "desc" ? -1 : 1
    list = [...list].sort((a, b) => {
      if (sortKey === "rating") return (a.rating - b.rating) * dir
      if (sortKey === "ctr") return (a.metrics.ctr - b.metrics.ctr) * dir
      if (sortKey === "spend") return (a.metrics.spend - b.metrics.spend) * dir
      if (sortKey === "roi") return (a.metrics.roi - b.metrics.roi) * dir
      return (a.metrics.cpo - b.metrics.cpo) * dir
    })
    return list
  }, [accountSet, bucket, query, sortKey, sortDir])

  const bucketCounts = useMemo(() => {
    const all = MATERIALS.filter((m) => m.accountRows.some((r) => accountSet.has(r.accountId)))
    return {
      core: all.filter((m) => m.bucket === "core").length,
      potential: all.filter((m) => m.bucket === "potential").length,
      iterate: all.filter((m) => m.bucket === "iterate").length,
      archived: all.filter((m) => m.bucket === "archived").length,
      all: all.length,
    }
  }, [accountSet])

  const onToggleSort = (k: typeof sortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    else { setSortKey(k); setSortDir("desc") }
  }

  const toggleSelect = (fp: string) => {
    const next = new Set(selectedIds)
    if (next.has(fp)) next.delete(fp)
    else next.add(fp)
    setSelectedIds(next)
  }

  return (
    <div className="px-8 py-5">
      {/* Top filter row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <PickerStub icon={Filter} label="维度筛选" />
          <PickerStub icon={Settings2} label="自定义列" />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索素材名 / SKU…"
              className="h-9 pl-8 pr-3 rounded-full border border-[var(--line)] bg-white text-[13px] w-[220px] outline-none focus:border-[var(--line-strong)]"
            />
          </div>
        </div>
      </div>

      {/* Bucket tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--line)] mb-3">
        {(["core", "potential", "iterate", "all"] as Array<MaterialBucket | "all">).map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => setBucket(b)}
            className={cn(
              "relative h-9 px-3 flex items-center gap-1.5 text-[13px] font-bold cursor-pointer transition-colors",
              bucket === b ? "text-[#a16207]" : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            {b === "all" ? "全部素材" : BUCKET_META[b].label}
            <span className={cn("h-5 px-1.5 rounded-md text-[11px] font-bold flex items-center", bucket === b ? "bg-[#fef9c3] text-[#a16207]" : "bg-[var(--soft)] text-[var(--muted)]")}>
              {bucketCounts[b]}
            </span>
            {bucket === b && <span className="absolute left-3 right-3 bottom-[-1px] h-[2px] rounded-full bg-[#eab308]" />}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-[var(--soft-2)]">
              <tr className="text-left">
                <th className="w-10 px-3 py-2.5 font-semibold text-[var(--muted)] text-[11px]"></th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px]">广告名</th>
                <SortableTh label="综合评级" active={sortKey === "rating"} dir={sortDir} onClick={() => onToggleSort("rating")} />
                <SortableTh label="CTR"      active={sortKey === "ctr"}    dir={sortDir} onClick={() => onToggleSort("ctr")} />
                <SortableTh label="花费"      active={sortKey === "spend"}  dir={sortDir} onClick={() => onToggleSort("spend")} />
                <SortableTh label="ROI"      active={sortKey === "roi"}    dir={sortDir} onClick={() => onToggleSort("roi")} />
                <SortableTh label="CPO"      active={sortKey === "cpo"}    dir={sortDir} onClick={() => onToggleSort("cpo")} />
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px]">账户分布</th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px]">行业 / 风格</th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px]">建议动作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 80).map((m) => {
                const isSelected = selectedIds.has(m.fingerprint)
                return (
                  <tr
                    key={m.fingerprint}
                    onClick={() => setDrawerMaterial(m)}
                    className={cn(
                      "border-t border-[var(--line)] cursor-pointer hover:bg-[var(--soft-2)] transition-colors",
                      isSelected && "bg-[#fffbea]"
                    )}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(m.fingerprint)}
                        className="w-3.5 h-3.5 cursor-pointer accent-[#18181b]"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2.5">
                        <MaterialThumb material={m} size={36} showPlay={false} />
                        <div className="min-w-0">
                          <p className="text-[12.5px] font-semibold text-[var(--text)] truncate">{m.name}</p>
                          <p className="text-[10.5px] text-[var(--muted)] font-mono truncate">{m.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <span className={cn(
                        "h-6 px-2 rounded-md text-[11.5px] font-bold inline-flex items-center",
                        m.rating >= 80 ? "bg-[#dff9e7] text-[#16a34a]" : m.rating >= 65 ? "bg-[#fef9c3] text-[#a16207]" : "bg-[#fee2e2] text-[#dc2626]"
                      )}>
                        {m.rating}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-[12px]"><Pct value={m.metrics.ctr} /></td>
                    <td className="px-2 py-2 text-[12px]"><MoneyShort value={m.metrics.spend} /></td>
                    <td className={cn("px-2 py-2 text-[12px] font-bold",
                      m.metrics.roi >= 2 ? "text-[#16a34a]" : m.metrics.roi >= 1.4 ? "text-[#a16207]" : "text-[#dc2626]"
                    )}>{m.metrics.roi.toFixed(2)}</td>
                    <td className="px-2 py-2 text-[12px]">{m.metrics.cpo > 0 ? `$${m.metrics.cpo.toFixed(2)}` : "—"}</td>
                    <td className="px-2 py-2">
                      <AccountDistBar material={m} />
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-1">
                        <span className="h-5 px-1.5 rounded text-[10.5px] font-semibold bg-[#dbeafe] text-[#1e40af]">{m.industryTag}</span>
                        <span className="h-5 px-1.5 rounded text-[10.5px] font-semibold bg-[#ede9fe] text-[#6d28d9]">{m.videoStyleTag}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <ActionBadge action={m.recommendation} />
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-12 text-center text-[var(--muted)]">没有匹配的素材</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 80 && (
          <div className="border-t border-[var(--line)] py-2 text-center text-[11.5px] text-[var(--muted)]">
            显示前 80 条，共 {filtered.length} 条 · 用筛选缩小范围
          </div>
        )}
      </div>

      {/* Sticky action bar when selecting */}
      {selectedIds.size > 0 && (
        <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-40 bg-[#18181b] text-white rounded-full px-4 py-2 flex items-center gap-3 shadow-[0_18px_42px_rgba(9,9,11,0.3)]">
          <span className="text-[12.5px] font-semibold">已选 {selectedIds.size} 条</span>
          <button type="button" className="h-8 px-3 rounded-full bg-white text-[#18181b] text-[12px] font-bold cursor-pointer hover:opacity-90 flex items-center gap-1">
            <Sparkles size={12} /> 生成对比报告
          </button>
          <button type="button" onClick={() => setBriefSeed({})} className="h-8 px-3 rounded-full bg-white/15 text-white text-[12px] font-bold cursor-pointer hover:bg-white/25 flex items-center gap-1">
            <Wand2 size={12} /> 批量复刻 Brief
          </button>
          <button type="button" className="h-8 px-3 rounded-full bg-white/15 text-white text-[12px] font-bold cursor-pointer hover:bg-white/25">
            批量暂停
          </button>
          <button type="button" onClick={() => setSelectedIds(new Set())} className="text-[11.5px] text-white/70 hover:text-white cursor-pointer ml-1">
            清空
          </button>
        </div>
      )}

      <MaterialDrawer material={drawerMaterial} onClose={() => setDrawerMaterial(null)} onSendBrief={() => setBriefSeed({})} />
      <BriefDrawer seed={briefSeed} onClose={() => setBriefSeed(null)} />
    </div>
  )
}

function SortableTh({ label, active, dir, onClick }: { label: string; active: boolean; dir: "asc" | "desc"; onClick: () => void }) {
  return (
    <th className="px-2 py-2.5">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-0.5 text-[11px] font-semibold cursor-pointer",
          active ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
        )}
      >
        {label}
        <ArrowUpDown size={10} className={cn("transition-transform", active && dir === "asc" && "rotate-180")} />
      </button>
    </th>
  )
}

function PickerStub({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>; label: string }) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[13px] font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)] transition-colors"
        >
          <Icon size={13} strokeWidth={2.2} className="text-[var(--muted)]" />
          {label}
          <ChevronDown size={12} className="text-[var(--muted)] -mr-0.5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[200px] p-3 bg-white border border-[var(--line)] rounded-2xl shadow-[0_18px_42px_rgba(9,9,11,0.14)] text-[12px] text-[var(--muted)]"
        >
          配置项即将上线
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

// ─── Account View ────────────────────────────────────────────────────────────

function AccountView({ accountIds }: { accountIds: string[] }) {
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "all">("all")
  const [query, setQuery] = useState("")
  const [drawerAccount, setDrawerAccount] = useState<Account | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const accountSet = useMemo(() => new Set(accountIds), [accountIds])

  const filtered = useMemo(() => {
    let list = ACCOUNTS.filter((a) => accountSet.has(a.id))
    if (statusFilter !== "all") list = list.filter((a) => a.status === statusFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((a) => a.name.toLowerCase().includes(q) || a.id.includes(q))
    }
    return list.sort((a, b) => b.metrics7d.spend - a.metrics7d.spend)
  }, [accountSet, statusFilter, query])

  const statusCounts = useMemo(() => {
    const list = ACCOUNTS.filter((a) => accountSet.has(a.id))
    return {
      all: list.length,
      scaling: list.filter((a) => a.status === "scaling").length,
      learning: list.filter((a) => a.status === "learning").length,
      rewrite: list.filter((a) => a.status === "rewrite").length,
      warming: list.filter((a) => a.status === "warming").length,
      paused: list.filter((a) => a.status === "paused").length,
    }
  }, [accountSet])

  return (
    <div className="px-8 py-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <PickerStub icon={Filter} label="筛选" />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索账户名 / ID…"
              className="h-9 pl-8 pr-3 rounded-full border border-[var(--line)] bg-white text-[13px] w-[220px] outline-none focus:border-[var(--line-strong)]"
            />
          </div>
        </div>
      </div>

      {/* Status bucket tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--line)] mb-3 overflow-x-auto">
        {(["all", "scaling", "learning", "rewrite", "warming", "paused"] as Array<AccountStatus | "all">).map((s) => {
          const label = s === "all" ? "全部" : STATUS_META[s as AccountStatus].label
          const count = statusCounts[s]
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                "relative h-9 px-3 flex items-center gap-1.5 text-[13px] font-bold cursor-pointer whitespace-nowrap",
                statusFilter === s ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              {s !== "all" && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_META[s as AccountStatus].dot }} />}
              {label}
              <span className={cn("h-5 px-1.5 rounded-md text-[11px] font-bold flex items-center", statusFilter === s ? "bg-[var(--text)] text-white" : "bg-[var(--soft)] text-[var(--muted)]")}>
                {count}
              </span>
              {statusFilter === s && <span className="absolute left-3 right-3 bottom-[-1px] h-[2px] rounded-full bg-[var(--text)]" />}
            </button>
          )
        })}
      </div>

      {/* Account table */}
      <div className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead className="bg-[var(--soft-2)]">
              <tr className="text-left">
                <th className="w-10 px-3 py-2.5"></th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px]">账户</th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px]">状态</th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px]">区域</th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px] text-right">花费</th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px] text-right">ROI</th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px] text-right">Target</th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px] text-right">CPO</th>
                <th className="px-2 py-2.5 font-semibold text-[var(--muted)] text-[11px]">Top 3 素材</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 60).map((a) => {
                const topMats = a.topMaterialFingerprints.slice(0, 3).map((fp) => MATERIALS.find((m) => m.fingerprint === fp)).filter(Boolean) as Material[]
                const isSelected = selectedIds.has(a.id)
                const tooTight = a.suggestedTargetRoi !== undefined && a.roiTarget > (a.suggestedTargetRoi + 0.5)
                return (
                  <tr
                    key={a.id}
                    onClick={() => setDrawerAccount(a)}
                    className={cn(
                      "border-t border-[var(--line)] cursor-pointer hover:bg-[var(--soft-2)] transition-colors",
                      isSelected && "bg-[#fffbea]"
                    )}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const next = new Set(selectedIds)
                          if (next.has(a.id)) next.delete(a.id); else next.add(a.id)
                          setSelectedIds(next)
                        }}
                        className="w-3.5 h-3.5 cursor-pointer accent-[#18181b]"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <p className="text-[12.5px] font-semibold text-[var(--text)] truncate">{a.name}</p>
                      <p className="text-[10.5px] text-[var(--muted)] font-mono truncate">{a.id}</p>
                    </td>
                    <td className="px-2 py-2"><StatusBadge status={a.status} compact /></td>
                    <td className="px-2 py-2 text-[11.5px] text-[var(--muted)] font-semibold">{a.region} · {a.tier}</td>
                    <td className="px-2 py-2 text-right text-[12px]"><MoneyShort value={a.metrics7d.spend} /></td>
                    <td className={cn("px-2 py-2 text-right text-[12px] font-bold",
                      a.metrics7d.roi >= 2 ? "text-[#16a34a]" : a.metrics7d.roi >= 1.4 ? "text-[#a16207]" : "text-[#dc2626]"
                    )}>{a.metrics7d.roi.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right text-[12px] flex items-center justify-end gap-1">
                      {a.roiTarget.toFixed(1)}
                      {tooTight && <span title="过紧">⚠️</span>}
                    </td>
                    <td className="px-2 py-2 text-right text-[12px]">{a.metrics7d.cpo > 0 ? `$${a.metrics7d.cpo.toFixed(2)}` : "—"}</td>
                    <td className="px-2 py-2">
                      <div className="flex -space-x-1">
                        {topMats.map((m) => (
                          <span key={m.fingerprint} className="w-7 h-7 rounded-md overflow-hidden border-2 border-white bg-[var(--soft)]">
                            <img src={m.thumb} alt="" className="w-full h-full object-cover" />
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {filtered.length > 60 && (
          <div className="border-t border-[var(--line)] py-2 text-center text-[11.5px] text-[var(--muted)]">
            显示前 60 个，共 {filtered.length} 个账户
          </div>
        )}
      </div>

      {/* Sticky action bar */}
      {selectedIds.size > 0 && (
        <div className="fixed left-1/2 bottom-6 -translate-x-1/2 z-40 bg-[#18181b] text-white rounded-full px-4 py-2 flex items-center gap-3 shadow-[0_18px_42px_rgba(9,9,11,0.3)]">
          <span className="text-[12.5px] font-semibold">已选 {selectedIds.size} 个账户</span>
          <button type="button" className="h-8 px-3 rounded-full bg-white text-[#18181b] text-[12px] font-bold cursor-pointer hover:opacity-90">
            批量调整 ROI Target
          </button>
          <button type="button" className="h-8 px-3 rounded-full bg-white/15 text-white text-[12px] font-bold cursor-pointer hover:bg-white/25">
            批量上调预算
          </button>
          <button type="button" className="h-8 px-3 rounded-full bg-white/15 text-white text-[12px] font-bold cursor-pointer hover:bg-white/25">
            批量暂停
          </button>
          <button type="button" onClick={() => setSelectedIds(new Set())} className="text-[11.5px] text-white/70 hover:text-white cursor-pointer ml-1">
            清空
          </button>
        </div>
      )}

      <AccountDrawer account={drawerAccount} onClose={() => setDrawerAccount(null)} />
    </div>
  )
}
