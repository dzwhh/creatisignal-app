"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FileText, BarChart2, BookOpen, Sparkles, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReportTab } from "@/components/reports/reports-content"

// tab 标签，与「创意助手」上方四模式保持一致
const TAB_LABELS = ["创意 report", "创意分析", "创意 brief", "创意生成"]
const TAB_KEYS: ReportTab[] = ["report", "analysis", "brief", "generate"]

type TaskCard = { icon: LucideIcon; title: string; desc: string; date: string }

const TASKS_BY_TAB: TaskCard[][] = [
  // 创意 report
  [
    { icon: FileText, title: "TikTok Shop 素材报告",  desc: "已完成 24 个素材拆解与表现归因", date: "今天" },
    { icon: FileText, title: "Q3 投放周期复盘",        desc: "聚合 32 条素材 + 12 个账户表现", date: "昨天" },
    { icon: FileText, title: "竞品 fentybeauty 周报",  desc: "近 7 天 18 条新增素材结构对比",  date: "06/18" },
    { icon: FileText, title: "新品上市前评估",          desc: "卖点 + 受众 + 投放节奏建议",     date: "06/15" },
  ],
  // 创意分析 —— 第 1 张固定为「高 CTR 素材分析」，点击进详情页
  [
    { icon: BarChart2, title: "高 CTR 素材分析",   desc: "提取封面、卖点、CTA 与节奏共性",    date: "今天" },
    { icon: BarChart2, title: "Hook 拆解对比",      desc: "5 条爆款前 3 秒模板归类",          date: "昨天" },
    { icon: BarChart2, title: "受众重叠诊断",        desc: "3 个广告组人群重合度 64%",         date: "06/19" },
    { icon: BarChart2, title: "ROI 拐点分析",        desc: "fp_021 投放第 12 天进入衰退",       date: "06/17" },
  ],
  // 创意 brief
  [
    { icon: BookOpen, title: "春季新品 Brief",      desc: "面向 UGC 达人的 5 条拍摄方向",     date: "今天" },
    { icon: BookOpen, title: "Hook 改写 Brief 5 条", desc: "基于 ZF7899 主打卖点重写",          date: "昨天" },
    { icon: BookOpen, title: "节日营销 Brief",       desc: "夏季户外场景 3 条方案",             date: "06/18" },
    { icon: BookOpen, title: "口播脚本 Brief",       desc: "适配数字人 / 真人 / UGC 三档",      date: "06/16" },
  ],
  // 创意生成
  [
    { icon: Sparkles, title: "UGC 脚本生成",    desc: "生成 8 个可直接拍摄的视频脚本",         date: "今天" },
    { icon: Sparkles, title: "30s 演示视频",     desc: "Seedance 2 · 9:16 · 720p",            date: "昨天" },
    { icon: Sparkles, title: "图文海报 3 套",    desc: "Nano Banana Pro · 1:1 / 4:3 / 9:16",   date: "06/18" },
    { icon: Sparkles, title: "口播配音",          desc: "TTS · 男声 / 女声 / 双语版",           date: "06/15" },
  ],
]

interface Props {
  /** 0..3 — 把对应 tab 切到前台 + 高亮该 tab 内的第一张卡 + 标 data-spotlight-target="task-result-card" */
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

  const tasks = TASKS_BY_TAB[activeTab]
  // 引导高亮：仅当 active tab === highlightTaskIndex 时把该 tab 的第 0 张卡作为高亮卡
  const highlightCardIdx = highlightTaskIndex === activeTab ? 0 : -1

  return (
    <section data-spotlight-section="task-result">
      <div className="flex items-center justify-between mb-[14px]">
        <h2 className="text-[17px] font-extrabold text-[#17181c]">任务结果</h2>
        <Link
          href={
            typeof highlightTaskIndex === "number"
              ? `/reports?tab=${TAB_KEYS[highlightTaskIndex]}&item=first`
              : `/reports?tab=${TAB_KEYS[activeTab]}`
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
          {TAB_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              className={cn(
                "border rounded-full h-[26px] px-3 text-[12px] font-extrabold cursor-pointer whitespace-nowrap transition-colors",
                activeTab === i
                  ? "border-white bg-white text-[#181b20] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  : "border-transparent bg-transparent text-[#777b83]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {tasks.map((task, idx) => {
          const highlighted = highlightCardIdx === idx
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
                key={`${activeTab}-${task.title}`}
                type="button"
                onClick={onHighlightedClick}
                data-spotlight-target="task-result-card"
                className={cardClasses}
              >
                {inner}
              </button>
            )
          }
          // 非高亮卡：创意分析 tab 第 1 张跳分析详情页；其余跳 /reports
          const href = activeTab === 1 && idx === 0
            ? `/assistant/analysis/demo?title=${encodeURIComponent(task.title)}`
            : `/reports?tab=${TAB_KEYS[activeTab]}`
          return (
            <Link key={`${activeTab}-${task.title}`} href={href} className={cardClasses}>
              {inner}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
