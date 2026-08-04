"use client"

/** 素材诊断闭环的共享 UI 原子：抽屉、步骤条、结论卡、证据卡、筛选 chip 等 */

import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronRight, Lock, Play, TriangleAlert, X } from "lucide-react"
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
  width = 560,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  /** 抽屉宽度上限，窄屏自动退化为满宽减边距。素材诊断详情用 720，其余保持 560 */
  width?: number
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
                className="fixed bottom-4 right-4 top-4 z-50 flex flex-col overflow-hidden rounded-[24px] border border-[var(--line)] bg-white shadow-[0_28px_90px_rgba(9,9,11,0.22)] outline-none"
                style={{ width: `min(${width}px, calc(100vw - 32px))` }}
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

/** 键值说明表，用于「进入素材诊断后自动带入」「下一次投放策略」 */
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

// ─── 候选方案卡（9:16 封面 + hover 看完整脚本） ───────────────────────────────

export function VideoCard({
  cover,
  category,
  title,
  desc,
  script,
  sourceLabel,
  sourceClassName,
  metric,
  selected,
  disabled,
  onToggle,
  onRemove,
}: {
  cover: string
  category: string
  title: string
  desc: string
  /** hover 浮层里展开的完整脚本 */
  script: string
  sourceLabel?: string
  sourceClassName?: string
  /** 右下角的效果标注，如 ROI 2.42 */
  metric?: string
  selected: boolean
  disabled?: boolean
  onToggle: () => void
  onRemove?: () => void
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled && !selected}
        aria-pressed={selected}
        className={cn(
          "w-full overflow-hidden rounded-xl border bg-white text-left transition-all",
          selected ? "border-[var(--near-black)] ring-1 ring-[var(--near-black)]/15" : "border-[var(--line)] hover:border-[var(--line-strong)]",
          disabled && !selected ? "cursor-not-allowed opacity-45" : "cursor-pointer"
        )}
      >
        <span className="relative block aspect-[9/14] overflow-hidden bg-[var(--soft)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover} alt={title} className="size-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />

          <span className="absolute left-1.5 top-1.5 max-w-[calc(100%-44px)] truncate rounded-md bg-black/65 px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
            {category}
          </span>
          <span
            className={cn(
              "absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-md border transition-colors",
              selected ? "border-[var(--lime)] bg-[var(--lime)] text-[var(--near-black)]" : "border-white/70 bg-black/30 text-transparent"
            )}
          >
            <Check size={12} strokeWidth={3} />
          </span>

          <span className="absolute left-1/2 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition-opacity group-hover:opacity-100">
            <Play size={13} className="translate-x-0.5 text-[#18181b]" fill="#18181b" />
          </span>

          {metric ? (
            <span className="absolute bottom-1.5 left-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums text-white">
              {metric}
            </span>
          ) : null}
          {sourceLabel ? (
            <span className={cn("absolute bottom-1.5 right-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold", sourceClassName ?? "bg-white/90 text-[var(--text)]")}>
              {sourceLabel}
            </span>
          ) : null}
        </span>

        <span className="block p-2">
          <span className="block truncate text-[11px] font-extrabold text-[var(--text)]">{title}</span>
          <span className="mt-0.5 line-clamp-2 block text-[9.5px] leading-relaxed text-[var(--muted)]">{desc}</span>
        </span>
      </button>

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="移除该参考"
          className="absolute -right-1.5 -top-1.5 z-10 hidden size-5 cursor-pointer items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--muted)] shadow-sm hover:text-[var(--text)] group-hover:flex"
        >
          <X size={11} strokeWidth={2.6} />
        </button>
      ) : null}

      {/* hover 浮层：完整脚本 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-full z-20 mb-1.5 hidden group-hover:block">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--near-black)] p-2.5 shadow-[0_12px_32px_rgba(9,9,11,0.28)]">
          <p className="text-[9.5px] font-extrabold text-[var(--lime)]">{category} · 完整脚本</p>
          <p className="mt-1 text-[10px] leading-relaxed text-white/90">{script}</p>
        </div>
      </div>
    </div>
  )
}

// ─── 素材链路四环 ────────────────────────────────────────────────────────────

export function LinkChain({
  stages,
  levels,
}: {
  stages: Array<{ key: string; label: string; question: string }>
  /** 每一环的迭代优先级：主迭代标红、次迭代标黄、其余为已验证锁定 */
  levels: Record<string, "primary" | "secondary" | "ok">
}) {
  return (
    <div className="flex items-stretch gap-1">
      {stages.map((stage, index) => {
        const level = levels[stage.key] ?? "ok"
        return (
          <div key={stage.key} className="flex min-w-0 flex-1 items-stretch">
            <div
              className={cn(
                "min-w-0 flex-1 rounded-lg border px-2 py-2",
                level === "primary" ? "border-red-200 bg-red-50/70"
                : level === "secondary" ? "border-amber-200 bg-amber-50/60"
                : "border-[var(--line)] bg-[var(--soft-2)]"
              )}
            >
              <p className="flex items-center gap-1 text-[10px] font-extrabold">
                {level === "ok" ? (
                  <Lock size={9} className="shrink-0 text-[var(--muted-2)]" />
                ) : (
                  <TriangleAlert size={10} className={cn("shrink-0", level === "primary" ? "text-red-500" : "text-amber-500")} />
                )}
                <span
                  className={cn(
                    "truncate",
                    level === "primary" ? "text-red-700" : level === "secondary" ? "text-amber-800" : "text-[var(--muted)]"
                  )}
                >
                  {stage.label}
                </span>
              </p>
              <p className="mt-0.5 truncate text-[9px] text-[var(--muted)]">{stage.question}</p>
              <p
                className={cn(
                  "mt-1 text-[9px] font-bold",
                  level === "primary" ? "text-red-600" : level === "secondary" ? "text-amber-700" : "text-[var(--muted-2)]"
                )}
              >
                {level === "primary" ? "主迭代 · 优先改这里" : level === "secondary" ? "次迭代 · 可作备选" : "已验证 · 锁定"}
              </p>
            </div>
            {index < stages.length - 1 ? (
              <span className="flex items-center px-0.5 text-[var(--muted-2)]">
                <ChevronRight size={11} />
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

// ─── 迭代变量单选卡 ──────────────────────────────────────────────────────────

export function VariableCard({
  label,
  desc,
  targetMetric,
  locked,
  recommended,
  secondary,
  selected,
  onSelect,
}: {
  label: string
  desc: string
  targetMetric: "ctr" | "cvr"
  locked: string[]
  /** 主迭代环的变量 */
  recommended: boolean
  /** 次迭代环的变量：不打主标，但也不置灰 */
  secondary?: boolean
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full cursor-pointer rounded-xl border p-3 text-left transition-colors",
        selected ? "border-[var(--near-black)] bg-[var(--soft-2)]" : "border-[var(--line)] hover:bg-[var(--soft-2)]",
        !recommended && !secondary && !selected && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[11.5px] font-extrabold text-[var(--text)]">{label}</span>
          {recommended ? (
            <Badge className="border-0 bg-[var(--lime-soft)] text-[9px] text-[#5c7a00]">主迭代</Badge>
          ) : secondary ? (
            <Badge className="border-0 bg-amber-50 text-[9px] text-amber-800">次迭代</Badge>
          ) : null}
        </span>
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full border",
            selected ? "border-[var(--near-black)] bg-[var(--near-black)]" : "border-[var(--line-strong)]"
          )}
        >
          {selected ? <span className="size-1.5 rounded-full bg-white" /> : null}
        </span>
      </div>
      <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">{desc}</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        <span className="rounded bg-[var(--soft)] px-1.5 py-0.5 text-[9px] font-bold text-[var(--text)]">
          目标指标 {targetMetric.toUpperCase()}
        </span>
        <span className="truncate text-[9px] text-[var(--muted-2)]">锁定 {locked.join(" / ")}</span>
      </div>
    </button>
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
