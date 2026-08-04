"use client"

/** 素材决策闭环的共享 UI 原子：抽屉、步骤条、结论卡、证据卡、筛选 chip 等 */

import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, TriangleAlert, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DECISION_STATUS_META, type DecisionStatus } from "@/lib/insights/decision-mock"

// ─── 布局 ────────────────────────────────────────────────────────────────────

export function Surface({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-[var(--line)] bg-white shadow-[0_1px_2px_rgba(9,9,11,.02)]", className)}>
      {children}
    </section>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  aside,
  className,
}: {
  eyebrow?: string
  title: string
  description: string
  aside?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-[var(--muted-2)]">{eyebrow}</p>
        ) : null}
        <h2 className="text-[18px] font-extrabold tracking-tight text-[var(--text)]">{title}</h2>
        <p className="mt-1 text-[11.5px] text-[var(--muted)]">{description}</p>
      </div>
      {aside ? <div className="flex shrink-0 items-center gap-2">{aside}</div> : null}
    </div>
  )
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between gap-3">
      <h3 className="text-[13px] font-extrabold text-[var(--text)]">{children}</h3>
      {action}
    </div>
  )
}

/** 顶部 KPI 卡：左上图标、右上说明、下方标题与数值 */
export function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
  estimated,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  value: React.ReactNode
  hint: string
  estimated?: boolean
}) {
  return (
    <Surface className="p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--soft)] text-[var(--muted)]">
          <Icon size={15} strokeWidth={1.9} />
        </span>
        <span className="truncate text-[9.5px] text-[var(--muted)]">{hint}</span>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[10.5px] font-semibold text-[var(--muted)]">
        {label}
        {estimated ? (
          <span className="rounded border border-[var(--line)] px-1 text-[8.5px] font-bold text-[var(--muted-2)]">预估</span>
        ) : null}
      </p>
      <p className="mt-0.5 text-[22px] font-extrabold tracking-tight tabular-nums text-[var(--text)]">{value}</p>
    </Surface>
  )
}

/** 单选筛选 chip，带数量；数量为 0 时仍可点击，进入空状态 */
export function FilterChip({
  active,
  label,
  count,
  tone = "dark",
  onClick,
}: {
  active: boolean
  label: string
  count?: number
  tone?: "dark" | "lime"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-8 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-3.5 text-[11.5px] font-bold transition-colors",
        active
          ? tone === "lime"
            ? "bg-[var(--lime)] text-[var(--near-black)]"
            : "bg-[var(--near-black)] text-white"
          : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--text)]"
      )}
    >
      {label}
      {count === undefined ? null : (
        <span className={cn("ml-1.5 tabular-nums", active ? "opacity-80" : "text-[var(--muted-2)]")}>{count}</span>
      )}
    </button>
  )
}

// ─── 抽屉 ────────────────────────────────────────────────────────────────────

export function DecisionDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount>
              <motion.aside
                className="fixed bottom-4 right-4 top-4 z-50 flex w-[min(560px,calc(100vw-32px))] flex-col overflow-hidden rounded-[24px] border border-[var(--line)] bg-white shadow-[0_28px_90px_rgba(9,9,11,0.22)] outline-none"
                initial={{ opacity: 0, x: reduceMotion ? 0 : 48, scale: reduceMotion ? 1 : 0.985 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : 36, scale: reduceMotion ? 1 : 0.99 }}
                transition={{ type: "spring", stiffness: 420, damping: 38, mass: 0.85 }}
              >
                <header className="flex items-start gap-4 border-b border-[var(--line)] px-6 py-5">
                  <div className="min-w-0 flex-1">
                    <Dialog.Title className="truncate text-[19px] font-extrabold tracking-tight text-[var(--text)]">
                      {title}
                    </Dialog.Title>
                    {description ? (
                      <Dialog.Description className="mt-1 truncate text-[11.5px] text-[var(--muted)]">
                        {description}
                      </Dialog.Description>
                    ) : null}
                  </div>
                  <Dialog.Close
                    className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--soft)] text-[var(--muted)] transition-colors hover:text-[var(--text)]"
                    aria-label="关闭详情"
                  >
                    <X size={15} />
                  </Dialog.Close>
                </header>
                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
                {footer ? <footer className="border-t border-[var(--line)] bg-white px-6 py-4">{footer}</footer> : null}
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  )
}

/** 闭环步骤条：诊断 → 生成 → 投放 → 回流 */
export function DrawerStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="mb-5 grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, index) => {
        const complete = index < current
        const active = index === current
        return (
          <div key={step} className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold",
                  complete
                    ? "bg-[var(--near-black)] text-white"
                    : active
                      ? "bg-[var(--lime)] text-[var(--near-black)]"
                      : "bg-[var(--soft)] text-[var(--muted)]"
                )}
              >
                {complete ? <Check size={11} strokeWidth={3} /> : index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span className={cn("h-0.5 flex-1 rounded-full", index < current ? "bg-[var(--lime)]" : "bg-[var(--line)]")} />
              ) : null}
            </div>
            <p className={cn("mt-1.5 truncate text-[10px] font-semibold", active ? "text-[var(--text)]" : "text-[var(--muted)]")}>
              {step}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ─── 结论与证据 ──────────────────────────────────────────────────────────────

const CALLOUT_TONE: Record<string, string> = {
  good: "border-emerald-100 bg-emerald-50/70",
  warn: "border-amber-100 bg-amber-50/70",
  info: "border-blue-100 bg-blue-50/60",
  danger: "border-red-100 bg-red-50/60",
  neutral: "border-[var(--line)] bg-[var(--soft-2)]",
}

/** 唯一结果卡：状态 Badge + 一句话判断 + 依据行 */
export function ResultCallout({
  badge,
  headline,
  lines,
  tone = "neutral",
}: {
  badge: React.ReactNode
  headline: string
  lines: string[]
  tone?: "good" | "warn" | "info" | "danger" | "neutral"
}) {
  return (
    <div className={cn("mb-5 rounded-2xl border p-4", CALLOUT_TONE[tone])}>
      {badge}
      <p className="mt-2 text-[16px] font-extrabold leading-snug tracking-tight text-[var(--text)]">{headline}</p>
      <div className="mt-1.5 space-y-1">
        {lines.map((line) => (
          <p key={line} className="text-[11.5px] leading-relaxed text-[var(--muted)]">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export function EvidenceCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string
  value: string
  hint: string
  tone?: "default" | "good" | "bad"
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        tone === "good"
          ? "border-emerald-100 bg-emerald-50/50"
          : tone === "bad"
            ? "border-red-100 bg-red-50/50"
            : "border-[var(--line)] bg-[var(--soft-2)]"
      )}
    >
      <p className="text-[10.5px] font-semibold text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-[19px] font-extrabold tracking-tight tabular-nums text-[var(--text)]">{value}</p>
      <p className="mt-0.5 truncate text-[10px] text-[var(--muted)]">{hint}</p>
    </div>
  )
}

/** 归因结论 / 约束说明这类灰底解释块 */
export function ConclusionBox({ title, detail, tone = "neutral" }: { title: string; detail: string; tone?: "good" | "warn" | "info" | "danger" | "neutral" }) {
  return (
    <div className={cn("rounded-xl border p-3.5", CALLOUT_TONE[tone])}>
      <p className="text-[10.5px] font-semibold text-[var(--muted)]">归因结论</p>
      <p className="mt-1 text-[13px] font-extrabold leading-snug text-[var(--text)]">{title}</p>
      <p className="mt-1 text-[10.5px] leading-relaxed text-[var(--muted)]">{detail}</p>
    </div>
  )
}

/** 键值说明表，用于「进入素材决策后自动带入」「下一次投放策略」 */
export function ContextTable({ rows }: { rows: Array<{ label: string; value: React.ReactNode; hint?: string }> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)]">
      {rows.map((row, index) => (
        <div
          key={row.label}
          className={cn(
            "grid grid-cols-[104px_1fr] items-start gap-3 px-3.5 py-2.5",
            index < rows.length - 1 && "border-b border-[var(--line)]"
          )}
        >
          <span className="text-[10.5px] font-semibold text-[var(--muted)]">{row.label}</span>
          <span className="min-w-0">
            <span className="block text-[11.5px] font-bold text-[var(--text)]">{row.value}</span>
            {row.hint ? <span className="mt-0.5 block text-[10px] text-[var(--muted)]">{row.hint}</span> : null}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Before / After 对比行 */
export function CompareRow({ label, before, after }: { label: string; before: string; after: string }) {
  return (
    <div className="grid grid-cols-[1fr_92px_28px_92px] items-center text-[11.5px]">
      <span className="font-semibold text-[var(--text)]">{label}</span>
      <span className="text-right text-[var(--muted)] line-through">{before}</span>
      <ArrowRight size={13} className="mx-auto text-[var(--muted-2)]" />
      <strong className="text-right tabular-nums text-[var(--text)]">{after}</strong>
    </div>
  )
}

/** 样本进度条：待观察状态展示还差多少才能判断 */
export function SampleProgress({ label, current, target, unit }: { label: string; current: number; target: number; unit: string }) {
  const pct = Math.max(4, Math.min(100, (current / Math.max(target, 1)) * 100))
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[10.5px]">
        <span className="font-semibold text-[var(--muted)]">{label}</span>
        <span className="tabular-nums text-[var(--text)]">
          {current} / {target} {unit}
        </span>
      </div>
      <span className="block h-1.5 overflow-hidden rounded-full bg-[var(--soft)]">
        <span className="block h-full rounded-full bg-[var(--lime)]" style={{ width: `${pct}%` }} />
      </span>
    </div>
  )
}

// ─── 二次确认弹窗（关停 / 止损这类外部写操作） ────────────────────────────────

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  impacts,
  recoverHint,
  confirmLabel,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  impacts: Array<{ label: string; value: string }>
  recoverHint: string
  confirmLabel: string
  onConfirm: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[min(440px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-[var(--line)] bg-white p-6 shadow-[0_28px_90px_rgba(9,9,11,0.24)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <TriangleAlert size={17} strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <Dialog.Title className="text-[15px] font-extrabold text-[var(--text)]">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-[11.5px] leading-relaxed text-[var(--muted)]">
                {description}
              </Dialog.Description>
            </div>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--line)]">
            {impacts.map((impact, index) => (
              <div
                key={impact.label}
                className={cn("flex items-center justify-between gap-3 px-3.5 py-2.5", index < impacts.length - 1 && "border-b border-[var(--line)]")}
              >
                <span className="text-[10.5px] font-semibold text-[var(--muted)]">{impact.label}</span>
                <span className="truncate text-[11.5px] font-bold text-[var(--text)]">{impact.value}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-[var(--soft-2)] px-3 py-2 text-[10.5px] leading-relaxed text-[var(--muted)]">{recoverHint}</p>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline">取消</Button>
            </Dialog.Close>
            <Button variant="destructive" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── 小组件 ──────────────────────────────────────────────────────────────────

export function DecisionBadge({ status, className }: { status: DecisionStatus; className?: string }) {
  const meta = DECISION_STATUS_META[status]
  return <Badge className={cn("border-0", meta.className, className)}>{meta.label}</Badge>
}

export function ProductThumb({ accent, label, className }: { accent: string; label: string; className?: string }) {
  return (
    <div className={cn("relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br", accent, className)}>
      <div className="h-9 w-5 rounded-[10px] bg-white/80 shadow-sm" />
      <span className="absolute inset-x-2 bottom-1.5 h-1 rounded-full bg-white/85" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function CreativeThumb({ accent, className }: { accent: string; className?: string }) {
  return (
    <div className={cn("relative flex h-[72px] w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br", accent, className)}>
      <div className="size-7 rounded-full bg-white/70" />
      <span className="absolute inset-x-2 bottom-3 h-1 rounded-full bg-white/80" />
      <span className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-[var(--lime)]" />
    </div>
  )
}

/** 相对基准的差值指示，0 表示与均值持平 */
export function Delta({ value, inverse = false }: { value: number; inverse?: boolean }) {
  if (value === 0) {
    return <span className="inline-flex items-center rounded px-1 text-[10px] font-semibold text-[var(--muted)]">≈ 均值</span>
  }
  const good = inverse ? value < 0 : value > 0
  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-bold tabular-nums",
        good ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
      )}
    >
      <Icon size={10} strokeWidth={2.6} />
      {Math.abs(value)}%
    </span>
  )
}

/** 表格列头。列间距与数据行保持一致（gap-3），最后一列可右对齐 */
export function TableHead({
  columns,
  template,
  rightAlignLast,
}: {
  columns: React.ReactNode[]
  template: string
  rightAlignLast?: boolean
}) {
  return (
    <div
      className="grid gap-3 border-b border-[var(--line)] bg-[var(--soft-2)] px-4 py-3 text-[10px] font-extrabold uppercase tracking-wide text-[var(--muted)]"
      style={{ gridTemplateColumns: template }}
    >
      {columns.map((column, index) => (
        <span
          key={index}
          className={cn("min-w-0 truncate", rightAlignLast && index === columns.length - 1 && "text-right")}
        >
          {column}
        </span>
      ))}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[13px] font-extrabold text-[var(--text)]">{title}</p>
      <p className="mt-1.5 max-w-[380px] text-[11.5px] leading-relaxed text-[var(--muted)]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
