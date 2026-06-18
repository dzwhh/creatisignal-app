"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import {
  ArrowRight,
  Clock3,
  FileText,
  GitBranch,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
  Users,
  Wand2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  REPLICA_CATEGORY_META,
  REPLICA_STAGE_META,
  type ReplicaProject,
  type ReplicaStage,
} from "@/lib/insights/types"
import { REPLICA_PROJECTS } from "@/lib/insights/mock"

type StageFilter = "all" | ReplicaStage

export function ReplicateHub() {
  const router = useRouter()
  const [stageFilter, setStageFilter] = useState<StageFilter>("all")
  const [query, setQuery] = useState("")
  const [newOpen, setNewOpen] = useState(false)
  const [projectOverrides, setProjectOverrides] = useState<Record<string, string>>({})

  const projects = useMemo<ReplicaProject[]>(() => {
    return REPLICA_PROJECTS.map((p) =>
      projectOverrides[p.id] ? { ...p, title: projectOverrides[p.id] } : p
    )
  }, [projectOverrides])

  const filtered = useMemo(() => {
    let list = projects
    if (stageFilter !== "all") list = list.filter((p) => p.stage === stageFilter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sourceName.toLowerCase().includes(q) ||
          p.productSku.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [projects, stageFilter, query])

  const stageCounts = useMemo(() => ({
    all: projects.length,
    source: projects.filter((p) => p.stage === "source").length,
    breakdown: projects.filter((p) => p.stage === "breakdown").length,
    direction: projects.filter((p) => p.stage === "direction").length,
  }), [projects])

  function handleRename(id: string, nextTitle: string) {
    setProjectOverrides((prev) => ({ ...prev, [id]: nextTitle }))
  }

  function handleCreateProject(title: string) {
    setNewOpen(false)
    const slug = title.trim() || "未命名项目"
    router.push(`/replicate/new?title=${encodeURIComponent(slug)}`)
  }

  return (
    <main className="flex-1 overflow-y-auto bg-[var(--soft-2)]">
      <div className="max-w-[1280px] mx-auto px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold text-[var(--text)] tracking-tight">爆款推荐</h1>
            <p className="text-[12.5px] text-[var(--muted)] mt-1">从市场或自有素材开始复刻 · 系统自动判定生命周期 · 你只做决策</p>
          </div>
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="h-9 px-4 rounded-full bg-[#18181b] text-white text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90"
          >
            <Plus size={13} strokeWidth={2.5} />
            新建项目
          </button>
        </div>

        {/* Two entries */}
        <section>
          <div className="grid grid-cols-2 gap-4">
            <PathTypeCard
              tone="violet"
              icon={<Users size={20} />}
              href="#"
              tag="UGC 风格"
              title="UGC 创意"
              desc="复刻达人 / 红人 / 真实买家秀 / 测评类 UGC 素材，跑得快、真实感强、信任建立快"
              kpiLabel="适合场景"
              kpiValue="新品上市 · 信任建立"
              hint="UGC 视角第一人称口播 + 真实场景，转化路径短"
              comingSoon
            />
            <PathTypeCard
              tone="amber"
              icon={<Megaphone size={20} />}
              href="/replicate/new?type=ad"
              tag="商业广告"
              title="广告创意"
              desc="已验证的爆款广告素材（自有 / 竞品），结构稳、卖点突出、CVR / ROAS 验证扎实"
              kpiLabel="适合场景"
              kpiValue="放量期 · 稳定 ROI"
              hint="广告骨架经过付费投放验证，CVR / ROAS 有数据支撑"
              recommended
            />
          </div>
          <p className="text-[11.5px] text-[var(--muted)] mt-3 flex items-center gap-1.5">
            <GitBranch size={11} />
            想从已项目继续派生（沿用已验证的创意）？滚动到下方点击对应项目卡。
          </p>
        </section>

        {/* Recent projects */}
        <section className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-extrabold text-[var(--text)]">最近创建项目</h2>
              <span className="text-[11px] text-[var(--muted)] font-semibold">{filtered.length} / {projects.length}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Stage group：4 选项（全部 + 3 个流程阶段） */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] font-bold text-[var(--muted-2)] uppercase tracking-wide mr-0.5">阶段</span>
                <FilterChip label="全部" count={stageCounts.all} active={stageFilter === "all"} onClick={() => setStageFilter("all")} />
                <FilterChip label={REPLICA_STAGE_META.source.label} count={stageCounts.source} active={stageFilter === "source"} onClick={() => setStageFilter("source")} dot={REPLICA_STAGE_META.source.dot} />
                <FilterChip label={REPLICA_STAGE_META.breakdown.label} count={stageCounts.breakdown} active={stageFilter === "breakdown"} onClick={() => setStageFilter("breakdown")} dot={REPLICA_STAGE_META.breakdown.dot} />
                <FilterChip label={REPLICA_STAGE_META.direction.label} count={stageCounts.direction} active={stageFilter === "direction"} onClick={() => setStageFilter("direction")} dot={REPLICA_STAGE_META.direction.dot} />
              </div>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索项目..."
                  className="h-8 pl-7 pr-3 rounded-full border border-[var(--line)] bg-white text-[12px] w-[180px] outline-none focus:border-[var(--line-strong)]"
                />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState stageFilter={stageFilter} hasQuery={query.trim().length > 0} />
          ) : (
            <div className="grid grid-cols-3 gap-3 p-5">
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onRename={(next) => handleRename(p.id, next)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Footer help */}
        <section className="bg-white rounded-2xl border border-dashed border-[var(--line)] p-4 flex items-start gap-3 text-[12.5px]">
          <Sparkles size={14} className="mt-0.5 shrink-0 text-[var(--muted)]" />
          <div className="flex-1 text-[var(--muted)] leading-relaxed">
            <span className="text-[var(--text)] font-bold">复刻不是「挑」出来的</span>，是在素材生命周期的正确阶段、做正确动作"放大"出来的。
            进入工作台后系统会自动判定生命周期阶段并阻拦不该复刻的素材（衰退期 / 已退场）。
          </div>
          <Link
            href="/reports"
            className="h-8 px-3 rounded-full border border-[var(--line)] text-[12px] font-bold flex items-center gap-1.5 hover:bg-[var(--soft-2)]"
          >
            <FileText size={12} /> 查看方法论
          </Link>
        </section>
      </div>

      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} onCreate={handleCreateProject} />
    </main>
  )
}

// ─── New Project Dialog ──────────────────────────────────────────────────────

function NewProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (title: string) => void
}) {
  const [name, setName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName("")
      // focus after mount
      window.setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [open])

  const trimmed = name.trim()
  const canSubmit = trimmed.length > 0

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[440px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Dialog.Title className="text-[15px] font-extrabold text-[var(--text)]">新建项目</Dialog.Title>
              <Dialog.Description className="text-[12px] text-[var(--muted)] mt-0.5">先给项目起个名字，进入工作台后可随时修改。</Dialog.Description>
            </div>
            <Dialog.Close className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={14} />
            </Dialog.Close>
          </div>
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSubmit) onCreate(trimmed)
            }}
            placeholder="例如：户外 EDC · UGC 信任向 v1"
            className="w-full h-10 px-3 rounded-lg border border-[var(--line)] bg-white text-[13px] outline-none focus:border-[var(--text)]"
          />
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 px-3.5 rounded-full text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => canSubmit && onCreate(trimmed)}
              className={cn(
                "h-9 px-4 rounded-full text-[12.5px] font-extrabold flex items-center gap-1.5 transition-opacity",
                canSubmit ? "bg-[#18181b] text-white hover:opacity-90 cursor-pointer" : "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
              )}
            >
              创建项目 <ArrowRight size={12} strokeWidth={2.4} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Filter chip ─────────────────────────────────────────────────────────────

function FilterChip({ label, count, active, onClick, dot, icon }: { label: string; count: number; active: boolean; onClick: () => void; dot?: string; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 px-3 rounded-full text-[12px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors",
        active ? "bg-[#18181b] text-white" : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-strong)]"
      )}
    >
      {icon}
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot }} />}
      {label}
      <span className={cn("text-[10.5px] font-bold", active ? "opacity-70" : "text-[var(--muted-2)]")}>{count}</span>
    </button>
  )
}

// ─── Project card (simplified) ───────────────────────────────────────────────

function ProjectCard({ project, onRename }: { project: ReplicaProject; onRename: (next: string) => void }) {
  const catMeta = REPLICA_CATEGORY_META[project.category]
  const stageMeta = REPLICA_STAGE_META[project.stage]
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(project.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) window.setTimeout(() => inputRef.current?.focus(), 50)
  }, [editing])

  const href = project.sourceFingerprint
    ? `/replicate/${project.sourceFingerprint}?product=${project.productSku}&source=${project.category === "market" ? "discover" : "insights"}${project.derivedFromProjectId ? `&derive=${project.derivedFromProjectId}` : ""}`
    : `/replicate/${REPLICA_PROJECT_FALLBACK_FP}?product=${project.productSku}&source=discover`

  function commitRename() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== project.title) onRename(trimmed)
    else setDraft(project.title)
    setEditing(false)
  }

  return (
    <div className="group rounded-xl border border-[var(--line)] bg-white overflow-hidden hover:border-[var(--line-strong)] hover:shadow-[0_4px_16px_rgba(9,9,11,0.06)] transition-all flex flex-col">
      {/* Thumb */}
      <Link href={href} className="block aspect-video bg-[var(--soft)] relative cursor-pointer">
        <img src={project.thumb} alt={project.title} className="w-full h-full object-cover" />
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        {/* Name + edit icon */}
        <div className="flex items-center gap-1.5">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename()
                if (e.key === "Escape") {
                  setDraft(project.title)
                  setEditing(false)
                }
              }}
              className="flex-1 min-w-0 h-7 px-2 rounded border border-[var(--text)] text-[12.5px] font-extrabold outline-none"
            />
          ) : (
            <>
              <h4 className="text-[12.5px] font-extrabold text-[var(--text)] leading-tight line-clamp-2 flex-1 min-w-0">
                {project.title}
              </h4>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setEditing(true)
                }}
                aria-label="重命名"
                className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:bg-[var(--soft)] hover:text-[var(--text)] cursor-pointer transition-opacity"
              >
                <Pencil size={11} />
              </button>
            </>
          )}
        </div>

        {/* 源（灰色小字，在标题下方） */}
        <p className="mt-1 text-[10.5px] text-[var(--muted)] font-semibold tracking-wide">
          源：<span className="font-bold" style={{ color: catMeta.dot }}>{catMeta.label}</span>
        </p>

        {/* Stage chip */}
        <span
          className="mt-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10px] font-bold border self-start"
          style={{ backgroundColor: stageMeta.dot + "15", borderColor: stageMeta.dot + "55", color: stageMeta.dot }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stageMeta.dot }} />
          {stageMeta.label}
        </span>

        {/* 最底下：时间（与上方 stage chip 之间留呼吸空间） */}
        <div className="mt-auto pt-3 border-t border-dashed border-[var(--line)] flex items-center justify-between text-[10.5px] text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <Clock3 size={10} /> {relativeTime(project.updatedAt)}
          </span>
          <Link
            href={href}
            className="inline-flex items-center gap-0.5 font-bold text-[var(--text)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            继续 <ArrowRight size={10} />
          </Link>
        </div>
      </div>
    </div>
  )
}

const REPLICA_PROJECT_FALLBACK_FP = "fp_001"

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const day = Math.floor(ms / (1000 * 60 * 60 * 24))
  if (day < 1) return "今日更新"
  if (day === 1) return "昨天更新"
  if (day < 7) return `${day} 天前`
  if (day < 30) return `${Math.floor(day / 7)} 周前`
  return new Date(iso).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ stageFilter, hasQuery }: { stageFilter: StageFilter; hasQuery: boolean }) {
  const parts: string[] = []
  if (stageFilter !== "all") parts.push(`「${REPLICA_STAGE_META[stageFilter].label}」`)
  const filterLabel = parts.join(" + ")
  return (
    <div className="px-5 py-10 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--soft)] flex items-center justify-center mb-3">
        <Wand2 size={18} className="text-[var(--muted)]" />
      </div>
      <p className="text-[13px] font-bold text-[var(--text)]">
        {hasQuery ? "没有匹配的项目" : filterLabel ? `还没有 ${filterLabel} 的项目` : "还没有复刻项目"}
      </p>
      <p className="text-[11.5px] text-[var(--muted)] mt-1 mb-4">
        {hasQuery ? "换个关键词或清空筛选" : "从上方两个入口任选其一开始复刻"}
      </p>
    </div>
  )
}

// ─── PathTypeCard ────────────────────────────────────────────────────────────

function PathTypeCard({
  tone,
  icon,
  href,
  tag,
  title,
  desc,
  kpiLabel,
  kpiValue,
  hint,
  recommended,
  comingSoon,
}: {
  tone: "violet" | "amber"
  icon: React.ReactNode
  href: string
  tag: string
  title: string
  desc: string
  kpiLabel: string
  kpiValue: string
  hint: string
  recommended?: boolean
  comingSoon?: boolean
}) {
  const meta = tone === "violet"
    ? { dot: "#7c3aed", iconBg: "#f5f3ff", tagBg: "#ede9fe", tagColor: "#6d28d9" }
    : { dot: "#d97706", iconBg: "#fffbeb", tagBg: "#fef3c7", tagColor: "#a16207" }

  const baseClass = cn(
    "group relative rounded-2xl bg-white border p-5 flex flex-col transition-all",
    comingSoon
      ? "border-[var(--line)] grayscale opacity-60 cursor-not-allowed"
      : "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(9,9,11,0.08)]",
    !comingSoon && (recommended ? "border-[#18181b]" : "border-[var(--line)] hover:border-[var(--line-strong)]")
  )

  const body = (
    <>
      {recommended && !comingSoon && (
        <span className="absolute -top-2 left-5 inline-flex h-5 px-2 rounded-full bg-[#18181b] text-white text-[10px] font-extrabold items-center gap-1">
          <Target size={9} strokeWidth={3} /> 推荐入口
        </span>
      )}
      {comingSoon && (
        <span className="absolute -top-2 left-5 inline-flex h-5 px-2 rounded-full bg-[var(--muted)] text-white text-[10px] font-extrabold items-center gap-1">
          Coming Soon
        </span>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: meta.iconBg, color: meta.dot }}>
          {icon}
        </div>
        <span
          className="inline-flex items-center gap-1 h-5 px-2 rounded-md text-[10.5px] font-bold"
          style={{ backgroundColor: meta.tagBg, color: meta.tagColor }}
        >
          {tag}
        </span>
      </div>

      <h3 className="text-[15px] font-extrabold text-[var(--text)]">{title}</h3>
      <p className="text-[11.5px] text-[var(--muted)] mt-0.5 leading-relaxed flex-1">{desc}</p>

      <div className="mt-3 pt-3 border-t border-dashed border-[var(--line)] flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">{kpiLabel}</p>
          <p className="text-[12.5px] font-extrabold text-[var(--text)]">{kpiValue}</p>
        </div>
        {!comingSoon && (
          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--text)] group-hover:gap-2 transition-all">
            开始复刻 <ArrowRight size={12} />
          </span>
        )}
      </div>

      {!comingSoon && (
        <p className="absolute bottom-[-1px] left-0 right-0 px-5 pb-2 text-[10.5px] text-[var(--muted-2)] opacity-0 group-hover:opacity-100 transition-opacity">
          {hint}
        </p>
      )}
    </>
  )

  if (comingSoon) {
    return <div className={baseClass}>{body}</div>
  }
  return <Link href={href} className={baseClass}>{body}</Link>
}
