"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReplicaDirectionV2 } from "@/lib/insights/types"
import { ScriptStoryboardPair } from "../script-storyboard-pair"

interface Props {
  directions: ReplicaDirectionV2[]
  selectedDirectionId: ReplicaDirectionV2["id"]
  onSelectDirection: (id: ReplicaDirectionV2["id"]) => void
}

export function DirectionStep({ directions, selectedDirectionId, onSelectDirection }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[19px] font-extrabold text-[var(--text)] mb-1">3 个方向，选一个或直接全部生成</h2>
        <p className="text-[12.5px] text-[var(--muted)]">每个方向同时给出「内容脚本 + 分镜脚本」，全部可独立展开 / 收起</p>
      </div>

      <div className="space-y-3">
        {directions.map((d) => (
          <DirectionItem
            key={d.id}
            direction={d}
            isSelected={selectedDirectionId === d.id}
            defaultExpanded={selectedDirectionId === d.id}
            onSelect={() => onSelectDirection(d.id)}
          />
        ))}
      </div>
    </div>
  )
}

function DirectionItem({
  direction,
  isSelected,
  defaultExpanded,
  onSelect,
}: {
  direction: ReplicaDirectionV2
  isSelected: boolean
  defaultExpanded: boolean
  onSelect: () => void
}) {
  // 每张卡内部 expanded 状态，独立于"是否被选为方向"
  const [expanded, setExpanded] = useState(defaultExpanded)

  // 父级切换选中时，初始展开（不强制，只在 selected→true 那刻）
  useEffect(() => {
    if (isSelected) setExpanded(true)
  }, [isSelected])

  function handleHeaderClick() {
    if (!isSelected) onSelect()
    setExpanded((v) => !v)
  }

  return (
    <article
      className={cn(
        "rounded-2xl border bg-white overflow-hidden transition-all",
        isSelected ? "border-[var(--near-black)]" : "border-[var(--line)]"
      )}
    >
      {/* Header — 点击即可独立收起/展开 */}
      <button
        type="button"
        onClick={handleHeaderClick}
        className="w-full text-left p-4 flex items-start gap-3 cursor-pointer hover:bg-[var(--soft-2)]"
      >
        <span className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-extrabold shrink-0",
          isSelected ? "bg-[var(--near-black)] text-white" : "bg-[var(--soft)] text-[var(--muted)]"
        )}>{direction.id}</span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-[14px] font-extrabold text-[var(--text)]">{direction.title}</h3>
            <span className="h-5 px-1.5 rounded-md bg-[#ede9fe] text-[#6d28d9] text-[10px] font-extrabold">
              变量轴 · {direction.axis === "hook" ? "开场 Hook" : direction.axis === "scene" ? "核心场景" : "卖点优先级"}
            </span>
          </div>
          <p className="text-[12px] text-[var(--muted)] line-clamp-2">{direction.desc}</p>
          <div className="mt-2 flex items-center gap-3 text-[11px]">
            <span className="font-bold text-[var(--text)]">📈 {direction.expectedDelta}</span>
            <span className="text-[var(--muted)]">置信度 <span className="font-extrabold text-[var(--text)]">{(direction.confidence * 100).toFixed(0)}%</span></span>
          </div>
        </div>

        <span className={cn(
          "shrink-0 mt-1 text-[var(--muted)] transition-transform",
          expanded && "rotate-180"
        )}>
          <ChevronDown size={16} />
        </span>
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--line)] pt-3 space-y-3">
          <ScriptStoryboardPair
            script={direction.script}
            storyboard={direction.storyboard}
            briefText={direction.briefText}
          />

          {/* 风险提示 */}
          {direction.risks.length > 0 && (
            <div className="rounded-lg border border-[#fde68a] bg-[#fffbeb] px-3 py-2 flex items-start gap-2">
              <AlertTriangle size={12} className="text-[#a16207] mt-0.5 shrink-0" />
              <div className="text-[11px] text-[#9a3412] leading-relaxed">
                <span className="font-extrabold">风险提示：</span>{direction.risks.join("；")}
              </div>
            </div>
          )}

          {/* Actions — 仅保留展开完整脚本 + 重新生成 */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-[11px] font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer flex items-center gap-1"
            >
              <ChevronUp size={11} />
              收起
            </button>
            <button
              type="button"
              className="h-7 px-2 rounded-full border border-[var(--line)] text-[11px] font-bold text-[var(--muted)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1"
            >
              <RefreshCw size={10} />
              重新生成
            </button>
          </div>
        </div>
      )}
    </article>
  )
}
