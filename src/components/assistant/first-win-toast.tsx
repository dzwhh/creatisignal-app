"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useOnboardingState, type TaskKind } from "@/lib/onboarding/state"
import { rainbowButtonClassName } from "@/components/ui/rainbow-button"

type ToastContent = {
  title: string
  desc: string
  primary: { label: string; href: string }
}

const COPY: Record<TaskKind, ToastContent> = {
  report: {
    title: "你的第一份报告出来了！",
    desc: "下一步：看 AI 怎么把它拆解成可复刻的方向",
    primary: { label: "立即看洞察", href: "/insights" },
  },
  video: {
    title: "你的第一条 30s 视频已生成！",
    desc: "下一步：试试复刻这条做 3 个变体",
    primary: { label: "进入爆款推荐", href: "/replicate" },
  },
  brief: {
    title: "Brief 已经准备好",
    desc: "下一步：进入创意生成，把 Brief 变成视频",
    primary: { label: "进入创意生成", href: "/create/video" },
  },
  analysis: {
    title: "分析报告已出",
    desc: "下一步：看完整诊断面板，定位 ROI 拐点",
    primary: { label: "进入素材诊断", href: "/insights" },
  },
}

const AUTO_DISMISS_MS = 9000

export function FirstWinToast() {
  const { state, shouldShowFirstWinToast, markFirstWinSeen } = useOnboardingState()
  const kind = state.firstWinKind
  const [show, setShow] = useState(false)
  const [closing, setClosing] = useState(false)

  // Open the toast when conditions match (only after mount to avoid SSR jump)
  useEffect(() => {
    if (shouldShowFirstWinToast && kind) {
      // Small delay so the user "feels" the celebration
      const t = window.setTimeout(() => setShow(true), 400)
      return () => window.clearTimeout(t)
    }
  }, [shouldShowFirstWinToast, kind])

  // Auto-dismiss
  useEffect(() => {
    if (!show) return
    const t = window.setTimeout(() => handleClose(), AUTO_DISMISS_MS)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show])

  function handleClose() {
    setClosing(true)
    window.setTimeout(() => {
      setShow(false)
      setClosing(false)
      markFirstWinSeen()
    }, 220)
  }

  if (!show || !kind) return null
  const copy = COPY[kind]

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 right-6 z-[100] w-[360px] rounded-2xl bg-white border border-[var(--line)] p-4 pr-3",
        "shadow-[0_24px_60px_rgba(9,9,11,0.18)]",
        closing ? "animate-cs-toast-out" : "animate-cs-toast-in"
      )}
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="关闭"
        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer"
      >
        <X size={14} />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--green)" }}>
          <CheckCircle2 size={18} strokeWidth={2.4} style={{ color: "var(--green-text)" }} />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-[13.5px] font-extrabold text-[var(--text)] leading-snug">{copy.title}</p>
          <p className="text-[11.5px] text-[var(--muted)] mt-1 leading-relaxed">{copy.desc}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={handleClose}
          className="h-8 px-3 rounded-full text-[12px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
        >
          稍后
        </button>
        <Link
          href={copy.primary.href}
          onClick={() => markFirstWinSeen()}
          className={cn(rainbowButtonClassName, "h-8 px-3 text-[12px]")}
        >
          {copy.primary.label}
          <ArrowRight size={12} strokeWidth={2.4} className="ml-1" />
        </Link>
      </div>

      <style jsx>{`
        @keyframes csToastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes csToastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(8px) scale(0.98); }
        }
        :global(.animate-cs-toast-in)  { animation: csToastIn 220ms ease-out both; }
        :global(.animate-cs-toast-out) { animation: csToastOut 220ms ease-in both; }
      `}</style>
    </div>
  )
}
