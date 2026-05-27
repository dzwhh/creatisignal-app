"use client"

import { useMemo, useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { Search, Check, ChevronDown, X, Pin, Users, Tag } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCOUNTS, ACCOUNT_GROUPS } from "@/lib/insights/mock"
import { STATUS_META, type AccountStatus } from "@/lib/insights/types"

export function AccountPicker({
  selected,
  onChange,
}: {
  selected: Set<string>
  onChange: (next: Set<string>) => void
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ACCOUNTS
    return ACCOUNTS.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.alias?.toLowerCase().includes(q) ?? false)
    )
  }, [query])

  const topBySpend = useMemo(
    () =>
      [...filtered]
        .filter((a) => a.status !== "paused")
        .sort((a, b) => b.metrics7d.spend - a.metrics7d.spend)
        .slice(0, 10),
    [filtered]
  )

  const byStatus = useMemo(() => {
    const groups: Record<AccountStatus, typeof filtered> = {
      scaling:  [],
      learning: [],
      rewrite:  [],
      paused:   [],
      warming:  [],
    }
    for (const a of filtered) groups[a.status].push(a)
    return groups
  }, [filtered])

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(next)
  }

  const selectAll = (ids: string[]) => {
    const next = new Set(selected)
    ids.forEach((id) => next.add(id))
    onChange(next)
  }
  const clearAll = (ids: string[]) => {
    const next = new Set(selected)
    ids.forEach((id) => next.delete(id))
    onChange(next)
  }

  const totalActive = ACCOUNTS.filter((a) => a.status !== "paused").length

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[13px] font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)] transition-colors data-[state=open]:border-[var(--line-strong)] data-[state=open]:bg-[var(--soft-2)]"
        >
          <Users size={13} strokeWidth={2.2} className="text-[var(--muted)]" />
          <span>广告账户</span>
          <span className="px-1.5 h-5 rounded-full bg-[var(--soft)] text-[11px] font-bold text-[var(--text)] flex items-center">
            {selected.size === 0 ? `全部 ${totalActive}` : `已选 ${selected.size}`}
          </span>
          <ChevronDown size={12} className="text-[var(--muted)]" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[420px] max-h-[520px] bg-white border border-[var(--line)] rounded-2xl shadow-[0_18px_42px_rgba(9,9,11,0.14)] overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {/* Search */}
          <div className="p-3 border-b border-[var(--line)]">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索账户名 / ID / 别名…"
                className="w-full h-9 pl-9 pr-9 rounded-lg border border-[var(--line)] bg-[var(--soft-2)] text-[13px] placeholder:text-[var(--muted-2)] outline-none focus:border-[var(--line-strong)]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 text-[11.5px] text-[var(--muted)]">
              <span>已选 <span className="text-[var(--text)] font-bold">{selected.size}</span> 个账户</span>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => onChange(new Set())}
                  className="text-[var(--text)] font-semibold hover:underline cursor-pointer"
                >
                  清空
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* Saved groups */}
            <Section icon={<Pin size={11} />} title="已保存分组" defaultOpen>
              <div className="grid grid-cols-2 gap-1.5">
                {ACCOUNT_GROUPS.filter((g) => g.type === "user").map((g) => {
                  const allSelected = g.accountIds.every((id) => selected.has(id))
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => (allSelected ? clearAll(g.accountIds) : selectAll(g.accountIds))}
                      className={cn(
                        "h-9 px-3 rounded-lg border text-[12.5px] font-semibold flex items-center justify-between gap-1 cursor-pointer transition-colors",
                        allSelected
                          ? "bg-[var(--text)] border-[var(--text)] text-white"
                          : "bg-white border-[var(--line)] text-[var(--text)] hover:bg-[var(--soft-2)]"
                      )}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{g.emoji}</span>
                        <span className="truncate">{g.name}</span>
                      </span>
                      <span className={cn("text-[11px] font-bold shrink-0", allSelected ? "text-white/70" : "text-[var(--muted)]")}>
                        {g.accountIds.length}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Section>

            {/* Top by spend */}
            <Section icon={<Tag size={11} />} title="本周 Spend Top 10" defaultOpen>
              {topBySpend.map((a) => (
                <AccountRow
                  key={a.id}
                  id={a.id}
                  name={a.name}
                  realId={a.id}
                  status={a.status}
                  roi={a.metrics7d.roi}
                  spend={a.metrics7d.spend}
                  selected={selected.has(a.id)}
                  onToggle={() => toggle(a.id)}
                />
              ))}
            </Section>

            {/* Grouped by status */}
            {(["scaling", "learning", "rewrite", "warming", "paused"] as AccountStatus[]).map((s) => {
              const list = byStatus[s]
              if (list.length === 0) return null
              const allIds = list.map((a) => a.id)
              const allSel = allIds.every((id) => selected.has(id))
              return (
                <Section
                  key={s}
                  icon={<span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: STATUS_META[s].dot }} />}
                  title={`${STATUS_META[s].label} (${list.length})`}
                  defaultOpen={false}
                  trailing={
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (allSel) clearAll(allIds)
                        else selectAll(allIds)
                      }}
                      className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
                    >
                      {allSel ? "取消全选" : "全选"}
                    </button>
                  }
                >
                  {list.slice(0, 25).map((a) => (
                    <AccountRow
                      key={a.id}
                      id={a.id}
                      name={a.name}
                      realId={a.id}
                      status={a.status}
                      roi={a.metrics7d.roi}
                      spend={a.metrics7d.spend}
                      selected={selected.has(a.id)}
                      onToggle={() => toggle(a.id)}
                    />
                  ))}
                  {list.length > 25 && (
                    <p className="text-[11.5px] text-[var(--muted)] py-2 px-2">还有 {list.length - 25} 个，搜索可缩小范围</p>
                  )}
                </Section>
              )
            })}

            {filtered.length === 0 && (
              <div className="py-12 text-center text-[13px] text-[var(--muted)]">没有匹配的账户</div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2.5 border-t border-[var(--line)] flex items-center justify-end gap-2 bg-[var(--soft-2)]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-8 px-4 rounded-full bg-[#18181b] text-white text-[12.5px] font-bold cursor-pointer hover:opacity-90"
            >
              完成
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function Section({
  icon,
  title,
  trailing,
  children,
  defaultOpen = true,
}: {
  icon: React.ReactNode
  title: string
  trailing?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[var(--line)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 h-9 cursor-pointer hover:bg-[var(--soft-2)]"
      >
        <span className="text-[var(--muted)]">{icon}</span>
        <span className="text-[12px] font-bold text-[var(--text)] flex-1 text-left">{title}</span>
        {trailing}
        <ChevronDown size={11} className={cn("text-[var(--muted)] transition-transform", !open && "-rotate-90")} />
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </div>
  )
}

function AccountRow({
  id,
  name,
  realId,
  status,
  roi,
  spend,
  selected,
  onToggle,
}: {
  id: string
  name: string
  realId: string
  status: AccountStatus
  roi: number
  spend: number
  selected: boolean
  onToggle: () => void
}) {
  const meta = STATUS_META[status]
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-left",
        selected ? "bg-[var(--soft)]" : "hover:bg-[var(--soft-2)]"
      )}
    >
      <span
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
          selected ? "bg-[var(--text)] border-[var(--text)] text-white" : "bg-white border-[var(--line-strong)] text-transparent"
        )}
      >
        <Check size={11} strokeWidth={3} />
      </span>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: meta.dot }} />
      <div className="min-w-0 flex-1">
        <p className="text-[12.5px] font-semibold text-[var(--text)] truncate">{name}</p>
        <p className="text-[10.5px] text-[var(--muted)] font-mono truncate">{realId}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[11px] font-bold text-[var(--text)]">ROI {roi.toFixed(2)}</p>
        <p className="text-[10.5px] text-[var(--muted)]">${(spend / 1000).toFixed(1)}K</p>
      </div>
    </button>
  )
}
