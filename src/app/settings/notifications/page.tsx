"use client"

import { useState } from "react"
import { AlarmClock, Bell, Mail, MessageCircle, Smartphone } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { Toggle } from "@/components/settings/toggle"
import { cn } from "@/lib/utils"

type ChannelKey = "email" | "push" | "inapp"
type CategoryKey = "task_done" | "video_done" | "brief_ready" | "billing" | "security" | "marketing"

const CHANNELS: { key: ChannelKey; label: string; icon: typeof Mail }[] = [
  { key: "email", label: "邮件",   icon: Mail },
  { key: "push",  label: "推送",   icon: Smartphone },
  { key: "inapp", label: "站内",   icon: MessageCircle },
]

const CATEGORIES: { key: CategoryKey; label: string; description: string }[] = [
  { key: "task_done",   label: "AI 任务完成",   description: "报告 / 分析 / Brief 等普通任务结束时通知" },
  { key: "video_done",  label: "视频生成完成", description: "30s 视频生成结束时立即通知（推荐保留推送）" },
  { key: "brief_ready", label: "Brief 准备好", description: "Brief 撰写完成可投放时通知" },
  { key: "billing",     label: "账单变动",     description: "扣费成功 / 失败 / 套餐变更" },
  { key: "security",    label: "安全警告",     description: "异地登录 / 密码变更 / 异常活动（建议全开）" },
  { key: "marketing",   label: "营销活动",     description: "新功能 / 优惠 / 邀请活动信息" },
]

type Matrix = Record<CategoryKey, Record<ChannelKey, boolean>>

const INITIAL_MATRIX: Matrix = {
  task_done:   { email: true,  push: true,  inapp: true  },
  video_done:  { email: false, push: true,  inapp: true  },
  brief_ready: { email: true,  push: false, inapp: true  },
  billing:     { email: true,  push: true,  inapp: true  },
  security:    { email: true,  push: true,  inapp: true  },
  marketing:   { email: false, push: false, inapp: true  },
}

const DIGEST_OPTIONS = [
  { id: "off",     label: "关",       desc: "不发摘要" },
  { id: "instant", label: "实时",     desc: "每次更新都发" },
  { id: "daily",   label: "每日 09:00", desc: "每天上午一次摘要" },
  { id: "weekly",  label: "每周一",   desc: "周一上午发送过去 7 天摘要" },
]

export default function NotificationsPage() {
  const [matrix, setMatrix] = useState<Matrix>(INITIAL_MATRIX)
  const [digest, setDigest] = useState("daily")
  const [quietOn, setQuietOn] = useState(true)
  const [quietStart, setQuietStart] = useState("22:00")
  const [quietEnd, setQuietEnd] = useState("08:00")

  function toggle(cat: CategoryKey, ch: ChannelKey) {
    setMatrix((prev) => ({ ...prev, [cat]: { ...prev[cat], [ch]: !prev[cat][ch] } }))
  }

  return (
    <>
      <Topbar title="通知" />
      <SettingsShell title="通知" subtitle="选择每类事件想通过哪个渠道收到提醒。安全类建议全开。">
        {/* 任务通知矩阵 */}
        <SettingsCard icon={Bell} title="任务通知偏好" description="每行 3 个渠道开关分别独立。" noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-[var(--line)] text-[var(--muted)] text-[11px] font-extrabold uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5">事件</th>
                  {CHANNELS.map((c) => (
                    <th key={c.key} className="text-center px-5 py-2.5">
                      <span className="inline-flex items-center gap-1.5 justify-center">
                        <c.icon size={11} strokeWidth={2.4} />
                        {c.label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map((cat, i) => (
                  <tr key={cat.key} className={i > 0 ? "border-t border-[var(--line)]" : ""}>
                    <td className="px-5 py-3">
                      <p className="text-[12.5px] font-extrabold text-[var(--text)]">{cat.label}</p>
                      <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-relaxed">{cat.description}</p>
                    </td>
                    {CHANNELS.map((c) => (
                      <td key={c.key} className="text-center px-5 py-3">
                        <div className="inline-flex">
                          <Toggle
                            checked={matrix[cat.key][c.key]}
                            onChange={() => toggle(cat.key, c.key)}
                            ariaLabel={`${cat.label}-${c.label}`}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>

        {/* 摘要邮件 */}
        <SettingsCard icon={Mail} title="摘要邮件" description="把多条更新打包成一封邮件，避免打扰。">
          <ul className="space-y-1.5">
            {DIGEST_OPTIONS.map((o) => {
              const active = digest === o.id
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => setDigest(o.id)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors text-left",
                      active ? "border-[var(--text)] bg-white" : "border-[var(--line)] bg-[var(--soft-2)] hover:border-[var(--line-strong)]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-4 h-4 rounded-full border-2 shrink-0",
                        active ? "border-[var(--text)] bg-[var(--text)] shadow-[inset_0_0_0_2px_#fff]" : "border-[var(--line-strong)]"
                      )} />
                      <div>
                        <p className="text-[12.5px] font-extrabold text-[var(--text)]">{o.label}</p>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">{o.desc}</p>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </SettingsCard>

        {/* 静音时段 */}
        <SettingsCard
          icon={AlarmClock}
          title="静音时段"
          description="非紧急通知会暂存到时段结束后批量发送。"
          actions={<Toggle checked={quietOn} onChange={setQuietOn} ariaLabel="静音时段" />}
        >
          {quietOn && (
            <div className="grid grid-cols-2 gap-3">
              <TimeField label="开始" value={quietStart} onChange={setQuietStart} />
              <TimeField label="结束" value={quietEnd} onChange={setQuietEnd} />
            </div>
          )}
        </SettingsCard>
      </SettingsShell>
    </>
  )
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="text-[11.5px] font-bold text-[var(--text)] mb-1">{label}</p>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-2.5 rounded-lg border border-[var(--line)] bg-white text-[12.5px] outline-none focus:border-[var(--text)] tabular-nums font-bold"
      />
    </div>
  )
}
