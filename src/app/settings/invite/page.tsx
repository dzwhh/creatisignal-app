"use client"

import { useState } from "react"
import { Check, Copy, Crown, Download, Gem, Gift, Mail, MessageCircle, ScrollText, Send, Share2, Trophy, Users, X as XIcon } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { cn } from "@/lib/utils"

const REF_URL = "https://creatisignal.com/r/alexd-2026"

const SHARE_TARGETS = [
  { id: "tiktok",   label: "TikTok",   icon: Send,           color: "#000000" },
  { id: "meta",     label: "Meta",     icon: Share2,         color: "#0866ff" },
  { id: "twitter",  label: "X",        icon: XIcon,         color: "#18181b" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle,  color: "#25d366" },
  { id: "email",    label: "邮件",     icon: Mail,           color: "#ea4335" },
]

type Tier = { id: string; label: string; threshold: number; perks: string }
const TIERS: Tier[] = [
  { id: "copper",   label: "铜",   threshold: 0,  perks: "5% 返积分" },
  { id: "silver",   label: "银",   threshold: 5,  perks: "8% 返积分 + 早鸟权益" },
  { id: "gold",     label: "金",   threshold: 15, perks: "12% 返积分 + Pro 月度试用" },
  { id: "platinum", label: "铂",   threshold: 30, perks: "18% 返积分 + 大客户经理" },
  { id: "diamond",  label: "钻",   threshold: 60, perks: "25% 返积分 + 联合营销" },
]

type Invite = {
  name: string
  joinedAt: string
  status: "active" | "pending" | "lapsed"
  reward: number
}
const INVITES: Invite[] = [
  { name: "Jane Tan",        joinedAt: "2026-06-12", status: "active",  reward: 200 },
  { name: "Marcus Chen",     joinedAt: "2026-06-10", status: "active",  reward: 200 },
  { name: "Sophie Wang",     joinedAt: "2026-06-04", status: "active",  reward: 100 },
  { name: "Rina Yamamoto",   joinedAt: "2026-05-28", status: "pending", reward: 0   },
  { name: "Kai Lim",         joinedAt: "2026-05-15", status: "lapsed",  reward: 0   },
  { name: "David Park",      joinedAt: "2026-05-02", status: "active",  reward: 100 },
]

const STATUS_META: Record<Invite["status"], { label: string; bg: string; color: string }> = {
  active:  { label: "活跃中", bg: "#dcfce7", color: "#15803d" },
  pending: { label: "待激活", bg: "#fef3c7", color: "#a16207" },
  lapsed:  { label: "已流失", bg: "#fee2e2", color: "#b91c1c" },
}

export default function InvitePage() {
  const [copied, setCopied] = useState(false)
  const invitedActive = INVITES.filter((x) => x.status === "active").length
  const currentTierIdx = [...TIERS].reverse().findIndex((t) => invitedActive >= t.threshold)
  const currentTier = TIERS[TIERS.length - 1 - currentTierIdx] ?? TIERS[0]
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1]

  function copy() {
    navigator.clipboard?.writeText(REF_URL).catch(() => {})
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <Topbar title="邀请裂变" />
      <SettingsShell title="邀请裂变" subtitle="分享专属链接，好友成功注册并完成首次任务，双方都得积分。">
        {/* 推荐链接 */}
        <SettingsCard icon={Share2} title="我的推荐链接" description="分享给好友即可开始累计奖励。">
          <div className="flex items-stretch gap-2">
            <input
              readOnly
              value={REF_URL}
              className="flex-1 h-10 px-3 rounded-lg border border-[var(--line)] bg-[var(--soft-2)] text-[12.5px] font-mono outline-none"
            />
            <button
              type="button"
              onClick={copy}
              className={cn(
                "h-10 px-4 rounded-lg text-[12.5px] font-extrabold cursor-pointer flex items-center gap-1.5 transition-colors",
                copied ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#18181b] text-white hover:opacity-90"
              )}
            >
              {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={12} strokeWidth={2.4} />}
              {copied ? "已复制" : "复制链接"}
            </button>
            <button
              type="button"
              className="h-10 px-3.5 rounded-lg border border-[var(--line)] text-[12px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1.5"
            >
              <Download size={12} strokeWidth={2.4} />
              下载海报
            </button>
          </div>
          {/* 占位 QR 码 + 分享按钮 */}
          <div className="mt-4 grid grid-cols-[120px_1fr] gap-4 items-start">
            <PlaceholderQR />
            <div>
              <p className="text-[11px] font-extrabold text-[var(--muted)] uppercase tracking-wide mb-2">分享到</p>
              <div className="flex flex-wrap gap-2">
                {SHARE_TARGETS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="h-9 px-3 rounded-full text-[12px] font-bold border border-[var(--line)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: t.color }}>
                      <t.icon size={11} strokeWidth={2.4} />
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
              <p className="text-[10.5px] text-[var(--muted-2)] mt-3 leading-relaxed">
                好友通过链接注册 + 完成首次任务，你获得 100 积分，TA 获得 50 积分；TA 升级 Pro，你额外得 500。
              </p>
            </div>
          </div>
        </SettingsCard>

        {/* 奖励概览 */}
        <SettingsCard icon={Trophy} title="奖励概览" description="本年度累计奖励快照。">
          <div className="grid grid-cols-3 gap-3">
            <KPI icon={Users}  label="活跃受邀好友" value={invitedActive.toString()} />
            <KPI icon={Gift}   label="累计奖励积分" value="2,140" />
            <KPI icon={Crown}  label="当前等级"     value={currentTier.label + " 级"} accent />
          </div>
        </SettingsCard>

        {/* 等级阶梯 */}
        <SettingsCard icon={Gem} title="等级阶梯" description="活跃受邀好友数决定等级，等级越高返积分越多。">
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-extrabold text-[var(--text)]">已达 {currentTier.label} 级</span>
              {nextTier && <span className="text-[var(--muted)]">距 {nextTier.label} 级还差 {Math.max(0, nextTier.threshold - invitedActive)} 位好友</span>}
            </div>
            <div className="h-2 rounded-full bg-[var(--soft)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#c9ff29] via-[#facc15] to-[#7c3aed]"
                style={{ width: `${Math.min(100, (invitedActive / (TIERS.at(-1)?.threshold ?? 1)) * 100)}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {TIERS.map((t) => {
              const active = invitedActive >= t.threshold
              return (
                <article
                  key={t.id}
                  className={cn(
                    "rounded-xl border p-2.5 flex flex-col items-center text-center",
                    active ? "border-[var(--text)] bg-white" : "border-dashed border-[var(--line)] bg-[var(--soft-2)] opacity-70"
                  )}
                >
                  <Gem size={14} className={active ? "text-[#7c3aed]" : "text-[var(--muted-2)]"} />
                  <p className="text-[12px] font-extrabold text-[var(--text)] mt-1">{t.label} 级</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">≥ {t.threshold} 位</p>
                  <p className="text-[10px] text-[var(--muted)] mt-1 leading-snug">{t.perks}</p>
                </article>
              )
            })}
          </div>
        </SettingsCard>

        {/* 邀请列表 */}
        <SettingsCard icon={ScrollText} title="我的邀请" noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[11px] font-extrabold uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5">昵称</th>
                  <th className="text-left px-5 py-2.5">加入时间</th>
                  <th className="text-center px-5 py-2.5">状态</th>
                  <th className="text-right px-5 py-2.5">奖励积分</th>
                </tr>
              </thead>
              <tbody>
                {INVITES.map((inv, i) => {
                  const meta = STATUS_META[inv.status]
                  return (
                    <tr key={inv.name} className={i > 0 ? "border-t border-[var(--line)]" : ""}>
                      <td className="px-5 py-2.5 font-extrabold text-[var(--text)]">{inv.name}</td>
                      <td className="px-5 py-2.5 text-[var(--muted)]">{inv.joinedAt}</td>
                      <td className="px-5 py-2.5 text-center">
                        <span className="inline-flex items-center h-5 px-1.5 rounded-md text-[10.5px] font-extrabold" style={{ backgroundColor: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums font-extrabold text-[var(--text)]">
                        {inv.reward > 0 ? `+${inv.reward}` : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </SettingsShell>
    </>
  )
}

function KPI({ icon: Icon, label, value, accent }: { icon: typeof Users; label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn(
      "rounded-xl border p-3.5",
      accent ? "border-[#cdf066] bg-[var(--lime-soft)]" : "border-[var(--line)] bg-white"
    )}>
      <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center", accent ? "bg-[#c9ff29] text-[#1a2010]" : "bg-[var(--soft)] text-[var(--text)]")}>
        <Icon size={14} strokeWidth={2.4} />
      </span>
      <p className="text-[11px] text-[var(--muted)] font-semibold mt-2">{label}</p>
      <p className="text-[18px] font-extrabold text-[var(--text)] mt-1">{value}</p>
    </div>
  )
}

function PlaceholderQR() {
  // 8×8 grid 渐变 mock QR
  const cells = Array.from({ length: 64 }, (_, i) => {
    const x = i % 8, y = Math.floor(i / 8)
    const corner = (x < 3 && y < 3) || (x < 3 && y > 4) || (x > 4 && y < 3)
    const filled = corner || ((x * 31 + y * 17 + 11) % 3 === 0)
    return filled
  })
  return (
    <div className="w-[120px] h-[120px] rounded-xl border border-[var(--line)] bg-white p-2 grid grid-cols-8 gap-[1px]">
      {cells.map((on, i) => (
        <span key={i} className={on ? "bg-[var(--text)]" : "bg-transparent"} />
      ))}
    </div>
  )
}
