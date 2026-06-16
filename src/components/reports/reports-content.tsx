"use client"

import { forwardRef, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  BarChart2,
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  Filter,
  Play,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

export type ReportTab = "report" | "analysis" | "brief" | "generate"

export const REPORT_TABS: { id: ReportTab; label: string; icon: LucideIcon }[] = [
  { id: "report",   label: "报告",       icon: FileText },
  { id: "analysis", label: "分析结果",   icon: BarChart2 },
  { id: "brief",    label: "Brief 结果", icon: BookOpen },
  { id: "generate", label: "生成结果",   icon: Sparkles },
]

type Item = {
  id: string
  title: string
  desc: string
  date: string
  status: "done" | "running"
  thumb?: string       // 仅生成结果
  duration?: string
  format?: string
}

// ─── Mock items per tab ──────────────────────────────────────────────────────

const ITEMS: Record<ReportTab, Item[]> = {
  report: [
    { id: "rp_001", title: "TikTok Shop 素材报告", desc: "24 个素材拆解 · 表现归因 · 共性洞察", date: "今天", status: "done" },
    { id: "rp_002", title: "Hotligh ZF7899 链接拆解", desc: "公域 Top 素材结构 · 卖点优先级 · CTA 风格", date: "今天", status: "done" },
    { id: "rp_003", title: "户外品类热门报告", desc: "近 30 天 US 户外类目最佳素材清单", date: "昨天", status: "done" },
    { id: "rp_004", title: "停电应急场景报告", desc: "场景命中率 + 跨账户 ROI 分布", date: "06/10", status: "done" },
  ],
  analysis: [
    { id: "an_001", title: "高 CTR 素材分析", desc: "封面 / 卖点 / CTA / 节奏共性", date: "今天", status: "done" },
    { id: "an_002", title: "fp_001 跨账户表现", desc: "8 个账户 ROI 分布 + 高 CPO 原因诊断", date: "昨天", status: "done" },
    { id: "an_003", title: "GMV Max 投放归因", desc: "学习中 / 放量 / 改写 账户拆解", date: "06/09", status: "done" },
  ],
  brief: [
    { id: "br_001", title: "春季新品 Brief", desc: "UGC 达人 5 条拍摄方向 + 必须保留元素", date: "今天", status: "done" },
    { id: "br_002", title: "「磁吸修车 双手解放」Brief", desc: "Hook + 6 拍脚本 + 视觉清单", date: "昨天", status: "done" },
    { id: "br_003", title: "「停电应急」短剧 Brief", desc: "ZF8313 · 红光警示场景 + 8 条变体", date: "06/08", status: "done" },
  ],
  generate: [
    { id: "gn_001", title: "Hotligh 磁吸车载灯防水演示", desc: "30s · 9:16 · 英文 US · 来自创意助手 · 路径 B", date: "刚刚", status: "done", duration: "00:30", format: "9:16 · 1080p", thumb: "https://picsum.photos/seed/gn_001/240/420" },
    { id: "gn_002", title: "UGC 脚本生成 · 8 条", desc: "8 个可直接拍摄的脚本", date: "昨天", status: "done", duration: "—", format: "脚本", thumb: "https://picsum.photos/seed/gn_002/240/420" },
    { id: "gn_003", title: "ZF8313 EDC 多模式开箱", desc: "15s · 9:16 · 英文 US", date: "06/12", status: "done", duration: "00:15", format: "9:16 · 1080p", thumb: "https://picsum.photos/seed/gn_003/240/420" },
    { id: "gn_004", title: "停电应急 红光警示短片", desc: "8s · 9:16 · 英文 US", date: "06/10", status: "done", duration: "00:08", format: "9:16 · 720p", thumb: "https://picsum.photos/seed/gn_004/240/420" },
  ],
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  initialTab?: ReportTab
  /** 高亮第一张卡（来自 First-Win 引导链路） */
  highlightFirst?: boolean
}

export function ReportsContent({ initialTab = "report", highlightFirst = false }: Props) {
  const [tab, setTab] = useState<ReportTab>(initialTab)
  const [query, setQuery] = useState("")
  const firstCardRef = useRef<HTMLAnchorElement | null>(null)
  const [highlightActive, setHighlightActive] = useState(highlightFirst)

  // tab 同步 URL（轻量，不动 history）
  useEffect(() => {
    if (typeof window === "undefined") return
    const url = new URL(window.location.href)
    if (url.searchParams.get("tab") !== tab) {
      url.searchParams.set("tab", tab)
      window.history.replaceState(null, "", url.toString())
    }
  }, [tab])

  // Spotlight 着陆：滚到第一张卡。高亮保留直到用户点击它（见 onActivate）
  useEffect(() => {
    if (!highlightActive) return
    const el = firstCardRef.current
    if (!el) return
    window.setTimeout(() => el.scrollIntoView({ block: "center", behavior: "smooth" }), 120)
  }, [highlightActive, tab])

  const items = useMemo(() => {
    const list = ITEMS[tab]
    if (!query.trim()) return list
    const q = query.toLowerCase()
    return list.filter((it) => it.title.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q))
  }, [tab, query])

  return (
    <div className="w-full max-w-[1240px] mx-auto px-6 py-6">
      {/* Title */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--text)] tracking-tight">我的任务</h1>
          <p className="text-[12.5px] text-[var(--muted)] mt-1">
            所有 AI 任务结果都在这里 · 按类型分类，可继续派生或直接投放
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[12.5px] font-bold flex items-center gap-1.5 hover:bg-[var(--soft-2)] cursor-pointer">
            <Filter size={12} />
            筛选
          </button>
          <button type="button" className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[12.5px] font-bold flex items-center gap-1.5 hover:bg-[var(--soft-2)] cursor-pointer">
            <Download size={12} />
            导出
          </button>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="border-b border-[var(--line)] mb-5 flex items-center justify-between gap-3 flex-wrap pb-0">
        <div className="flex items-center gap-1">
          {REPORT_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "relative h-10 px-3.5 flex items-center gap-1.5 text-[13px] font-bold cursor-pointer transition-colors",
                tab === id ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon size={13} strokeWidth={2.2} />
              {label}
              <span className={cn("text-[10.5px] font-bold", tab === id ? "text-[var(--muted)]" : "text-[var(--muted-2)]")}>
                {ITEMS[id].length}
              </span>
              {tab === id && <span className="absolute left-3 right-3 bottom-[-1px] h-[2px] rounded-full bg-[var(--text)]" />}
            </button>
          ))}
        </div>
        <div className="relative pb-2">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索结果..."
            className="h-9 pl-7 pr-3 rounded-full border border-[var(--line)] bg-white text-[12.5px] w-[220px] outline-none focus:border-[var(--line-strong)]"
          />
        </div>
      </div>

      {/* Content grid */}
      {items.length === 0 ? (
        <EmptyState query={query} tab={tab} />
      ) : tab === "generate" ? (
        <div className="grid grid-cols-4 gap-4">
          {items.map((it, i) => (
            <VideoCard
              key={it.id}
              item={it}
              ref={i === 0 ? firstCardRef : undefined}
              highlighted={i === 0 && highlightActive}
              onActivate={i === 0 && highlightActive ? () => setHighlightActive(false) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {items.map((it, i) => (
            <DocCard
              key={it.id}
              item={it}
              tab={tab}
              ref={i === 0 ? firstCardRef : undefined}
              highlighted={i === 0 && highlightActive}
              onActivate={i === 0 && highlightActive ? () => setHighlightActive(false) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Cards ───────────────────────────────────────────────────────────────────

const HIGHLIGHT = "ring-2 ring-[var(--lime)] ring-offset-2 shadow-[0_0_0_4px_rgba(201,255,41,0.18),0_12px_32px_rgba(9,9,11,0.10)]"

const VideoCard = forwardRef<HTMLAnchorElement, { item: Item; highlighted?: boolean; onActivate?: () => void }>(
  function VideoCard({ item, highlighted, onActivate }, ref) {
    return (
      <Link
        ref={ref}
        href="#"
        onClick={onActivate}
        className={cn(
          "group rounded-2xl border border-[var(--line)] bg-white overflow-hidden hover:border-[var(--line-strong)] hover:shadow-[0_8px_24px_rgba(9,9,11,0.08)] transition-all cursor-pointer relative",
          highlighted && HIGHLIGHT
        )}
      >
        {highlighted && (
          <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-[var(--lime)] text-[#1a2010] text-[10px] font-extrabold shadow-sm">
            <Sparkles size={9} strokeWidth={2.6} />
            刚刚生成
          </span>
        )}
        <div className="aspect-[9/14] bg-[var(--soft)] relative overflow-hidden">
          {item.thumb && <img src={item.thumb} alt={item.title} className="w-full h-full object-cover" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/25 transition-colors">
            <span className="w-11 h-11 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
              <Play size={16} className="text-[#18181b] translate-x-0.5" fill="#18181b" />
            </span>
          </div>
          {item.duration && (
            <span className="absolute bottom-2 right-2 inline-flex items-center h-5 px-1.5 rounded-md bg-black/65 text-white text-[10px] font-bold">
              {item.duration}
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-[12.5px] font-extrabold text-[var(--text)] leading-snug line-clamp-2">{item.title}</h3>
          <p className="text-[10.5px] text-[var(--muted)] mt-1 line-clamp-2">{item.desc}</p>
          <div className="mt-2 pt-2 border-t border-dashed border-[var(--line)] flex items-center justify-between text-[10.5px]">
            <span className="text-[var(--muted)] font-semibold">{item.format}</span>
            <span className="inline-flex items-center gap-1 font-bold text-[var(--green-text)]">
              <CheckCircle2 size={10} strokeWidth={2.4} />
              {item.date}
            </span>
          </div>
        </div>
      </Link>
    )
  }
)

const DocCard = forwardRef<HTMLAnchorElement, { item: Item; tab: ReportTab; highlighted?: boolean; onActivate?: () => void }>(
  function DocCard({ item, tab, highlighted, onActivate }, ref) {
    const Icon = REPORT_TABS.find((t) => t.id === tab)?.icon ?? FileText
    return (
      <Link
        ref={ref}
        href="#"
        onClick={onActivate}
        className={cn(
          "group rounded-2xl border border-[var(--line)] bg-white p-4 hover:border-[var(--line-strong)] hover:shadow-[0_8px_24px_rgba(9,9,11,0.06)] transition-all cursor-pointer block relative",
          highlighted && HIGHLIGHT
        )}
      >
        {highlighted && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-[var(--lime)] text-[#1a2010] text-[10px] font-extrabold shadow-sm">
            <Sparkles size={9} strokeWidth={2.6} />
            刚刚生成
          </span>
        )}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f4f1ff] text-[#6d5dfc] mb-3">
          <Icon size={17} strokeWidth={2.2} />
        </div>
        <h3 className="text-[13.5px] font-extrabold text-[var(--text)] leading-snug">{item.title}</h3>
        <p className="text-[11.5px] text-[var(--muted)] mt-1.5 leading-relaxed line-clamp-2">{item.desc}</p>
        <div className="mt-3 pt-3 border-t border-dashed border-[var(--line)] flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1 font-bold text-[var(--green-text)]">
            <CheckCircle2 size={11} strokeWidth={2.4} />
            已完成
          </span>
          <span className="text-[var(--muted)] font-semibold">{item.date}</span>
        </div>
      </Link>
    )
  }
)

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ query, tab }: { query: string; tab: ReportTab }) {
  const Icon = REPORT_TABS.find((t) => t.id === tab)?.icon ?? FileText
  return (
    <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white py-16 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--soft)] flex items-center justify-center mb-3">
        <Icon size={18} className="text-[var(--muted)]" />
      </div>
      <p className="text-[13px] font-bold text-[var(--text)]">
        {query.trim() ? "没有匹配的结果" : "还没有这类结果"}
      </p>
      <p className="text-[11.5px] text-[var(--muted)] mt-1">
        {query.trim() ? "换个关键词试试" : "回到创意助手开始生成"}
      </p>
    </div>
  )
}
