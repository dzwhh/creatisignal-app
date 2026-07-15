"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { X, Coins, ArrowRight, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── 企业认证弹窗：完善企业信息 → 提交后撒花 + 积分引导账户授权 ──────────────

const INDUSTRIES = ["电商零售", "美妆个护", "3C 数码", "服饰鞋包", "家居生活", "食品饮料", "游戏应用", "其他"]
const COMPANY_SIZES = ["1-10 人", "11-50 人", "51-200 人", "201-500 人", "500 人以上"]

const inputCls =
  "w-full h-10 rounded-xl border border-[var(--line)] bg-white px-3 text-[13px] text-[var(--text)] placeholder:text-[var(--muted-2)] outline-none focus:border-[var(--line-strong)] transition-colors"

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-bold text-[var(--text)] mb-1.5">
        {label}
        {required && <span className="text-[#e5484d] ml-0.5">*</span>}
      </span>
      {children}
    </label>
  )
}

// ─── 撒花纸屑 ────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ["#c9ff29", "#18181b", "#ffb02e", "#6aa0ff", "#ff6a9a", "#7ce2b0"]

// 确定性伪随机（mulberry32）：渲染纯函数，避免 Math.random 造成的重渲染抖动
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CONFETTI_PIECES = (() => {
  const rand = mulberry32(20260715)
  return Array.from({ length: 56 }, (_, i) => ({
    left: rand() * 100,
    x: (rand() - 0.5) * 160,
    r: (rand() - 0.5) * 900,
    d: 1.5 + rand() * 1.3,
    delay: rand() * 0.5,
    w: 5 + rand() * 5,
    h: 7 + rand() * 7,
    round: i % 4 === 0,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }))
})()

function ConfettiBurst() {
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
      {CONFETTI_PIECES.map((p, i) => (
        <span
          key={i}
          className={cn("cs-confetti absolute top-0", p.round ? "rounded-full" : "rounded-[2px]")}
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.round ? p.w : p.h,
            backgroundColor: p.color,
            "--cf-x": `${p.x}px`,
            "--cf-r": `${p.r}deg`,
            "--cf-d": `${p.d}s`,
            "--cf-delay": `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export function CertModal({ open, onOpenChange, onSubmitted }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** 表单提交成功（进入撒花页）时回调，用于父级隐藏 banner 等 */
  onSubmitted?: () => void
}) {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "success">("form")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [codeLeft, setCodeLeft] = useState(0)

  // 验证码倒计时（mock）
  useEffect(() => {
    if (codeLeft <= 0) return
    const t = window.setTimeout(() => setCodeLeft((c) => c - 1), 1000)
    return () => window.clearTimeout(t)
  }, [codeLeft])

  const canSubmit = name.trim() !== "" && email.trim() !== "" && code.trim().length >= 4

  function handleSubmit() {
    if (!canSubmit) return
    setStep("success")
    onSubmitted?.()
  }

  function handleAuthorize() {
    onOpenChange(false)
    router.push("/settings/data-sources?connect=tiktok")
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[420px] max-w-[calc(100vw-48px)] max-h-[86vh] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          {step === "form" ? (
            // ─── 表单 ───────────────────────────────────────────────────────
            <div className="overflow-y-auto px-6 pt-6 pb-6">
              <div className="flex items-start justify-between">
                <Dialog.Title className="text-[17px] font-bold text-[var(--text)]">完善企业信息</Dialog.Title>
                <Dialog.Close className="w-7 h-7 -mt-1 -mr-2 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
                  <X size={16} />
                </Dialog.Close>
              </div>
              <Dialog.Description className="mt-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
                为了给您提供更好的服务，请完善以下企业信息。您可以稍后再填写。
              </Dialog.Description>

              {/* 积分权益提示 */}
              <div className="mt-4 rounded-xl bg-[var(--lime-soft)] border border-[#d4e89a] px-3 py-2.5 flex items-center gap-2 text-[12.5px] font-bold text-[#3a4a10]">
                <Coins size={14} strokeWidth={2.2} className="shrink-0" />
                完成企业认证后，每日额外获取 600 积分
              </div>

              <div className="mt-5 flex flex-col gap-4">
                <Field label="企业名称" required>
                  <input className={inputCls} placeholder="请输入企业名称" value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="企业邮箱" required>
                  <input className={inputCls} type="email" placeholder="请输入企业邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="企业邮箱验证码" required>
                  <div className="flex gap-2">
                    <input className={inputCls} placeholder="6 位验证码" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
                    <button
                      type="button"
                      disabled={codeLeft > 0 || email.trim() === ""}
                      onClick={() => setCodeLeft(60)}
                      className="shrink-0 h-10 px-3.5 rounded-xl border border-[var(--line)] text-[12.5px] font-bold text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {codeLeft > 0 ? `${codeLeft}s 后重发` : "获取验证码"}
                    </button>
                  </div>
                </Field>
                <Field label="职位">
                  <input className={inputCls} placeholder="请输入您的职位" />
                </Field>
                <Field label="行业">
                  <select className={cn(inputCls, "appearance-none cursor-pointer")} defaultValue="">
                    <option value="" disabled>请选择行业</option>
                    {INDUSTRIES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="公司规模">
                  <select className={cn(inputCls, "appearance-none cursor-pointer")} defaultValue="">
                    <option value="" disabled>请选择公司规模</option>
                    {COMPANY_SIZES.map((v) => <option key={v}>{v}</option>)}
                  </select>
                </Field>
                <Field label="官网地址">
                  <input className={inputCls} type="url" placeholder="https://example.com" />
                </Field>
                <Field label="联系电话">
                  <input className={inputCls} placeholder="请输入联系电话" />
                </Field>
              </div>

              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="mt-6 w-full h-11 rounded-full bg-[var(--near-black)] text-white text-[14px] font-bold cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                提交
              </button>
              <Dialog.Close className="mt-3 w-full text-center text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer">
                稍后填写
              </Dialog.Close>
            </div>
          ) : (
            // ─── 成功：撒花 + 积分 + 授权引导 ───────────────────────────────
            <div className="relative px-6 pt-9 pb-6 text-center">
              <ConfettiBurst />
              <Dialog.Close className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
                <X size={16} />
              </Dialog.Close>

              <div className="mx-auto w-[64px] h-[64px] rounded-full bg-[var(--lime)] flex items-center justify-center shadow-[0_10px_28px_rgba(201,255,41,0.5)]">
                <PartyPopper size={30} strokeWidth={2} className="text-[#1a2010]" />
              </div>
              <Dialog.Title className="mt-4 text-[19px] font-extrabold text-[var(--text)]">
                恭喜获得 1000 积分！
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 text-[12.5px] text-[var(--muted)]">
                企业认证已提交，积分已发放到你的账户
              </Dialog.Description>

              {/* 下一步：账户授权积分引导 */}
              <div className="mt-6 rounded-2xl border border-[#d4e89a] bg-[var(--lime-soft)]/60 p-4 text-left">
                <p className="flex items-center gap-1.5 text-[13.5px] font-extrabold text-[#3a4a10]">
                  <Coins size={15} strokeWidth={2.2} />
                  再领 1000 积分
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-[#5a6b1a]">
                  授权 TikTok 广告账户，立得 1000 积分，还能解锁真实投放数据洞察——素材表现一目了然。
                </p>
                <button
                  type="button"
                  onClick={handleAuthorize}
                  className="mt-3.5 w-full h-10 rounded-full bg-[var(--near-black)] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  去授权广告账户，再领 1000 积分
                  <ArrowRight size={14} strokeWidth={2.4} />
                </button>
              </div>

              <Dialog.Close className="mt-4 text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] cursor-pointer">
                稍后再说
              </Dialog.Close>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
