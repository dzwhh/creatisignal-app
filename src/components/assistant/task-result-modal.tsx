"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  Boxes,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  FileText,
  Globe2,
  Play,
  Sparkles,
  Video,
  X,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TaskKind } from "@/lib/onboarding/state"

interface Props {
  kind: TaskKind | null
  open: boolean
  onClose: () => void
}

type Section = { label: string; body: React.ReactNode }

// ─── Reference assets (video kind 用) ────────────────────────────────────────

type AssetKey = "reference" | "product"

type AssetInfo = {
  key: AssetKey
  cardLabel: string
  cardIcon: LucideIcon
  thumb: string
  thumbAspect: string         // tailwind aspect ratio class
  title: string
  /** Title 右侧高亮徽章（仅市场爆款这类需要强调） */
  titleTag?: string
  metaLine: string
  source: string              // 来源说明
  tagsLabel: string           // section 标题（默认"关键标签"，参考爆款是"爆款归因"）
  tags: string[]
  description: string
}

const REFERENCE_ASSETS: Record<AssetKey, AssetInfo> = {
  reference: {
    key: "reference",
    cardLabel: "参考爆款",
    cardIcon: Video,
    thumb: "https://picsum.photos/seed/ref_video_001/600/900",
    thumbAspect: "aspect-[9/14]",
    title: "Outdoor Waterproof Demo · @hotligh",
    titleTag: "市场爆款",
    metaLine: "TikTok · US · 30s · 公域 Top",
    source: "来源：discover/inspiration · TikTok 市场素材库",
    tagsLabel: "爆款归因",
    tags: ["Hook 胜利", "情绪杠杆胜利"],
    description: "CTR 2.86%（同类 +22%）· ROAS 2.96 · 已投放 3 天，放量期。",
  },
  product: {
    key: "product",
    cardLabel: "商品图",
    cardIcon: Boxes,
    thumb: "https://picsum.photos/seed/sku_zf7899_lg/640/640",
    thumbAspect: "aspect-square",
    title: "Hotligh ZF7899 1200LM Magnetic Work Light",
    metaLine: "SKU ZF7899 · 工具户外 / 维修照明 · 库存充足",
    source: "来源：自有产品库（SELF_PRODUCTS）",
    tagsLabel: "关键标签",
    tags: ["磁吸固定", "1200LM 高亮", "Type-C 快充", "双手解放"],
    description: "唯一一款能磁吸到任何金属车身、还顶得住户外冲洗的工作灯。",
  },
}

// ─── Per-kind config ─────────────────────────────────────────────────────────

const CONFIG: Record<TaskKind, {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  subtitle: string
  meta: string
  hero?: React.ReactNode
  sections: Section[]
}> = {
  report: {
    icon: FileText,
    iconBg: "#ede9fe",
    iconColor: "#6d28d9",
    title: "TikTok Shop 素材报告",
    subtitle: "已完成 24 个素材拆解与表现归因",
    meta: "今天 · 来自创意助手 · 链接生报告",
    sections: [
      { label: "主胜因", body: "多场景 Demo + 快切节奏 + 首秒结果前置" },
      { label: "Top 3 卖点", body: <Pills items={["磁吸", "高亮 1200LM", "Type-C 快充"]} /> },
      { label: "推荐复刻方向", body: "强化首秒结果 + 替换核心场景 + 改写卖点优先级（共 3 个变体方向）" },
      { label: "证据等级 / 置信度", body: <span className="text-[#15803d] font-bold">E3 / 72%</span> },
    ],
  },
  video: {
    icon: Sparkles,
    iconBg: "#fffbeb",
    iconColor: "#d97706",
    title: "Hotligh 磁吸车载灯防水演示",
    subtitle: "30s · 9:16 · 1080p · 英文 US",
    meta: "刚刚 · 来自创意助手 · 创意生成 · 路径 4",
    hero: (
      <div className="relative w-full aspect-[9/16] max-h-[280px] rounded-xl overflow-hidden bg-[var(--soft)]">
        <img src="https://picsum.photos/seed/gn_001/480/854" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black/15">
          <span className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
            <Play size={22} className="text-[#18181b] translate-x-1" fill="#18181b" />
          </span>
        </div>
        <span className="absolute bottom-2 right-2 inline-flex items-center h-6 px-2 rounded-md bg-black/65 text-white text-[11px] font-bold">00:30</span>
      </div>
    ),
    sections: [
      { label: "规格", body: "TikTok In-Feed · 9:16 · 1080p · 30s · 英文 US" },
      { label: "核心卖点", body: <Pills items={["磁吸", "防水演示", "户外维修"]} /> },
      // 「参考内容」由 component 内动态渲染，不放静态 sections（需要交互 state）
    ],
  },
  brief: {
    icon: BookOpen,
    iconBg: "#f0fdf4",
    iconColor: "#16a34a",
    title: "Hotligh ZF7899 磁吸车载灯 Brief",
    subtitle: "5 条可拍摄方向 · UGC 达人风格",
    meta: "今天 · 来自创意助手 · 创意 Brief",
    sections: [
      { label: "目标人群", body: "户外通勤 / 修车爱好者 / EDC 用户（25-44 男）" },
      { label: "5 条拍摄方向", body: (
        <ol className="list-decimal pl-5 space-y-1.5 text-[12.5px] leading-relaxed">
          <li>磁吸吸到引擎盖，双手解放修车</li>
          <li>极端冲水测试，证明 IPX5</li>
          <li>对比手机灯，亮度反差</li>
          <li>夜间露营场景，多模式切换</li>
          <li>EDC 口袋实拍，便携性</li>
        </ol>
      ) },
      { label: "CTA", body: "Keep one in your car." },
    ],
  },
  analysis: {
    icon: BarChart2,
    iconBg: "#eff6ff",
    iconColor: "#2563eb",
    title: "fp_001 跨账户表现分析",
    subtitle: "8 个账户 ROI 分布 + 高 CPO 原因诊断",
    meta: "今天 · 来自创意助手 · 创意分析",
    sections: [
      { label: "ROI 分布", body: <span><span className="text-[#dc2626] font-bold">Worst 0.84</span> · 中位 <span className="font-bold">1.78</span> · <span className="text-[#16a34a] font-bold">Best 3.12</span></span> },
      { label: "诊断", body: "跨账户方差 2.28（≥1.5 阈值）→ 触发逐账户调优；建议 US-Test-03 / 05 暂停" },
      { label: "推荐下一步", body: "改写开头 Hook + 在 Top 2 账户上调预算 +15~20%" },
    ],
  },
}

function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="h-6 px-2 rounded-md bg-[#fff7ed] text-[#9a3412] text-[11.5px] font-bold inline-flex items-center">{i}</span>
      ))}
    </div>
  )
}

// ─── Main modal ──────────────────────────────────────────────────────────────

export function TaskResultModal({ kind, open, onClose }: Props) {
  const [openAsset, setOpenAsset] = useState<AssetKey | null>(null)

  if (!kind) return null
  const c = CONFIG[kind]
  const Icon = c.icon

  return (
    <>
      <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/45 z-[70] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[75]",
              "w-[min(560px,calc(100vw-32px))] max-h-[88vh] rounded-2xl bg-white shadow-[0_28px_72px_rgba(9,9,11,0.28)] flex flex-col overflow-hidden",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
            )}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-[var(--line)] flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: c.iconBg, color: c.iconColor }}>
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0">
                <Dialog.Title className="text-[17px] font-extrabold text-[var(--text)] leading-snug">{c.title}</Dialog.Title>
                <p className="text-[12.5px] text-[var(--muted)] mt-0.5">{c.subtitle}</p>
                <p className="text-[11px] text-[var(--muted-2)] font-semibold mt-1.5">{c.meta}</p>
              </div>
              <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
                <X size={16} />
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {c.hero && <div>{c.hero}</div>}
              {c.sections.map((s) => (
                <div key={s.label}>
                  <p className="text-[11px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">{s.label}</p>
                  <div className="text-[13px] text-[var(--text)] leading-relaxed">{s.body}</div>
                </div>
              ))}

              {/* 视频专属：参考内容（参考爆款 + 商品图） */}
              {kind === "video" && (
                <div>
                  <p className="text-[11px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-2">参考内容</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <ReferenceCard asset={REFERENCE_ASSETS.reference} onClick={() => setOpenAsset("reference")} />
                    <ReferenceCard asset={REFERENCE_ASSETS.product}   onClick={() => setOpenAsset("product")} />
                  </div>
                  <p className="text-[10.5px] text-[var(--muted-2)] mt-1.5 leading-relaxed">点击卡片可查看引用的具体资产</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[var(--line)] flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-[var(--green-text)]">
                <CheckCircle2 size={12} strokeWidth={2.4} />
                结果已保存到「我的任务」
              </span>
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-full bg-[var(--near-black)] text-white text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90"
              >
                我知道了
                <ArrowRight size={12} strokeWidth={2.4} />
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 嵌套：资产预览（z-index 比主 modal 高） */}
      <AssetPreviewDialog
        asset={openAsset ? REFERENCE_ASSETS[openAsset] : null}
        open={openAsset !== null}
        onClose={() => setOpenAsset(null)}
      />
    </>
  )
}

// ─── Reference card ──────────────────────────────────────────────────────────

function ReferenceCard({ asset, onClick }: { asset: AssetInfo; onClick: () => void }) {
  const Icon = asset.cardIcon
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-xl border border-[var(--line)] bg-white text-left hover:border-[var(--line-strong)] hover:shadow-[0_6px_18px_rgba(9,9,11,0.06)] transition-all cursor-pointer overflow-hidden"
    >
      <div className={cn("relative bg-[var(--soft)]", asset.thumbAspect)}>
        <img src={asset.thumb} alt={asset.title} className="w-full h-full object-cover" />
        <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 h-5 px-1.5 rounded-md bg-white/95 text-[var(--text)] text-[10.5px] font-extrabold shadow-sm">
          <Icon size={10} strokeWidth={2.4} />
          {asset.cardLabel}
        </span>
        <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-0.5 h-5 px-1.5 rounded-md bg-black/55 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          查看 <ExternalLink size={9} strokeWidth={2.4} />
        </span>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-[11.5px] font-extrabold text-[var(--text)] truncate">{asset.title}</p>
        <p className="text-[10px] text-[var(--muted)] mt-0.5 truncate">{asset.metaLine}</p>
      </div>
    </button>
  )
}

// ─── Asset preview dialog ────────────────────────────────────────────────────

function AssetPreviewDialog({ asset, open, onClose }: { asset: AssetInfo | null; open: boolean; onClose: () => void }) {
  if (!asset) return null
  const Icon = asset.cardIcon
  const isVideo = asset.key === "reference"
  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-[80] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[85]",
            "w-[min(520px,calc(100vw-32px))] max-h-[88vh] rounded-2xl bg-white shadow-[0_32px_80px_rgba(9,9,11,0.32)] flex flex-col overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
          )}
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-[var(--line)] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-7 px-2 rounded-full border border-[var(--line)] text-[11.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={11} strokeWidth={2.4} />
              返回结果
            </button>
            <span className="inline-flex items-center gap-1 h-6 px-2 rounded-full text-[10.5px] font-extrabold" style={{ backgroundColor: "#f4f4f5", color: "var(--text)" }}>
              <Icon size={11} strokeWidth={2.4} />
              {asset.cardLabel}
            </span>
            <Dialog.Close className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={14} />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            <div className={cn("relative w-full rounded-xl overflow-hidden bg-[var(--soft)]", asset.thumbAspect, "max-h-[320px]")}>
              <img src={asset.thumb} alt={asset.title} className="w-full h-full object-cover" />
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                  <span className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg">
                    <Play size={22} className="text-[#18181b] translate-x-1" fill="#18181b" />
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-start gap-2 flex-wrap">
                <Dialog.Title className="text-[15px] font-extrabold text-[var(--text)] leading-snug">{asset.title}</Dialog.Title>
                {asset.titleTag && (
                  <span
                    className="inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[10.5px] font-extrabold tracking-wide shrink-0 mt-0.5"
                    style={{
                      background: "linear-gradient(135deg,#ff7a45,#e84118)",
                      color: "white",
                      boxShadow: "0 2px 8px rgba(232,65,24,0.32)",
                    }}
                  >
                    {asset.titleTag}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-[var(--muted)] mt-1">{asset.metaLine}</p>
            </div>

            <div>
              <p className="text-[11px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">来源</p>
              <p className="text-[12.5px] text-[var(--text)] flex items-center gap-1.5">
                <Globe2 size={12} className="text-[var(--muted)]" />
                {asset.source}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">{asset.tagsLabel}</p>
              <Pills items={asset.tags} />
            </div>

            <div>
              <p className="text-[11px] font-extrabold text-[var(--muted-2)] uppercase tracking-wide mb-1.5">说明</p>
              <p className="text-[12.5px] text-[var(--text)] leading-relaxed">{asset.description}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[var(--line)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-full bg-[var(--near-black)] text-white text-[12.5px] font-bold flex items-center gap-1.5 cursor-pointer hover:opacity-90"
            >
              知道了
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
