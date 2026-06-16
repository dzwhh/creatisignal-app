"use client"

import * as Dialog from "@radix-ui/react-dialog"
import {
  ArrowRight,
  BarChart2,
  BookOpen,
  CheckCircle2,
  FileText,
  Play,
  Sparkles,
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
      { label: "可继续动作", body: "复刻 3 个变体放量 · 或直接提交投放实验" },
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

export function TaskResultModal({ kind, open, onClose }: Props) {
  if (!kind) return null
  const c = CONFIG[kind]
  const Icon = c.icon

  return (
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
  )
}
