"use client"

import { motion } from "framer-motion"
import { ArrowRight, X, Sparkles } from "lucide-react"

// ─── 权益 banner：引导完成企业认证 + 广告账户授权 ────────────────────────────

export function CertBanner({ onCertify, onDismiss }: {
  onCertify: () => void
  onDismiss: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl bg-[#101208] mb-6 flex items-center gap-3 pl-3 pr-3 h-[58px]"
    >
      {/* 右侧装饰曲线 */}
      <svg
        aria-hidden
        className="absolute right-[120px] top-0 h-full w-[380px] pointer-events-none"
        viewBox="0 0 380 58"
        fill="none"
        preserveAspectRatio="none"
      >
        <path d="M0 44 C 120 10, 220 58, 380 18" stroke="#c9ff29" strokeOpacity="0.25" strokeWidth="1" />
        <path d="M0 54 C 140 24, 250 66, 380 30" stroke="#c9ff29" strokeOpacity="0.12" strokeWidth="1" />
      </svg>

      {/* 左：权益 pill */}
      <span className="shrink-0 h-[30px] px-3 rounded-full border border-[#c9ff29]/60 text-[var(--lime)] text-[12px] font-bold flex items-center gap-1.5 whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--lime)]" />
        权益大放送，创作更自由
        <Sparkles size={12} strokeWidth={2.2} />
      </span>

      {/* 中：说明文案 */}
      <p className="text-[13px] text-[#d4d4d8] font-medium truncate">
        完成 <span className="text-[var(--lime)] font-bold">企业认证</span> 和{" "}
        <span className="text-[var(--lime)] font-bold">账户授权</span> 解锁更多权益
      </p>

      <div className="flex-1" />

      {/* 右：去认证 + 关闭 */}
      <button
        type="button"
        onClick={onCertify}
        className="relative shrink-0 h-[32px] px-4 rounded-full bg-[var(--lime)] text-[#1a2010] text-[12.5px] font-extrabold flex items-center gap-1.5 cursor-pointer hover:brightness-105 transition-[filter] whitespace-nowrap"
      >
        去认证
        <ArrowRight size={13} strokeWidth={2.6} />
      </button>
      <span className="shrink-0 w-px h-5 bg-white/15" />
      <button
        type="button"
        onClick={onDismiss}
        aria-label="关闭"
        className="shrink-0 w-[30px] h-[30px] rounded-lg border border-white/15 text-[#a1a1aa] hover:text-white hover:border-white/35 flex items-center justify-center cursor-pointer transition-colors"
      >
        <X size={13} strokeWidth={2.4} />
      </button>
    </motion.div>
  )
}
