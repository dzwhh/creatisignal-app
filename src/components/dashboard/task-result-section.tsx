"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, BarChart2, BookOpen, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReportTab } from "@/components/reports/reports-content"

const tabs = ["报告", "分析结果", "Brief 结果", "生成结果"]

// 与 reports 的 tab key 对应，索引 → href
const TAB_KEYS: ReportTab[] = ["report", "analysis", "brief", "generate"]

const tasks = [
  {
    icon: FileText,
    title: "TikTok Shop 素材报告",
    desc: "已完成 24 个素材拆解与表现归因",
    date: "今天",
  },
  {
    icon: BarChart2,
    title: "高 CTR 素材分析",
    desc: "提取封面、卖点、CTA 与节奏共性",
    date: "昨天",
  },
  {
    icon: BookOpen,
    title: "春季新品 Brief",
    desc: "面向 UGC 达人的 5 条拍摄方向",
    date: "05/15",
  },
  {
    icon: Sparkles,
    title: "UGC 脚本生成",
    desc: "生成 8 个可直接拍摄的视频脚本",
    date: "05/14",
  },
]

interface Props {
  /** 0..3 — 把对应卡片高亮 + 自动切到对应 tab + 标 data-spotlight-target="task-result-card" */
  highlightTaskIndex?: number
  /** 用户点了高亮卡时调用——引导阶段会打开结果 modal（阻止默认跳转） */
  onHighlightedClick?: () => void
  /** 把「查看全部」按钮标 data-spotlight-target="view-all-btn" 用于第二阶段引导 */
  highlightViewAll?: boolean
  /** 用户点了「查看全部」时调用（用来标记 first-win 看完）；不阻止 Link 跳走 */
  onViewAllClick?: () => void
}

export function TaskResultSection({ highlightTaskIndex, onHighlightedClick, highlightViewAll, onViewAllClick }: Props = {}) {
  const [activeTab, setActiveTab] = useState(0)

  // 外部要求高亮时，自动切到对应 tab
  useEffect(() => {
    if (typeof highlightTaskIndex === "number") setActiveTab(highlightTaskIndex)
  }, [highlightTaskIndex])

  return (
    <section data-spotlight-section="task-result">
      <div className="flex items-center justify-between mb-[14px]">
        <h2 className="text-[17px] font-extrabold text-[#17181c]">任务结果</h2>
        <Link
          href={
            typeof highlightTaskIndex === "number"
              ? `/reports?tab=${TAB_KEYS[highlightTaskIndex]}&item=first`
              : "/reports"
          }
          onClick={highlightViewAll ? onViewAllClick : undefined}
          data-spotlight-target={highlightViewAll ? "view-all-btn" : undefined}
          className={cn(
            "h-[34px] border-0 rounded-full bg-[var(--lime)] text-[#20251a] px-[18px] text-[13px] font-extrabold cursor-pointer flex items-center hover:opacity-90 transition-opacity",
            highlightViewAll && "shadow-[0_0_0_3px_rgba(201,255,41,0.95),0_0_0_8px_rgba(201,255,41,0.32)]"
          )}
        >
          查看全部
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 mb-[14px]">
        <div className="flex items-center gap-[3px] border border-[var(--line)] rounded-full bg-[#f5f5f6] p-[3px]">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={cn(
                "border rounded-full h-[26px] px-3 text-[12px] font-extrabold cursor-pointer whitespace-nowrap transition-colors",
                activeTab === i
                  ? "border-white bg-white text-[#181b20] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  : "border-transparent bg-transparent text-[#777b83]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {tasks.map((task, idx) => {
          const highlighted = highlightTaskIndex === idx
          const cardClasses = cn(
            "min-h-[118px] border rounded-xl bg-white p-[14px] flex flex-col justify-between text-left transition-all cursor-pointer hover:shadow-[0_4px_12px_rgba(9,9,11,0.06)] hover:border-[var(--line-strong)]",
            highlighted ? "border-[var(--line-strong)]" : "border-[var(--line)]"
          )
          const inner = (
            <>
              <div>
                <div className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center bg-[#f4f1ff] text-[#6d5dfc] mb-[10px]">
                  <task.icon size={16} strokeWidth={2} />
                </div>
                <h3 className="text-sm font-extrabold text-[#282b32] leading-snug">{task.title}</h3>
                <p className="mt-2 text-[12px] text-[#8a8e96] leading-[1.45]">{task.desc}</p>
              </div>
              <div className="mt-3 flex justify-between items-center text-[12px] font-bold text-[#9a9ea7]">
                <span className="flex items-center gap-1">
                  <i className="inline-block w-[7px] h-[7px] rounded-full bg-[#5cc981]" />
                  已完成
                </span>
                <span>{task.date}</span>
              </div>
            </>
          )
          // 高亮卡：用 button 直接调 onHighlightedClick（打开 modal），不跳走
          if (highlighted) {
            return (
              <button
                key={task.title}
                type="button"
                onClick={onHighlightedClick}
                data-spotlight-target="task-result-card"
                className={cardClasses}
              >
                {inner}
              </button>
            )
          }
          // 非高亮卡：保留 Link 跳 /reports
          return (
            <Link key={task.title} href={`/reports?tab=${TAB_KEYS[idx]}`} className={cardClasses}>
              {inner}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
