"use client"

import { ArrowRight, BarChart2, BookOpen, FileText, Sparkles, X, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export type PathMode = "report" | "analysis" | "brief" | "generate"
export type PathPick = { mode: PathMode; value: string }

interface Props {
  freeTriesRemaining: number
  freeTriesTotal: number
  onPickPath: (pick: PathPick) => void
  onDismiss: () => void
}

// Mock 预填示例 —— 4 条场景对应 4 个 mode
const EXAMPLES: Record<PathMode, string> = {
  report:   "https://tiktok.com/@hotligh/video/7234567890",
  analysis: "分析 fp_001 在 US 账户的表现",
  brief:    "为 Hotligh ZF7899 磁吸车载灯生成 5 条 Brief",
  generate: "Hotligh ZF7899 磁吸车载灯防水演示",
}

const CARDS: {
  mode: PathMode
  accent: Accent
  icon: React.ReactNode
  title: string
  desc: string
  ctaLabel: string
  ctaSub: string
  hot?: boolean
}[] = [
  {
    mode: "report",
    accent: "violet",
    icon: <FileText size={18} strokeWidth={2.2} />,
    title: "链接生报告",
    desc: "粘贴一条爆款链接，看 AI 怎么拆解",
    ctaLabel: "🚀 免费生成报告",
    ctaSub: "不消耗积分 · 首条免费",
    hot: true,
  },
  {
    mode: "analysis",
    accent: "blue",
    icon: <BarChart2 size={18} strokeWidth={2.2} />,
    title: "创意分析",
    desc: "选一条素材，看跨账户表现 + CPO 原因",
    ctaLabel: "🚀 免费生成分析",
    ctaSub: "不消耗积分 · 首条免费",
  },
  {
    mode: "brief",
    accent: "green",
    icon: <BookOpen size={18} strokeWidth={2.2} />,
    title: "创意 Brief",
    desc: "一句话出 5 条可拍摄的 Brief",
    ctaLabel: "🚀 免费生成 Brief",
    ctaSub: "不消耗积分 · 首条免费",
  },
  {
    mode: "generate",
    accent: "amber",
    icon: <Sparkles size={18} strokeWidth={2.2} />,
    title: "30s 创意视频",
    desc: "一句话描述，AI 立刻出 30s 高质量视频",
    ctaLabel: "🚀 免费生成视频",
    ctaSub: "不消耗积分 · 首条免费",
    hot: true,
  },
]

export function OnboardingHero({ freeTriesRemaining, freeTriesTotal, onPickPath, onDismiss }: Props) {
  const noTries = freeTriesRemaining <= 0

  return (
    <section className="relative">
      {/* Top ribbon */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 h-6 px-2 rounded-full bg-[var(--lime-soft)] border border-[#cdf066] text-[#3a4b1f] text-[11px] font-extrabold">
          <Zap size={10} strokeWidth={2.5} className="text-[#5a7821]" />
          新用户 · 快速上手
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[11.5px] font-semibold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer flex items-center gap-1 group"
        >
          已经熟悉，跳过引导
          <X size={11} className="opacity-60 group-hover:opacity-100" />
        </button>
      </div>

      {/* Heading */}
      <div className="text-center mb-4">
        <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-[var(--text)]">
          选个场景试试，30 秒出结果
        </h1>
        <p className="mt-1.5 text-[12.5px] text-[var(--muted)]">
          4 大场景任选其一，免费体验。
          {noTries ? (
            <span className="text-[var(--muted-2)]"> 本周免费试用已用完，下周一重置</span>
          ) : (
            <>
              {" "}本周免费试用还剩{" "}
              <span className="inline-flex items-center justify-center h-5 px-1.5 mx-0.5 rounded-md bg-[var(--lime-soft)] text-[#3a4b1f] font-extrabold border border-[#cdf066]">
                {freeTriesRemaining} / {freeTriesTotal}
              </span>{" "}
              次
            </>
          )}
        </p>
      </div>

      {/* 4 cards · 2×2 grid · compact so the whole hero fits in one viewport */}
      <div className="grid grid-cols-2 gap-3 max-w-[760px] mx-auto">
        {CARDS.map((c, i) => (
          <PathCard
            key={c.mode}
            accent={c.accent}
            tag={`场景 ${i + 1}`}
            icon={c.icon}
            title={c.title}
            desc={c.desc}
            exampleValue={EXAMPLES[c.mode]}
            ctaLabel={noTries ? "本周配额已用完" : c.ctaLabel}
            ctaSub={c.ctaSub}
            disabled={noTries}
            hot={c.hot}
            onClick={() => onPickPath({ mode: c.mode, value: EXAMPLES[c.mode] })}
          />
        ))}
      </div>
    </section>
  )
}

// ─── Path Card ───────────────────────────────────────────────────────────────

type Accent = "violet" | "amber" | "blue" | "green"

function PathCard({
  accent,
  tag,
  icon,
  title,
  desc,
  exampleValue,
  ctaLabel,
  ctaSub,
  disabled,
  hot,
  onClick,
}: {
  accent: Accent
  tag: string
  icon: React.ReactNode
  title: string
  desc: string
  exampleValue: string
  ctaLabel: string
  ctaSub: string
  disabled: boolean
  hot?: boolean
  onClick: () => void
}) {
  const meta = ACCENT[accent]

  return (
    <article
      className={cn(
        "group relative rounded-2xl border border-[var(--line-strong)] bg-white p-3.5 transition-all duration-200 flex flex-col gap-2",
        !disabled && "hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(9,9,11,0.08)] hover:border-[var(--line)]",
        disabled && "opacity-70"
      )}
    >
      {hot && <HotBadge />}
      {/* Tag + icon */}
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center h-5 px-1.5 rounded-md text-[10.5px] font-extrabold"
          style={{ backgroundColor: meta.tagBg, color: meta.tagColor }}
        >
          {tag}
        </span>
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: meta.iconBg, color: meta.iconColor }}
        >
          {icon}
        </span>
      </div>

      {/* Title + desc */}
      <div>
        <h3 className="text-[15.5px] font-extrabold text-[var(--text)] leading-snug">{title}</h3>
        <p className="text-[11.5px] text-[var(--muted)] mt-0.5 leading-relaxed line-clamp-2">{desc}</p>
      </div>

      {/* Example chip — compact */}
      <div className="rounded-lg border border-dashed border-[var(--line)] bg-[var(--soft-2)] px-2.5 py-1.5 text-[11px] font-mono text-[var(--text)] truncate" title={exampleValue}>
        {exampleValue}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-10 rounded-xl text-[12.5px] font-extrabold flex items-center justify-center gap-1.5 transition-opacity mt-auto",
          disabled
            ? "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
            : "bg-[var(--near-black)] text-white cursor-pointer hover:opacity-90"
        )}
      >
        {ctaLabel}
        {!disabled && <ArrowRight size={13} strokeWidth={2.4} className="opacity-90" />}
      </button>
      <p className="text-center text-[10px] text-[var(--muted-2)] font-semibold -mt-1">{ctaSub}</p>
    </article>
  )
}

const ACCENT: Record<Accent, { tagBg: string; tagColor: string; iconBg: string; iconColor: string }> = {
  violet: { tagBg: "#ede9fe", tagColor: "#6d28d9", iconBg: "#f5f3ff", iconColor: "#7c3aed" },
  amber:  { tagBg: "#fef3c7", tagColor: "#a16207", iconBg: "#fffbeb", iconColor: "#d97706" },
  blue:   { tagBg: "#dbeafe", tagColor: "#1d4ed8", iconBg: "#eff6ff", iconColor: "#2563eb" },
  green:  { tagBg: "#dcfce7", tagColor: "#15803d", iconBg: "#f0fdf4", iconColor: "#16a34a" },
}

// ─── HOT 贴纸（印章风） ─────────────────────────────────────────────────────

function HotBadge() {
  return (
    <span
      className="absolute -top-2.5 -right-2.5 z-10 w-11 h-11 rounded-full flex items-center justify-center text-white text-[10.5px] font-black tracking-[0.06em] pointer-events-none animate-cs-hot-wiggle"
      style={{
        background: "radial-gradient(circle at 30% 30%, #ff8a4c, #e84118 70%)",
        border: "1.5px dashed rgba(255,255,255,0.72)",
        boxShadow: "0 6px 16px rgba(232,65,24,0.42), inset 0 0 0 3px rgba(255,255,255,0.12)",
        transform: "rotate(12deg)",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
      aria-label="HOT 热门"
    >
      HOT
      <style jsx>{`
        @keyframes csHotWiggle {
          0%, 100% { transform: rotate(12deg) scale(1); }
          50%      { transform: rotate(12deg) scale(1.08); }
        }
        :global(.animate-cs-hot-wiggle) { animation: csHotWiggle 1400ms ease-in-out infinite; }
      `}</style>
    </span>
  )
}
