"use client"

import { useMemo, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
  X, Plus, Send, Pencil, Trash2, Check, Sparkles, ChevronDown,
  DollarSign, Clapperboard, Users, Gauge, Power, StickyNote,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ACTIVITY_KIND_META,
  diagnoseTrend,
  type ActivityKind,
  type ActivityLog,
} from "@/lib/insights/activity-log"

const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  budget: DollarSign,
  creative: Clapperboard,
  audience: Users,
  bid: Gauge,
  status: Power,
  note: StickyNote,
}

const KIND_ORDER: ActivityKind[] = ["budget", "creative", "audience", "bid", "status", "note"]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  dayIndex: number | null
  dayLabel: string
  logs: ActivityLog[]
  onAdd: (log: Omit<ActivityLog, "id">) => void
  onUpdate: (id: string, patch: Partial<ActivityLog>) => void
  onDelete: (id: string) => void
}

export function ActivityLogDrawer({
  open, onOpenChange, dayIndex, dayLabel, logs, onAdd, onUpdate, onDelete,
}: Props) {
  const [filter, setFilter] = useState<ActivityKind | "all">("all")
  const [quickText, setQuickText] = useState("")
  const [quickKind, setQuickKind] = useState<ActivityKind>("note")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editKind, setEditKind] = useState<ActivityKind>("note")

  const dayLogs = useMemo(
    () => logs.filter((l) => l.dayIndex === dayIndex),
    [logs, dayIndex]
  )
  const visible = filter === "all" ? dayLogs : dayLogs.filter((l) => l.kind === filter)
  const diagnosis = useMemo(
    () => (dayIndex === null ? "" : diagnoseTrend(dayIndex, logs)),
    [dayIndex, logs]
  )

  // 各类型计数，用于筛选 tab 上的角标
  const countByKind = useMemo(() => {
    const m = {} as Record<ActivityKind, number>
    for (const k of KIND_ORDER) m[k] = 0
    for (const l of dayLogs) m[l.kind]++
    return m
  }, [dayLogs])

  function submitQuick() {
    const text = quickText.trim()
    if (!text || dayIndex === null) return
    const [head, ...rest] = text.split("：")
    onAdd({
      dayIndex,
      kind: quickKind,
      title: rest.length ? head : text,
      desc: rest.length ? rest.join("：") : "",
      operator: "我",
      time: "刚刚",
    })
    setQuickText("")
  }

  function startEdit(log: ActivityLog) {
    setEditingId(log.id)
    setEditTitle(log.title)
    setEditDesc(log.desc)
    setEditKind(log.kind)
  }

  function saveEdit() {
    if (!editingId) return
    onUpdate(editingId, { title: editTitle.trim(), desc: editDesc.trim(), kind: editKind })
    setEditingId(null)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed right-3 top-3 bottom-3 z-50 w-[540px] bg-white rounded-2xl border border-[var(--line)] shadow-[0_24px_64px_rgba(0,0,0,0.16)] flex flex-col overflow-hidden outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right-1/2">
          {/* Header */}
          <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-3 border-b border-[var(--line)]">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-[var(--text)]">
                操作日志
              </Dialog.Title>
              <p className="text-xs text-[var(--muted)] mt-1 tabular-nums">
                {dayLabel} · {dayLogs.length} 条记录
              </p>
            </div>
            <Dialog.Close className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--text)] cursor-pointer shrink-0 transition-colors">
              <X size={16} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* AI 诊断 */}
            <div className="px-6 pt-5">
              <div className="rounded-lg border border-[var(--line)] bg-[var(--soft-2)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-md bg-[var(--lime-soft)] text-[#5a7821] flex items-center justify-center shrink-0">
                    <Sparkles size={12} strokeWidth={2} />
                  </span>
                  <span className="text-sm font-semibold text-[var(--text)]">AI 拐点诊断</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--muted)]">{diagnosis}</p>
              </div>
            </div>

            {/* 筛选 tabs — shadcn segmented */}
            <div className="px-6 pt-5">
              <div className="inline-flex h-9 items-center rounded-md bg-[var(--soft)] p-1 gap-0.5 flex-wrap">
                <SegItem active={filter === "all"} onClick={() => setFilter("all")}>
                  全部 <span className="tabular-nums opacity-60">{dayLogs.length}</span>
                </SegItem>
                {KIND_ORDER.filter((k) => countByKind[k] > 0).map((k) => (
                  <SegItem key={k} active={filter === k} onClick={() => setFilter(k)}>
                    {ACTIVITY_KIND_META[k].label}{" "}
                    <span className="tabular-nums opacity-60">{countByKind[k]}</span>
                  </SegItem>
                ))}
              </div>
            </div>

            {/* 快速添加 */}
            <div className="px-6 pt-4 flex items-center gap-2">
              <KindSelect value={quickKind} onChange={setQuickKind} />
              <input
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitQuick() }}
                placeholder="记一条操作…（标题：说明）"
                className="flex-1 h-9 px-3 rounded-md border border-[var(--line)] bg-white text-sm outline-none focus:ring-1 focus:ring-[var(--line-strong)] focus:border-[var(--line-strong)] transition placeholder:text-[var(--muted-2)]"
              />
              <button
                onClick={submitQuick}
                disabled={!quickText.trim()}
                className="h-9 w-9 rounded-md border border-[var(--line)] bg-white text-[var(--text)] flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--soft)] transition-colors cursor-pointer"
              >
                <Send size={14} strokeWidth={2} />
              </button>
            </div>

            {/* 时间线 */}
            <div className="px-6 py-5">
              {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-14 rounded-lg border border-dashed border-[var(--line)]">
                  <div className="w-9 h-9 rounded-md bg-[var(--soft)] flex items-center justify-center mb-3">
                    <Plus size={16} className="text-[var(--muted-2)]" />
                  </div>
                  <p className="text-sm text-[var(--text)]">暂无操作记录</p>
                  <p className="text-xs text-[var(--muted)] mt-1">在上方输入框记录第一条</p>
                </div>
              ) : (
                <ol className="relative">
                  {visible.map((log, i) => {
                    const meta = ACTIVITY_KIND_META[log.kind]
                    const Icon = KIND_ICON[log.kind]
                    const isLast = i === visible.length - 1
                    const editing = editingId === log.id
                    return (
                      <li key={log.id} className="relative pl-11 pb-3 last:pb-0">
                        {!isLast && (
                          <span className="absolute left-[15px] top-9 bottom-0 w-px bg-[var(--line)]" />
                        )}
                        <span
                          className="absolute left-0 top-0 w-[31px] h-[31px] rounded-md border border-[var(--line)] bg-white flex items-center justify-center"
                          style={{ color: meta.color }}
                        >
                          <Icon size={14} strokeWidth={2} />
                        </span>

                        <div className="rounded-lg border border-[var(--line)] bg-white p-3.5 group hover:border-[var(--line-strong)] transition-colors">
                          {editing ? (
                            <div className="space-y-2.5">
                              <KindSelect value={editKind} onChange={setEditKind} className="w-full" />
                              <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="标题"
                                className="w-full h-9 px-3 rounded-md border border-[var(--line)] bg-white text-sm font-medium outline-none focus:ring-1 focus:ring-[var(--line-strong)] focus:border-[var(--line-strong)] transition"
                              />
                              <textarea
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                rows={2}
                                placeholder="说明"
                                className="w-full px-3 py-2 rounded-md border border-[var(--line)] bg-white text-xs outline-none focus:ring-1 focus:ring-[var(--line-strong)] focus:border-[var(--line-strong)] resize-none transition"
                              />
                              <div className="flex items-center gap-2 justify-end pt-0.5">
                                <button
                                  onClick={() => setEditingId(null)}
                                  className="h-8 px-3 rounded-md border border-[var(--line)] bg-white text-xs font-medium text-[var(--text)] hover:bg-[var(--soft)] cursor-pointer transition-colors"
                                >
                                  取消
                                </button>
                                <button
                                  onClick={saveEdit}
                                  className="h-8 px-3 rounded-md bg-[var(--near-black)] text-white text-xs font-medium flex items-center gap-1.5 hover:opacity-90 cursor-pointer transition-opacity"
                                >
                                  <Check size={12} strokeWidth={2.5} /> 保存
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <span
                                    className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold shrink-0"
                                    style={{
                                      borderColor: meta.bg,
                                      backgroundColor: meta.bg,
                                      color: meta.color,
                                    }}
                                  >
                                    {meta.label}
                                  </span>
                                  <h4 className="text-sm font-medium text-[var(--text)] leading-tight">
                                    {log.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <span className="text-xs text-[var(--muted-2)] tabular-nums mr-1 group-hover:hidden">
                                    {log.time}
                                  </span>
                                  <button
                                    onClick={() => startEdit(log)}
                                    className="w-7 h-7 rounded-md hidden group-hover:flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--text)] cursor-pointer transition-colors"
                                  >
                                    <Pencil size={12.5} />
                                  </button>
                                  <button
                                    onClick={() => onDelete(log.id)}
                                    className="w-7 h-7 rounded-md hidden group-hover:flex items-center justify-center text-[var(--muted)] hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
                                  >
                                    <Trash2 size={12.5} />
                                  </button>
                                </div>
                              </div>
                              {log.desc && (
                                <p className="mt-1.5 text-xs text-[var(--muted)] leading-relaxed">
                                  {log.desc}
                                </p>
                              )}
                              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                                {log.impact && (
                                  <span
                                    className={cn(
                                      "inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold tabular-nums",
                                      log.impactTone === "down"
                                        ? "border-red-100 bg-red-50 text-red-600"
                                        : "border-emerald-100 bg-emerald-50 text-emerald-700"
                                    )}
                                  >
                                    {log.impact}
                                  </span>
                                )}
                                <span className="text-xs text-[var(--muted-2)]">{log.operator}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── shadcn-style segmented tab item ────────────────────────────────────────

function SegItem({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-state={active ? "active" : "inactive"}
      className={cn(
        "h-7 px-2.5 rounded text-xs font-medium whitespace-nowrap transition cursor-pointer inline-flex items-center gap-1",
        active
          ? "bg-white text-[var(--text)] shadow-[0_1px_2px_rgba(9,9,11,0.08)]"
          : "text-[var(--muted)] hover:text-[var(--text)]"
      )}
    >
      {children}
    </button>
  )
}

// ─── shadcn-style Select（基于 DropdownMenu，项目未装 react-select 原语） ────

function KindSelect({
  value, onChange, className,
}: { value: ActivityKind; onChange: (k: ActivityKind) => void; className?: string }) {
  const meta = ACTIVITY_KIND_META[value]
  const Icon = KIND_ICON[value]
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "h-9 px-3 rounded-md border border-[var(--line)] bg-white text-sm font-medium text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:bg-[var(--soft-2)] shrink-0 transition data-[state=open]:ring-1 data-[state=open]:ring-[var(--line-strong)]",
            className
          )}
        >
          <Icon size={13} strokeWidth={2} style={{ color: meta.color }} />
          <span className="flex-1 text-left">{meta.label}</span>
          <ChevronDown size={12} className="text-[var(--muted)] shrink-0" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-[60] min-w-[150px] p-1 bg-white border border-[var(--line)] rounded-md shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {KIND_ORDER.map((k) => {
            const m = ACTIVITY_KIND_META[k]
            const I = KIND_ICON[k]
            const active = k === value
            return (
              <DropdownMenu.Item
                key={k}
                onSelect={() => onChange(k)}
                className={cn(
                  "h-8 px-2 rounded text-sm cursor-pointer flex items-center gap-2 outline-none transition-colors",
                  active
                    ? "bg-[var(--soft)] font-medium"
                    : "data-[highlighted]:bg-[var(--soft-2)]"
                )}
              >
                <I size={13} strokeWidth={2} style={{ color: m.color }} />
                <span className="flex-1 text-[var(--text)]">{m.label}</span>
                {active && <Check size={12} strokeWidth={2.5} className="text-[var(--text)]" />}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
