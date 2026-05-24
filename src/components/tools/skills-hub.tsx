"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import * as Popover from "@radix-ui/react-popover"
import {
  Plus,
  ChevronDown,
  Filter,
  ArrowDownAZ,
  Download,
  Megaphone,
  Video,
  Search,
  Sparkles,
  FileText,
  Users,
  Eye,
  Wand2,
  MailPlus,
  TrendingUp,
  Palette,
  Hash,
  Mic,
  BarChart3,
  Lightbulb,
  Target,
  ScrollText,
  ShoppingBag,
  Share2,
  Trash2,
  X,
  Copy,
  Check,
  FileArchive,
  PlayCircle,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Data ────────────────────────────────────────────────────────────────────

type Category = "creative" | "insight" | "performance" | "copywriting" | "content" | "brand"

type Skill = {
  id: string
  name: string
  slug: string
  desc: string
  author: string
  category: Category
  icon: LucideIcon
  iconBg: string
  iconFg: string
  downloads: number
  installed: boolean
  enabled?: boolean
  hasUpdate?: boolean
}

const skills: Skill[] = [
  { id: "1",  name: "Meta 广告文案大师",  slug: "meta-ad-copywriter",          author: "CreatiSignal",  category: "performance", icon: Megaphone,           iconBg: "#e0f2fe", iconFg: "#0866ff", downloads: 18900, installed: true,  enabled: true,
    desc: "为 Facebook 与 Instagram 广告生成多组主标题、副标题与正文，按预测 CTR 排序，可直接复制进 Meta Ads Manager。" },
  { id: "2",  name: "TikTok 脚本工坊",      slug: "tiktok-script-studio",        author: "ByteDance",     category: "content",     icon: Video,               iconBg: "#18181b", iconFg: "#ffffff", downloads: 16200, installed: false,
    desc: "拆解 TikTok 当前热门视频的钩子-正文-行动结构，并针对你的产品生成 15-30 秒可直拍脚本。" },
  { id: "3",  name: "Google Ads 关键词研究", slug: "google-ads-keyword-research", author: "Google",        category: "performance", icon: Search,              iconBg: "#fef2f2", iconFg: "#ea4335", downloads: 14800, installed: false,
    desc: "按搜索意图聚类长尾关键词，建议广告组结构、否定词清单与匹配类型，输出可导入 Google Ads 的 CSV。" },
  { id: "4",  name: "广告创意发想",          slug: "ad-creative-ideation",        author: "Jasper",        category: "creative",    icon: Sparkles,            iconBg: "#fff7ed", iconFg: "#ea580c", downloads: 13500, installed: true,  enabled: true,
    desc: "围绕产品 USP 与目标人群一次性产出 30+ 条广告创意角度，覆盖痛点、好奇、社会证明与 FOMO 框架。" },
  { id: "5",  name: "着陆页文案",            slug: "landing-page-copywriter",     author: "Copy.ai",       category: "copywriting", icon: FileText,            iconBg: "#f5f3ff", iconFg: "#7c3aed", downloads: 12700, installed: false,
    desc: "按 PAS / AIDA / 4U 等转化框架生成完整着陆页文案，包含 Hero、卖点、社会证明、FAQ 与 CTA。" },
  { id: "6",  name: "受众画像构建",          slug: "audience-persona-builder",    author: "HubSpot",       category: "insight",     icon: Users,               iconBg: "#fff1ed", iconFg: "#ff7a59", downloads: 11400, installed: true,  enabled: true,
    desc: "通过访谈、评论与平台数据合成 3-5 个高保真买家画像，附带动机、异议与购买决策旅程。" },
  { id: "7",  name: "竞品广告审计",          slug: "competitor-ad-audit",         author: "AdCreative.ai", category: "insight",     icon: Eye,                 iconBg: "#eff6ff", iconFg: "#3b82f6", downloads: 10800, installed: false,
    desc: "抓取 Meta Ads Library 与 TikTok Creative Center 中竞品在投广告，按角度、视觉与卖点分类并定位你的创意缺口。" },
  { id: "8",  name: "爆款短视频复刻",        slug: "viral-video-remix",           author: "CreatiSignal",  category: "creative",    icon: Wand2,               iconBg: "#fdf4ff", iconFg: "#a21caf", downloads: 10200, installed: true,  enabled: true,
    desc: "把高赞短视频拆解为脚本骨架（Hook / Build / Reveal / CTA），并按你的产品参数自动改写为可拍版本。" },
  { id: "9",  name: "邮件营销序列",          slug: "email-sequence-writer",       author: "Klaviyo",       category: "copywriting", icon: MailPlus,            iconBg: "#eef2ff", iconFg: "#5a4fff", downloads: 9100,  installed: true,  enabled: true,
    desc: "为电商品牌生成欢迎、弃单、复购、再激活等多步邮件序列，含触发条件、文案与 A/B 测试建议。" },
  { id: "10", name: "趋势雷达",              slug: "trend-radar",                 author: "ByteDance",     category: "insight",     icon: TrendingUp,          iconBg: "#ecfeff", iconFg: "#0e7490", downloads: 8400,  installed: true,  enabled: true, hasUpdate: true,
    desc: "实时扫描 TikTok、Instagram Reels、YouTube Shorts 与 X 上的上升趋势，按品类与受众输出可执行的内容选题。" },
  { id: "11", name: "品牌调性蒸馏",          slug: "brand-voice-distiller",       author: "Anthropic",     category: "brand",       icon: Palette,             iconBg: "#fef3c7", iconFg: "#d97706", downloads: 7600,  installed: false,
    desc: "从你现有的官网、社媒与广告文案中提炼可复用的品牌语调指南，包含 do/don't 与例句。" },
  { id: "12", name: "标题 A/B 测试",          slug: "headline-ab-tester",          author: "Postwise",      category: "copywriting", icon: Hash,                iconBg: "#f0f9ff", iconFg: "#0ea5e9", downloads: 6800,  installed: false,
    desc: "为同一篇文章或广告生成多组标题变体，按可读性、好奇度与 CTR 模型评分排序。" },
  { id: "13", name: "红人 Brief 生成",        slug: "influencer-brief-generator",  author: "CreatiSignal",  category: "content",     icon: Mic,                 iconBg: "#fce7f3", iconFg: "#db2777", downloads: 6100,  installed: false,
    desc: "一键生成结构化的红人合作 brief，含品牌背景、卖点、必拍画面、关键词与禁忌项。" },
  { id: "14", name: "投放 ROI 诊断",          slug: "roi-diagnostic",              author: "Meta",          category: "performance", icon: BarChart3,           iconBg: "#e0f2fe", iconFg: "#0866ff", downloads: 5700,  installed: true,  enabled: true,
    desc: "诊断 Meta / Google 投放表现，从出价、受众、素材三维度定位拖累项并给出优化建议。" },
  { id: "15", name: "评论情绪分析",          slug: "review-sentiment-analyzer",   author: "OpenAI",        category: "insight",     icon: Lightbulb,           iconBg: "#ecfdf5", iconFg: "#10a37f", downloads: 5100,  installed: false,
    desc: "聚合电商评论、App 评分与社媒评论，自动提炼最常被提及的优点、痛点与购买动因。" },
  { id: "16", name: "着陆页 SEO 优化",        slug: "landing-page-seo",            author: "Surfer SEO",    category: "performance", icon: Target,              iconBg: "#f0fdf4", iconFg: "#22c55e", downloads: 4500,  installed: false,
    desc: "审计着陆页 SEO 健康度，给出标题、Meta、内链结构与内容大纲层面的可执行优化清单。" },
  { id: "17", name: "Instagram Reels 脚本",   slug: "instagram-reels-script-writer", author: "Meta",          category: "content",     icon: ScrollText,          iconBg: "#fdf2f8", iconFg: "#db2777", downloads: 4100,  installed: true,  enabled: true,
    desc: "按 Instagram Reels 爆款公式（开场 3 秒钩子 + 故事节奏 + CTA）撰写可直拍脚本，附镜头切换与音乐建议。" },
  { id: "18", name: "UGC 招募脚本",           slug: "ugc-recruiter",               author: "CreatiSignal",  category: "content",     icon: ShoppingBag,         iconBg: "#fafafa", iconFg: "#18181b", downloads: 3400,  installed: false,
    desc: "为 Instagram、TikTok 与 YouTube 等平台生成 UGC 创作者招募私信与公开招募贴，含报价范本与合规要点。" },
]

const authorColors: Record<string, string> = {
  "CreatiSignal":   "#18181b",
  "Anthropic":      "#d97706",
  "OpenAI":         "#10a37f",
  "Jasper":         "#ff5736",
  "Copy.ai":        "#7c3aed",
  "HubSpot":        "#ff7a59",
  "AdCreative.ai":  "#3b82f6",
  "Klaviyo":        "#5a4fff",
  "Google":         "#ea4335",
  "ByteDance":      "#000000",
  "Meta":           "#0866ff",
  "Postwise":       "#0ea5e9",
  "Surfer SEO":     "#22c55e",
}

const categoryOptions: { id: Category | "all"; label: string }[] = [
  { id: "all",         label: "全部" },
  { id: "creative",    label: "创意" },
  { id: "insight",     label: "洞察" },
  { id: "performance", label: "广告投放" },
  { id: "copywriting", label: "文案" },
  { id: "content",     label: "内容创作" },
  { id: "brand",       label: "品牌" },
]

type SortKey = "hot" | "recent"
const sortOptions: { id: SortKey; label: string }[] = [
  { id: "hot",    label: "热门" },
  { id: "recent", label: "最近" },
]

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Tab = "marketplace" | "mine"

const tabs: { id: Tab; label: string }[] = [
  { id: "marketplace", label: "技能广场" },
  { id: "mine",        label: "我的技能" },
]

export function SkillsHub() {
  const [tab, setTab] = useState<Tab>("marketplace")
  const [shareSkill, setShareSkill] = useState<Skill | null>(null)
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null)
  const [installOpen, setInstallOpen] = useState(false)
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(skills.filter((s) => s.installed).map((s) => [s.id, s.enabled ?? true]))
  )

  return (
    <div className="px-8 py-7 max-w-[1280px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 mb-7">
        <div>
          <h1 className="text-[26px] font-extrabold text-[var(--text)] tracking-tight leading-tight">技能</h1>
          <p className="text-[13.5px] text-[var(--muted)] mt-1.5">安装与管理技能，扩展 CreatiSignal 的能力</p>
        </div>
        <button
          type="button"
          onClick={() => setInstallOpen(true)}
          className="shrink-0 h-10 px-4 rounded-full bg-[#18181b] hover:opacity-90 text-white text-[13px] font-bold flex items-center gap-1.5 cursor-pointer transition-opacity"
        >
          <Plus size={15} strokeWidth={2.5} />
          安装技能
        </button>
      </div>

      {/* Top tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--line)] mb-5">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "relative h-10 px-4 text-[14px] font-bold cursor-pointer transition-colors",
              tab === id ? "text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
            )}
          >
            {label}
            {tab === id && (
              <span className="absolute left-3 right-3 bottom-[-1px] h-[2px] rounded-full bg-[var(--text)]" />
            )}
          </button>
        ))}
      </div>

      {tab === "marketplace" ? (
        <MarketplaceView onOpenDetail={setDetailSkill} />
      ) : (
        <MyView
          enabledMap={enabledMap}
          onToggle={(id, v) => setEnabledMap((m) => ({ ...m, [id]: v }))}
          onShare={(s) => setShareSkill(s)}
        />
      )}

      <SkillDetailModal skill={detailSkill} onClose={() => setDetailSkill(null)} />
      <ShareModal skill={shareSkill} onClose={() => setShareSkill(null)} />
      <InstallSkillModal open={installOpen} onOpenChange={setInstallOpen} />
    </div>
  )
}

// ─── Marketplace ─────────────────────────────────────────────────────────────

function MarketplaceView({ onOpenDetail }: { onOpenDetail: (s: Skill) => void }) {
  const [category, setCategory] = useState<Category | "all">("all")
  const [sort, setSort] = useState<SortKey>("hot")

  const categoryLabel = categoryOptions.find((o) => o.id === category)?.label ?? "全部"
  const sortLabel = sortOptions.find((o) => o.id === sort)?.label ?? "热门"

  const visible = skills
    .filter((s) => (category === "all" ? true : s.category === category))
    .slice()
    .sort((a, b) =>
      sort === "hot"
        ? b.downloads - a.downloads
        : Number(b.id) - Number(a.id)
    )

  return (
    <>
      {/* Right-aligned filter + sort */}
      <div className="flex items-center justify-end gap-2 mb-5">
        <FilterDropdown
          icon={Filter}
          label={categoryLabel}
          options={categoryOptions}
          value={category}
          onChange={(v) => setCategory(v as Category | "all")}
        />
        <FilterDropdown
          icon={ArrowDownAZ}
          label={`排序: ${sortLabel}`}
          options={sortOptions}
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
        />
      </div>

      {/* Section header */}
      <p className="text-[12.5px] font-semibold text-[var(--muted)] mb-3">官方精选</p>

      {/* Card grid */}
      <div className="grid grid-cols-3 gap-3.5">
        {visible.map((s) => (
          <SkillCard key={s.id} skill={s} onClick={() => onOpenDetail(s)} />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="py-20 text-center text-[14px] text-[var(--muted)]">该分类下暂无技能</div>
      )}
    </>
  )
}

function FilterDropdown({
  icon: Icon,
  label,
  options,
  value,
  onChange,
}: {
  icon: LucideIcon
  label: string
  options: { id: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-9 px-3 rounded-full border border-[var(--line)] bg-white text-[13px] font-semibold text-[var(--text)] flex items-center gap-1.5 cursor-pointer hover:border-[var(--line-strong)] transition-colors data-[state=open]:border-[var(--line-strong)] data-[state=open]:bg-[var(--soft-2)]"
        >
          <Icon size={13} strokeWidth={2.2} className="text-[var(--muted)]" />
          {label}
          <ChevronDown size={12} className="text-[var(--muted)] -mr-0.5 data-[state=open]:rotate-180" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[160px] p-1.5 bg-white border border-[var(--line)] rounded-[14px] shadow-[0_18px_42px_rgba(9,9,11,0.14)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {options.map((opt) => (
            <Popover.Close key={opt.id} asChild>
              <button
                type="button"
                onClick={() => onChange(opt.id)}
                className={cn(
                  "w-full h-9 px-3 rounded-[9px] text-left text-[13px] cursor-pointer flex items-center gap-2 transition-colors",
                  value === opt.id
                    ? "bg-[var(--soft)] text-[var(--text)] font-semibold"
                    : "text-[var(--muted)] hover:bg-[var(--soft-2)] hover:text-[var(--text)] font-medium"
                )}
              >
                <span className="flex-1">{opt.label}</span>
                {value === opt.id && <Check size={14} strokeWidth={2.5} className="text-[var(--text)]" />}
              </button>
            </Popover.Close>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function SkillCard({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  const Icon = skill.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative p-4 rounded-2xl border border-[var(--line)] bg-white hover:border-[var(--line-strong)] hover:shadow-[0_8px_24px_rgba(9,9,11,0.06)] transition-all cursor-pointer text-left"
    >
      {/* Hover-only state badge */}
      <span
        className={cn(
          "absolute top-3 right-3 h-6 px-2.5 rounded-full text-[11px] font-bold flex items-center opacity-0 group-hover:opacity-100 transition-opacity",
          skill.installed
            ? "bg-[var(--soft)] text-[var(--text)]"
            : "bg-[#18181b] text-white"
        )}
      >
        {skill.installed ? "使用" : "安装"}
      </span>

      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: skill.iconBg, color: skill.iconFg }}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 pt-0.5 pr-12">
          <p className="text-[14.5px] font-bold text-[var(--text)] truncate">{skill.name}</p>
          <p className="text-[12px] text-[var(--muted)] mt-0.5 font-mono truncate">{skill.slug}</p>
        </div>
      </div>
      <p className="text-[12.5px] text-[var(--muted)] leading-relaxed line-clamp-2 mb-3 min-h-[38px]">
        {skill.desc}
      </p>
      <div className="flex items-center gap-1 text-[12px] text-[var(--muted)] font-medium">
        <Download size={12} strokeWidth={2.2} />
        {formatCount(skill.downloads)}
      </div>
    </button>
  )
}

// ─── My Skills (installed list) ──────────────────────────────────────────────

function MyView({
  enabledMap,
  onToggle,
  onShare,
}: {
  enabledMap: Record<string, boolean>
  onToggle: (id: string, v: boolean) => void
  onShare: (s: Skill) => void
}) {
  const installed = skills.filter((s) => s.installed)

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white overflow-hidden">
      {installed.map((s, i) => (
        <InstalledRow
          key={s.id}
          skill={s}
          enabled={enabledMap[s.id] ?? true}
          onToggle={(v) => onToggle(s.id, v)}
          onShare={() => onShare(s)}
          isFirst={i === 0}
        />
      ))}
      {installed.length === 0 && (
        <div className="py-20 text-center text-[14px] text-[var(--muted)]">还没有安装任何技能</div>
      )}
    </div>
  )
}

function InstalledRow({
  skill,
  enabled,
  onToggle,
  onShare,
  isFirst,
}: {
  skill: Skill
  enabled: boolean
  onToggle: (v: boolean) => void
  onShare: () => void
  isFirst: boolean
}) {
  const Icon = skill.icon
  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--soft-2)] transition-colors",
        !isFirst && "border-t border-[var(--line)]"
      )}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: skill.iconBg, color: skill.iconFg }}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-[var(--text)] truncate">{skill.slug}</p>
        <p className="text-[12.5px] text-[var(--muted)] truncate mt-0.5">{skill.desc}</p>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2 shrink-0">
        {skill.hasUpdate && (
          <span className="h-6 px-2 rounded-md bg-[#dff9e7] text-[11px] font-bold text-[#37a46a] flex items-center">
            Update
          </span>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onShare}
            aria-label="分享"
            className="w-7 h-7 rounded-md text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--text)] flex items-center justify-center cursor-pointer"
          >
            <Share2 size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="删除"
            className="w-7 h-7 rounded-md text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[#dc2626] flex items-center justify-center cursor-pointer"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
        <Toggle checked={enabled} onChange={onToggle} />
      </div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-9 h-[22px] rounded-full transition-colors cursor-pointer shrink-0",
        checked ? "bg-[#7ed99a]" : "bg-[var(--line-strong)]"
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all",
          checked ? "left-[19px]" : "left-[2px]"
        )}
      />
    </button>
  )
}

// ─── Skill Detail Modal ──────────────────────────────────────────────────────

function SkillDetailModal({ skill, onClose }: { skill: Skill | null; onClose: () => void }) {
  return (
    <Dialog.Root open={skill !== null} onOpenChange={(v) => { if (!v) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[460px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {skill && (
            <>
              <Dialog.Close className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer z-10">
                <X size={18} />
              </Dialog.Close>

              <div className="px-6 pt-6 pb-5">
                <Dialog.Title className="text-[20px] font-extrabold text-[var(--text)] pr-8 leading-tight">
                  {skill.name}
                </Dialog.Title>

                {/* Author + uses */}
                <div className="flex items-center gap-2 mt-2.5">
                  <div
                    className="w-[18px] h-[18px] rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                    style={{ backgroundColor: authorColors[skill.author] ?? "#71717a" }}
                  >
                    {skill.author.charAt(0)}
                  </div>
                  <span className="text-[12.5px] font-semibold text-[var(--text)]">{skill.author}</span>
                  <span className="text-[12.5px] text-[var(--muted)]">{formatCount(skill.downloads)} uses</span>
                </div>

                <Dialog.Description className="text-[13.5px] text-[var(--muted)] leading-relaxed mt-4">
                  {skill.desc}
                </Dialog.Description>
              </div>

              {/* Footer buttons */}
              <div className="px-6 pb-6 pt-1">
                {skill.installed ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 h-[38px] rounded-full bg-[#18181b] hover:opacity-90 text-white text-[13.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-opacity"
                    >
                      <PlayCircle size={16} strokeWidth={2.2} />
                      在 Agent 中尝试
                    </button>
                    <button
                      type="button"
                      className="flex-1 h-[38px] rounded-full border border-[var(--line)] bg-white hover:bg-[var(--soft)] text-[var(--text)] text-[13.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Download size={15} strokeWidth={2.2} />
                      下载
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full h-[38px] rounded-full bg-[#18181b] hover:opacity-90 text-white text-[13.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-opacity"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    添加到我的 Skills
                  </button>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Share Modal ─────────────────────────────────────────────────────────────

function ShareModal({ skill, onClose }: { skill: Skill | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const link = skill ? `https://creatisignal.ai/link/skill/${skill.slug}` : ""

  function handleCopy() {
    if (!skill) return
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {})
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Dialog.Root
      open={skill !== null}
      onOpenChange={(v) => {
        if (!v) {
          onClose()
          setCopied(false)
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] bg-white rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex justify-center -mt-7">
            <div className="w-14 h-14 rounded-full bg-white border border-[var(--line)] shadow-[0_4px_12px_rgba(9,9,11,0.08)] flex items-center justify-center">
              <Share2 size={20} strokeWidth={2.2} className="text-[var(--text)]" />
            </div>
          </div>
          <Dialog.Close className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
            <X size={18} />
          </Dialog.Close>

          <div className="px-8 pt-4 pb-6 text-center">
            <Dialog.Title className="text-[20px] font-extrabold text-[var(--text)]">
              Share Link Generated
            </Dialog.Title>
            <Dialog.Description className="text-[13.5px] text-[var(--muted)] mt-1.5">
              Share this link with others to install the skill.
            </Dialog.Description>

            <div className="mt-5 h-12 px-4 rounded-xl bg-[var(--soft-2)] border border-[var(--line)] flex items-center">
              <span className="text-[13px] font-mono text-[var(--text)] truncate flex-1 text-left">
                {link}
              </span>
            </div>
            <p className="mt-3 text-[13px] text-[var(--muted)]">No expiration</p>
          </div>

          <div className="px-8 pb-8 pt-2 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full h-12 rounded-full bg-[#18181b] hover:opacity-90 text-white text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-opacity"
            >
              {copied ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  Link Copied
                </>
              ) : (
                <>
                  <Copy size={15} strokeWidth={2.2} />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Install Skill Modal ─────────────────────────────────────────────────────

function InstallSkillModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setFileName(files[0].name)
  }

  function handleInstall() {
    if (!fileName) return
    onOpenChange(false)
    setFileName(null)
  }

  function handleOpenChange(v: boolean) {
    onOpenChange(v)
    if (!v) {
      setFileName(null)
      setDragOver(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[480px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <Dialog.Title className="text-[18px] font-extrabold text-[var(--text)]">
              安装技能
            </Dialog.Title>
            <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={18} />
            </Dialog.Close>
          </div>

          <div className="px-6 pb-5">
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                handleFiles(e.dataTransfer.files)
              }}
              className={cn(
                "flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-10 px-6 cursor-pointer transition-colors",
                dragOver
                  ? "border-[var(--text)] bg-[var(--soft-2)]"
                  : "border-[var(--line-strong)] hover:border-[var(--muted)] bg-[var(--soft-2)]"
              )}
            >
              <input
                type="file"
                accept=".zip,.md"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <FileArchive size={32} strokeWidth={1.6} className="text-[var(--muted)]" />
              <p className="text-[13.5px] text-[var(--text)] font-medium text-center">
                {fileName ?? "拖放 .zip 或 SKILL.md 文件，或点击选择"}
              </p>
            </label>

            <div className="mt-5">
              <p className="text-[13px] font-bold text-[var(--text)] mb-2">文件要求</p>
              <ul className="text-[12.5px] text-[var(--muted)] space-y-1.5 leading-relaxed pl-1">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--muted)] shrink-0" />
                  <span>包含 SKILL.md 文件的 .zip 压缩包</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-[var(--muted)] shrink-0" />
                  <span>或直接拖入 SKILL.md 文件</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="px-6 pb-6 pt-1">
            <button
              type="button"
              onClick={handleInstall}
              disabled={!fileName}
              className="w-full h-11 rounded-full bg-[#18181b] hover:opacity-90 text-white text-[13.5px] font-bold cursor-pointer disabled:bg-[var(--muted-2)] disabled:cursor-not-allowed disabled:hover:opacity-100 transition-opacity"
            >
              安装
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
