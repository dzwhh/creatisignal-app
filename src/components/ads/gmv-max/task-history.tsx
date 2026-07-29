"use client"

import { Fragment, useState } from "react"
import { Copy, RotateCcw, TrendingUp, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GmvMaxTask } from "@/lib/ads/gmv-max-types"
import { TaskDetail } from "./task-detail"

// ─── 任务历史：Spark Ads → GMV Max 创编任务列表 ──────────────────────────────

interface TaskHistoryProps {
  tasks: GmvMaxTask[]
  onCopy: (task: GmvMaxTask) => void
  onRetry: (task: GmvMaxTask) => void
}

export function TaskHistory({ tasks, onCopy, onRetry }: TaskHistoryProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white overflow-hidden">
      {/* 子 Tab：目前仅一条创编链路 */}
      <div className="px-5 pt-4 border-b border-[var(--line)]">
        <div className="inline-flex flex-col">
          <span className="text-sm font-semibold text-[#5c7a00] pb-2.5">Spark Ads → GMV Max</span>
          <span className="h-0.5 rounded-full bg-[var(--lime)]" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="text-left text-xs text-[var(--muted)] border-b border-[var(--line)]">
              <th className="font-medium px-5 py-3">推广系列名称</th>
              <th className="font-medium px-4 py-3">广告主 ID</th>
              <th className="font-medium px-4 py-3">创建时间</th>
              <th className="font-medium px-4 py-3">状态</th>
              <th className="font-medium px-4 py-3">耗时</th>
              <th className="font-medium px-4 py-3">资源链接</th>
              <th className="font-medium px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const expanded = expandedId === task.id
              return (
                <Fragment key={task.id}>
                  <tr
                    className={cn(
                      "border-b border-[var(--line)] last:border-b-0 transition-colors duration-150",
                      expanded ? "bg-[var(--soft-2)]" : "hover:bg-[var(--soft-2)]"
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-[var(--text)]">{task.name}</span>
                      <span className="ml-1.5 text-xs text-[var(--muted-2)]">#{task.id}</span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[var(--muted)]">{task.advertiserId}</td>
                    <td className="px-4 py-3.5 text-[var(--muted)] whitespace-nowrap">{task.createdAt}</td>
                    <td className="px-4 py-3.5">
                      {task.status === "success" ? (
                        <Badge variant="success">成功</Badge>
                      ) : (
                        <Badge variant="destructive">失败</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[var(--muted)]">{task.duration}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {task.hasGmvMaxLink && (
                          <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-indigo-50 text-indigo-600 text-xs font-medium cursor-pointer hover:bg-indigo-100 transition-colors duration-150">
                            <TrendingUp size={12} /> GMV Max
                          </span>
                        )}
                        {task.hasVideoLink && (
                          <span className="inline-flex items-center gap-1 h-6 px-2 rounded-md bg-indigo-50 text-indigo-600 text-xs font-medium cursor-pointer hover:bg-indigo-100 transition-colors duration-150">
                            <Video size={12} /> 视频
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Button variant="outline" size="sm" onClick={() => setExpandedId(expanded ? null : task.id)}>
                          {expanded ? "收起" : "展开"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onCopy(task)}>
                          <Copy size={12} /> 复制
                        </Button>
                        {task.status === "failed" && (
                          <Button variant="destructive" size="sm" onClick={() => onRetry(task)}>
                            <RotateCcw size={12} /> 重试
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="border-b border-[var(--line)] bg-[var(--soft-2)]">
                      <td colSpan={7} className="px-5 py-4">
                        <TaskDetail task={task} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
