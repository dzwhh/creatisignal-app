"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  defaultGmvMaxConfig,
  planNamePrefix,
  validateGmvMaxConfig,
  type ConfigErrors,
  type GmvMaxConfig,
  type GmvMaxTask,
} from "@/lib/ads/gmv-max-types"
import { mockAccounts, mockTasks } from "@/lib/ads/gmv-max-mock"
import { CreatePanel } from "./create-panel"
import { TaskHistory } from "./task-history"

// ─── GMV Max 创编主容器：Tab 切换 / 草稿 / 发布 / 复制回填 ───────────────────

export type GmvMaxTab = "create" | "history"

const DRAFT_KEY = "gmvmax:draft"

/** 校验错误字段 → 所属配置分区锚点 */
const FIELD_SECTION: Record<string, string> = {
  accountId: "section-basic",
  shopId: "section-product",
  productIds: "section-product",
  roasBid: "section-delivery",
  dailyBudget: "section-delivery",
  promoStart: "section-advanced",
  videoIds: "section-creative",
  scheduleStart: "section-schedule",
}

export function GmvMaxShell({ initialTab = "create" }: { initialTab?: GmvMaxTab }) {
  const router = useRouter()
  const [tab, setTab] = useState<GmvMaxTab>(initialTab)
  const [config, setConfig] = useState<GmvMaxConfig>(defaultGmvMaxConfig)
  const [errors, setErrors] = useState<ConfigErrors>({})
  const [tasks, setTasks] = useState<GmvMaxTask[]>(mockTasks)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 进入页面时恢复草稿（异步恢复，避免 SSR 水合不一致与级联渲染）
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(DRAFT_KEY)
        if (raw) setConfig({ ...defaultGmvMaxConfig, ...JSON.parse(raw) })
      } catch {
        /* 草稿损坏则忽略 */
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  const switchTab = useCallback(
    (next: GmvMaxTab) => {
      setTab(next)
      router.replace(next === "history" ? "/ads/gmv-max?tab=history" : "/ads/gmv-max", { scroll: false })
    },
    [router]
  )

  const update = useCallback(<K extends keyof GmvMaxConfig>(key: K, value: GmvMaxConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }, [])

  const saveDraft = useCallback(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(config))
    showToast("草稿已保存，下次进入自动恢复")
  }, [config, showToast])

  const publish = useCallback(() => {
    const nextErrors = validateGmvMaxConfig(config)
    setErrors(nextErrors)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      const section = FIELD_SECTION[firstError]
      if (section) document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" })
      showToast("请先完善必填配置项")
      return
    }
    const account = mockAccounts.find((a) => a.id === config.accountId)
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    const newTask: GmvMaxTask = {
      id: Math.max(...tasks.map((t) => t.id)) + 1,
      name: `${planNamePrefix(now)}${config.planName || "未命名"}`,
      advertiserId: account?.advertiserId ?? "--",
      createdAt: `${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      status: "success",
      duration: `${Math.floor(Math.random() * 30) + 10}m${Math.floor(Math.random() * 60)}s`,
      hasGmvMaxLink: true,
      hasVideoLink: true,
      config: { planName: config.planName, roasBid: config.roasBid, dailyBudget: config.dailyBudget },
    }
    setTasks((prev) => [newTask, ...prev])
    localStorage.removeItem(DRAFT_KEY)
    switchTab("history")
    showToast(`发布成功：${newTask.name} 已进入创编队列`)
  }, [config, tasks, switchTab, showToast])

  const copyTask = useCallback(
    (task: GmvMaxTask) => {
      setConfig((prev) => ({ ...prev, ...task.config }))
      setErrors({})
      switchTab("create")
      showToast(`已复制 #${task.id} 的配置到新建创编`)
    },
    [switchTab, showToast]
  )

  const retryTask = useCallback(
    (task: GmvMaxTask) => {
      showToast(`任务 #${task.id} 已重新提交`)
      // mock：1.5s 后重试成功
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: "success", hasGmvMaxLink: true, duration: "1m30s", failReason: undefined }
              : t
          )
        )
      }, 1500)
    },
    [showToast]
  )

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 工具栏：面包屑 / Tab 切换 / 操作按钮 */}
      <div className="shrink-0 bg-white border-b border-[var(--line)] px-4 sm:px-6 py-2.5 flex items-center gap-3">
        <div className="hidden md:flex items-center gap-1.5 text-[13px] text-[var(--muted)] min-w-0">
          <span className="whitespace-nowrap">广告创编</span>
          <ChevronRight size={13} className="text-[var(--muted-2)] shrink-0" />
          <span className="px-1.5 py-0.5 rounded bg-[var(--lime-soft)] text-[#5c7a00] text-xs font-mono font-semibold">
            GMV_MAX
          </span>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="inline-flex rounded-lg border border-[var(--line)] bg-[var(--soft-2)] p-1">
            {(
              [
                { value: "create", label: "新建创编" },
                { value: "history", label: "任务历史" },
              ] as const
            ).map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => switchTab(value)}
                className={cn(
                  "h-8 px-4 rounded-md text-[13px] font-medium transition-colors duration-200 cursor-pointer",
                  tab === value
                    ? "bg-white text-[var(--text)] shadow-[var(--shadow-sm)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={cn("flex items-center gap-2", tab !== "create" && "invisible")}>
          <Button variant="ghost" size="sm" className="h-8 px-3 text-[13px]" onClick={saveDraft}>
            保存草稿
          </Button>
          <Button variant="primary" size="sm" className="h-8 px-4 text-[13px] font-semibold" onClick={publish}>
            发布广告
          </Button>
        </div>
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-y-auto bg-[var(--panel)]">
        {tab === "create" ? (
          <CreatePanel config={config} update={update} errors={errors} />
        ) : (
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-6">
            <TaskHistory tasks={tasks} onCopy={copyTask} onRetry={retryTask} />
          </div>
        )}
      </div>

      {/* 轻量 toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-[var(--near-black)] text-white text-[13px] px-4 py-2.5 shadow-[var(--shadow-sm)] animate-[dh-fade-in_0.25s_ease-out]">
          <CheckCircle2 size={15} className="text-[var(--lime)]" />
          {toast}
        </div>
      )}
    </div>
  )
}
