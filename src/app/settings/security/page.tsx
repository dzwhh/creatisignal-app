"use client"

import { useState } from "react"
import { Activity, KeyRound, LogOut, Monitor, ScrollText, Smartphone, ShieldCheck, ShieldQuestion } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { Toggle } from "@/components/settings/toggle"
import { cn } from "@/lib/utils"

type Session = {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  current?: boolean
  icon: typeof Monitor
}

const INITIAL_SESSIONS: Session[] = [
  { id: "mac-chrome", device: "Mac · Chrome 132",     browser: "Chrome",  location: "Shanghai, CN",  lastActive: "刚刚",         current: true,  icon: Monitor },
  { id: "iphone-app", device: "iPhone 15 · App",      browser: "iOS App", location: "Shanghai, CN",  lastActive: "12 分钟前",    icon: Smartphone },
  { id: "mac-safari", device: "MacBook · Safari 18",  browser: "Safari",  location: "Tokyo, JP",     lastActive: "昨天 17:42",   icon: Monitor },
]

type LoginEvent = {
  ts: string
  device: string
  ip: string
  location: string
  status: "success" | "failed"
}
const HISTORY: LoginEvent[] = [
  { ts: "2026-06-19 10:24", device: "Mac · Chrome 132",    ip: "112.65.x.x", location: "Shanghai, CN", status: "success" },
  { ts: "2026-06-19 09:18", device: "iPhone 15 · App",      ip: "183.16.x.x", location: "Shanghai, CN", status: "success" },
  { ts: "2026-06-18 22:01", device: "Mac · Chrome 132",    ip: "112.65.x.x", location: "Shanghai, CN", status: "success" },
  { ts: "2026-06-18 14:13", device: "Unknown · Linux",      ip: "45.32.x.x",  location: "Singapore",    status: "failed"  },
  { ts: "2026-06-17 19:30", device: "MacBook · Safari 18", ip: "118.42.x.x", location: "Tokyo, JP",    status: "success" },
  { ts: "2026-06-17 11:05", device: "iPhone 15 · App",      ip: "183.16.x.x", location: "Shanghai, CN", status: "success" },
  { ts: "2026-06-16 23:12", device: "Mac · Chrome 132",    ip: "112.65.x.x", location: "Shanghai, CN", status: "success" },
  { ts: "2026-06-15 15:48", device: "MacBook · Safari 18", ip: "118.42.x.x", location: "Tokyo, JP",    status: "success" },
]

export default function SecurityPage() {
  const [oldPw, setOldPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [twoFA, setTwoFA] = useState(true)
  const [twoFAMethod, setTwoFAMethod] = useState<"app" | "sms">("app")
  const [sessions, setSessions] = useState(INITIAL_SESSIONS)
  const [saved, setSaved] = useState(false)

  const canSavePw = oldPw.length >= 6 && newPw.length >= 8 && newPw === confirmPw

  function savePw() {
    if (!canSavePw) return
    setSaved(true)
    setOldPw("")
    setNewPw("")
    setConfirmPw("")
    window.setTimeout(() => setSaved(false), 1800)
  }

  return (
    <>
      <Topbar title="安全" />
      <SettingsShell title="安全" subtitle="管理密码、两步验证、登录会话与历史。">
        {/* 修改密码 */}
        <SettingsCard
          icon={KeyRound}
          title="修改密码"
          description="新密码至少 8 位，建议包含大小写 + 数字。"
          actions={
            <button
              type="button"
              disabled={!canSavePw}
              onClick={savePw}
              className={cn(
                "h-9 px-3.5 rounded-full text-[12.5px] font-extrabold cursor-pointer transition-opacity",
                canSavePw
                  ? "bg-[#18181b] text-white hover:opacity-90"
                  : "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
              )}
            >
              {saved ? "已更新" : "保存新密码"}
            </button>
          }
        >
          <div className="grid grid-cols-3 gap-3">
            <PasswordField label="原密码"   value={oldPw} onChange={setOldPw} />
            <PasswordField label="新密码"   value={newPw} onChange={setNewPw} />
            <PasswordField label="确认新密码" value={confirmPw} onChange={setConfirmPw} error={confirmPw.length > 0 && confirmPw !== newPw ? "两次输入不一致" : undefined} />
          </div>
        </SettingsCard>

        {/* 2FA */}
        <SettingsCard
          icon={ShieldCheck}
          title="两步验证"
          description="开启后，每次新设备登录都需要验证码。"
          actions={<Toggle checked={twoFA} onChange={setTwoFA} ariaLabel="两步验证" />}
        >
          {twoFA && (
            <div className="grid grid-cols-2 gap-3">
              {(["app", "sms"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTwoFAMethod(m)}
                  className={cn(
                    "rounded-xl border p-3 text-left cursor-pointer transition-colors",
                    twoFAMethod === m ? "border-[var(--text)] bg-white" : "border-[var(--line)] bg-[var(--soft-2)] hover:border-[var(--line-strong)]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {m === "app" ? <ShieldQuestion size={14} /> : <Smartphone size={14} />}
                    <p className="text-[12.5px] font-extrabold text-[var(--text)]">
                      {m === "app" ? "Authenticator App" : "SMS 验证码"}
                    </p>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                    {m === "app" ? "用 Google / Microsoft / 1Password Authenticator 生成动态码（推荐）" : "通过短信接收 6 位动态码到 +86 138****8000"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </SettingsCard>

        {/* 活跃会话 */}
        <SettingsCard icon={Activity} title="活跃会话" description="当前正在使用此账号的设备。">
          <ul className="divide-y divide-[var(--line)]">
            {sessions.map((s) => (
              <li key={s.id} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                <span className="w-9 h-9 rounded-lg bg-[var(--soft)] text-[var(--text)] flex items-center justify-center shrink-0">
                  <s.icon size={14} strokeWidth={2.4} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-extrabold text-[var(--text)] flex items-center gap-1.5">
                    {s.device}
                    {s.current && <span className="inline-flex h-4 px-1.5 rounded-md bg-[#dcfce7] text-[#15803d] text-[9.5px] font-extrabold items-center">当前设备</span>}
                  </p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">{s.location} · {s.lastActive}</p>
                </div>
                {!s.current && (
                  <button
                    type="button"
                    onClick={() => setSessions((prev) => prev.filter((x) => x.id !== s.id))}
                    className="h-8 px-3 rounded-full text-[11.5px] font-bold text-[#dc2626] border border-[#fecaca] hover:bg-[#fef2f2] cursor-pointer flex items-center gap-1"
                  >
                    <LogOut size={11} strokeWidth={2.4} />
                    注销
                  </button>
                )}
              </li>
            ))}
          </ul>
        </SettingsCard>

        {/* 登录历史 */}
        <SettingsCard icon={ScrollText} title="登录历史" description="最近 8 次登录。" noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[11px] font-extrabold uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5">时间</th>
                  <th className="text-left px-5 py-2.5">设备</th>
                  <th className="text-left px-5 py-2.5">IP</th>
                  <th className="text-left px-5 py-2.5">位置</th>
                  <th className="text-center px-5 py-2.5">状态</th>
                </tr>
              </thead>
              <tbody>
                {HISTORY.map((e, i) => (
                  <tr key={i} className={i > 0 ? "border-t border-[var(--line)]" : ""}>
                    <td className="px-5 py-2.5 text-[var(--muted)] font-mono">{e.ts}</td>
                    <td className="px-5 py-2.5 text-[var(--text)] font-bold">{e.device}</td>
                    <td className="px-5 py-2.5 text-[var(--muted)] font-mono">{e.ip}</td>
                    <td className="px-5 py-2.5 text-[var(--muted)]">{e.location}</td>
                    <td className="px-5 py-2.5 text-center">
                      <span className={cn(
                        "inline-flex items-center h-5 px-1.5 rounded-md text-[10.5px] font-extrabold",
                        e.status === "success" ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"
                      )}>
                        {e.status === "success" ? "成功" : "失败"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </SettingsShell>
    </>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  return (
    <div>
      <p className="text-[11.5px] font-bold text-[var(--text)] mb-1">{label}</p>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full h-9 px-2.5 rounded-lg border bg-white text-[12.5px] outline-none transition-colors",
          error ? "border-[#dc2626] focus:border-[#dc2626]" : "border-[var(--line)] focus:border-[var(--text)]"
        )}
      />
      {error && <p className="text-[10.5px] text-[#dc2626] mt-1 font-bold">{error}</p>}
    </div>
  )
}
