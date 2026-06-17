"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  GitBranch,
  Globe2,
  Megaphone,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wand2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  LIFECYCLE_META,
  REPLICA_CATEGORY_META,
  type ReplicaAxis,
  type ReplicaCategory,
  type ReplicaProject,
  type ReplicaProjectStatus,
} from "@/lib/insights/types"
import { REPLICA_PROJECTS } from "@/lib/insights/mock"

type SourceFilter = "all" | ReplicaCategory
type StageFilter = "all" | "first" | "derived"

const STATUS_META: Record<ReplicaProjectStatus, { label: string; color: string; bg: string }> = {
  draft:        { label: "草稿",   color: "#71717a", bg: "#f4f4f5" },
  in_progress:  { label: "进行中", color: "#a16207", bg: "#fef3c7" },
  submitted:    { label: "已提交", color: "#1d4ed8", bg: "#dbeafe" },
  completed:    { label: "已完成", color: "#15803d", bg: "#dcfce7" },
}

export function ReplicateHub() {
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all")
  const [stageFilter, setStageFilter] = useState<StageFilter>("all")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    let list = REPLICA_PROJECTS
    if (sourceFilter !== "all") list = list.filter((p) => p.category === sourceFilter)
    if (stageFilter === "first") list = list.filter((p) => !p.derivedFromProjectId)
    if (stageFilter === "derived") list = list.filter((p) => Boolean(p.derivedFromProjectId))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.sourceName.toLowerCase().includes(q) || p.productSku.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [sourceFilter, stageFilter, query])

  const counts = useMemo(() => ({
    all: REPLICA_PROJECTS.length,
    market: REPLICA_PROJECTS.filter((p) => p.category === "market").length,
    own: REPLICA_PROJECTS.filter((p) => p.category === "own").length,
    derived: REPLICA_PROJECTS.filter((p) => Boolean(p.derivedFromProjectId)).length,
  }), [])
  const firstCount = counts.all - counts.derived

  return (
    <main className="flex-1 overflow-y-auto bg-[var(--soft-2)]">
      <div className="max-w-[1280px] mx-auto px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold text-[var(--text)] tracking-tight">爆款复刻</h1>
            <p className="text-[12.5px] text-[var(--muted)] mt-1">从市场或自有素材开始复刻 · 系统自动判定生命周期 · 你只做决策</p>
          </div>
          <Link
            href="/insights"
            className="h-9 px-4 rounded-full bg-[#18181b] text-white text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90"
          >
            <Plus size={13} strokeWidth={2.5} />
            新建复刻项目
          </Link>
        </div>

        {/* Two source entries: UGC / 广告 创意复刻 */}
        <section>
          <div className="grid grid-cols-2 gap-4">
            <PathTypeCard
              tone="violet"
              icon={<Users size={20} />}
              href="/replicate/new?type=ugc"
              tag="UGC 风格"
              title="UGC 创意复刻"
              desc="复刻达人 / 红人 / 真实买家秀 / 测评类 UGC 素材，跑得快、真实感强、信任建立快"
              kpiLabel="适合场景"
              kpiValue="新品上市 · 信任建立"
              hint="UGC 视角第一人称口播 + 真实场景，转化路径短"
            />
            <PathTypeCard
              tone="amber"
              icon={<Megaphone size={20} />}
              href="/replicate/new?type=ad"
              tag="商业广告"
              title="广告创意复刻"
              desc="复刻已验证的爆款广告素材（自有 / 竞品），结构稳、卖点突出、CVR / ROAS 验证扎实"
              kpiLabel="适合场景"
              kpiValue="放量期 · 稳定 ROI"
              hint="广告骨架经过付费投放验证，CVR / ROAS 有数据支撑"
              recommended
            />
          </div>
          {counts.derived > 0 && (
            <p className="text-[11.5px] text-[var(--muted)] mt-3 flex items-center gap-1.5">
              <GitBranch size={11} />
              想从已复刻项目继续派生（沿用已验证的变量轴）？滚动到下方点击对应项目卡，或下方筛选「派生迭代」。
            </p>
          )}
        </section>

        {/* Recent projects */}
        <section className="bg-white rounded-2xl border border-[var(--line)] overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-extrabold text-[var(--text)]">最近复刻项目</h2>
              <span className="text-[11px] text-[var(--muted)] font-semibold">{filtered.length} / {REPLICA_PROJECTS.length}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Source group */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] font-bold text-[var(--muted-2)] uppercase tracking-wide mr-0.5">来源</span>
                <FilterChip label="全部" count={counts.all} active={sourceFilter === "all"} onClick={() => setSourceFilter("all")} />
                <FilterChip label="市场" count={counts.market} active={sourceFilter === "market"} onClick={() => setSourceFilter("market")} dot="#0ea5e9" />
                <FilterChip label="自有" count={counts.own} active={sourceFilter === "own"} onClick={() => setSourceFilter("own")} dot="#22c55e" />
              </div>
              {/* Stage group */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] font-bold text-[var(--muted-2)] uppercase tracking-wide mr-0.5">阶段</span>
                <FilterChip label="全部" count={counts.all} active={stageFilter === "all"} onClick={() => setStageFilter("all")} />
                <FilterChip label="首次" count={firstCount} active={stageFilter === "first"} onClick={() => setStageFilter("first")} />
                <FilterChip label="派生" count={counts.derived} active={stageFilter === "derived"} onClick={() => setStageFilter("derived")} icon={<GitBranch size={9} />} />
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
            <EmptyState sourceFilter={sourceFilter} stageFilter={stageFilter} hasQuery={query.trim().length > 0} />
          ) : (
            <div className="grid grid-cols-3 gap-3 p-5">
              {filtered.map((p) => <ProjectCard key={p.id} project={p} />)}
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
    </main>
  )
}

// ─── Category card ───────────────────────────────────────────────────────────

function CategoryCard({
  category,
  icon,
  href,
  count,
  kpiLabel,
  kpiValue,
  hint,
  recommended,
}: {
  category: ReplicaCategory
  icon: React.ReactNode
  href: string
  count: number
  kpiLabel: string
  kpiValue: string
  hint: string
  recommended?: boolean
}) {
  const meta = REPLICA_CATEGORY_META[category]
  return (
    <Link
      href={href}
      className={cn(
        "group relative rounded-2xl bg-white border p-5 flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(9,9,11,0.08)]",
        recommended ? "border-[#18181b]" : "border-[var(--line)] hover:border-[var(--line-strong)]"
      )}
    >
      {recommended && (
        <span className="absolute -top-2 left-5 inline-flex h-5 px-2 rounded-full bg-[#18181b] text-white text-[10px] font-extrabold items-center gap-1">
          <Target size={9} strokeWidth={3} /> 推荐入口
        </span>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: meta.dot + "15", color: meta.dot }}>
          {icon}
        </div>
        <span
          className="inline-flex items-center gap-1 h-5 px-2 rounded-md text-[10.5px] font-bold border"
          style={{ backgroundColor: meta.dot + "10", borderColor: meta.dot + "55", color: meta.dot }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
          {count} 个进行中
        </span>
      </div>

      <h3 className="text-[15px] font-extrabold text-[var(--text)]">{meta.label}</h3>
      <p className="text-[11.5px] text-[var(--muted)] mt-0.5 leading-relaxed flex-1">{meta.desc}</p>

      <div className="mt-3 pt-3 border-t border-dashed border-[var(--line)] flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">{kpiLabel}</p>
          <p className="text-[12.5px] font-extrabold text-[var(--text)]">{kpiValue}</p>
        </div>
        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--text)] group-hover:gap-2 transition-all">
          进入 <ArrowRight size={12} />
        </span>
      </div>

      <p className="absolute bottom-[-1px] left-0 right-0 px-5 pb-2 text-[10.5px] text-[var(--muted-2)] opacity-0 group-hover:opacity-100 transition-opacity">
        {hint}
      </p>
    </Link>
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

// ─── Project card ────────────────────────────────────────────────────────────

function ProjectCard({ project }: { project: ReplicaProject }) {
  const catMeta = REPLICA_CATEGORY_META[project.category]
  const statusMeta = STATUS_META[project.status]
  const href = project.sourceFingerprint
    ? `/replicate/${project.sourceFingerprint}?product=${project.productSku}&source=${project.category === "market" ? "discover" : "insights"}${project.derivedFromProjectId ? `&derive=${project.derivedFromProjectId}` : ""}`
    : `/replicate/${REPLICA_PROJECT_FALLBACK_FP}?product=${project.productSku}&source=discover`

  return (
    <Link
      href={href}
      className="group rounded-xl border border-[var(--line)] bg-white overflow-hidden hover:border-[var(--line-strong)] hover:shadow-[0_4px_16px_rgba(9,9,11,0.06)] transition-all cursor-pointer flex flex-col"
    >
      <div className="aspect-video bg-[var(--soft)] relative">
        <img src={project.thumb} alt={project.title} className="w-full h-full object-cover" />
        <span
          className="absolute top-2 left-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10px] font-bold backdrop-blur"
          style={{ backgroundColor: catMeta.dot + "cc", color: "white" }}
        >
          {catMeta.label}
        </span>
        <span
          className="absolute top-2 right-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10px] font-bold backdrop-blur"
          style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}
        >
          {project.status === "completed" && <CheckCircle2 size={9} strokeWidth={3} />}
          {statusMeta.label}
        </span>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h4 className="text-[12.5px] font-extrabold text-[var(--text)] leading-tight line-clamp-2">{project.title}</h4>
        <p className="text-[10.5px] text-[var(--muted)] mt-1 truncate">源：{project.sourceName}</p>
        {project.derivedFromProjectId && (
          <p className="mt-1 inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#6d28d9] bg-[#ede9fe] rounded-md px-1.5 py-0.5 self-start max-w-full">
            <GitBranch size={9} strokeWidth={2.4} />
            <span className="truncate">派生自 {project.derivedFromProjectId}{project.derivedFromAxis ? ` · 沿用 ${axisLabel(project.derivedFromAxis)} 轴` : ""}</span>
          </p>
        )}
        <div className="mt-2 flex items-center justify-between text-[10.5px]">
          <span className="text-[var(--muted)] font-semibold">{project.variantCount} 个变体</span>
          <span className="font-extrabold" style={{
            color: project.matchScore >= 75 ? "#16a34a" : project.matchScore >= 55 ? "#a16207" : "#dc2626"
          }}>
            匹配 {project.matchScore}
          </span>
        </div>
        {project.lifecyclePhase && (
          <span
            className="mt-2 inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10px] font-bold border self-start"
            style={{ backgroundColor: LIFECYCLE_META[project.lifecyclePhase].dot + "15", borderColor: LIFECYCLE_META[project.lifecyclePhase].dot + "55", color: LIFECYCLE_META[project.lifecyclePhase].dot }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LIFECYCLE_META[project.lifecyclePhase].dot }} />
            {LIFECYCLE_META[project.lifecyclePhase].label}
          </span>
        )}
        <div className="mt-auto pt-2 border-t border-dashed border-[var(--line)] flex items-center justify-between text-[10.5px] text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <Clock3 size={10} /> {relativeTime(project.updatedAt)}
          </span>
          <span className="inline-flex items-center gap-0.5 font-bold text-[var(--text)] opacity-0 group-hover:opacity-100 transition-opacity">
            继续 <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </Link>
  )
}

// 兜底 fingerprint：MARKET 类项目目前都用映射；具体在 hub 渲染时拿 MATERIALS[0]
const REPLICA_PROJECT_FALLBACK_FP = "fp_001"

function axisLabel(axis: ReplicaAxis) {
  return axis === "hook" ? "Hook" : axis === "scene" ? "场景" : "卖点"
}

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

function EmptyState({ sourceFilter, stageFilter, hasQuery }: { sourceFilter: SourceFilter; stageFilter: StageFilter; hasQuery: boolean }) {
  const parts: string[] = []
  if (sourceFilter !== "all") parts.push(`「${REPLICA_CATEGORY_META[sourceFilter].label}」`)
  if (stageFilter === "first") parts.push("「首次复刻」")
  if (stageFilter === "derived") parts.push("「派生迭代」")
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

// ─── PathTypeCard：UGC / 广告创意复刻 入口大卡 ─────────────────────────────

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
}) {
  const meta = tone === "violet"
    ? { dot: "#7c3aed", iconBg: "#f5f3ff", tagBg: "#ede9fe", tagColor: "#6d28d9" }
    : { dot: "#d97706", iconBg: "#fffbeb", tagBg: "#fef3c7", tagColor: "#a16207" }

  return (
    <Link
      href={href}
      className={cn(
        "group relative rounded-2xl bg-white border p-5 flex flex-col cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(9,9,11,0.08)]",
        recommended ? "border-[#18181b]" : "border-[var(--line)] hover:border-[var(--line-strong)]"
      )}
    >
      {recommended && (
        <span className="absolute -top-2 left-5 inline-flex h-5 px-2 rounded-full bg-[#18181b] text-white text-[10px] font-extrabold items-center gap-1">
          <Target size={9} strokeWidth={3} /> 推荐入口
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
        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--text)] group-hover:gap-2 transition-all">
          开始复刻 <ArrowRight size={12} />
        </span>
      </div>

      <p className="absolute bottom-[-1px] left-0 right-0 px-5 pb-2 text-[10.5px] text-[var(--muted-2)] opacity-0 group-hover:opacity-100 transition-opacity">
        {hint}
      </p>
    </Link>
  )
}
