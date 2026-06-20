"use client"

import { useState } from "react"
import { Calendar, Check, Coins, Globe2, Languages, MapPin } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { cn } from "@/lib/utils"

type Locale = { code: string; flag: string; name: string; nativeName: string }

const LOCALES: Locale[] = [
  { code: "zh-CN", flag: "🇨🇳", name: "简体中文",        nativeName: "简体中文" },
  { code: "en-US", flag: "🇺🇸", name: "English (US)",    nativeName: "English" },
  { code: "ja-JP", flag: "🇯🇵", name: "日本語",          nativeName: "日本語" },
  { code: "id-ID", flag: "🇮🇩", name: "Bahasa Indonesia", nativeName: "Bahasa Indonesia" },
]

const TIMEZONES = [
  "Asia/Shanghai", "Asia/Tokyo", "Asia/Seoul", "Asia/Singapore", "Asia/Bangkok",
  "Europe/London", "Europe/Berlin", "Europe/Paris",
  "America/New_York", "America/Los_Angeles", "America/Sao_Paulo",
  "Australia/Sydney",
]

const DATE_FORMATS = [
  { id: "iso",   label: "YYYY-MM-DD",  sample: "2026-06-19" },
  { id: "us",    label: "MM/DD/YYYY",  sample: "06/19/2026" },
  { id: "eu",    label: "DD.MM.YYYY",  sample: "19.06.2026" },
]
const TIME_FORMATS = [
  { id: "24",  label: "24 小时制", sample: "14:30" },
  { id: "12",  label: "12 小时制", sample: "2:30 PM" },
]

const CURRENCIES = [
  { code: "USD", label: "美元 USD", symbol: "$"   },
  { code: "CNY", label: "人民币 CNY", symbol: "¥" },
  { code: "EUR", label: "欧元 EUR", symbol: "€"  },
  { code: "JPY", label: "日元 JPY", symbol: "¥"  },
]

export default function LanguagePage() {
  const [locale, setLocale] = useState("zh-CN")
  const [tz, setTz] = useState("Asia/Shanghai")
  const [dateFmt, setDateFmt] = useState("iso")
  const [timeFmt, setTimeFmt] = useState("24")
  const [currency, setCurrency] = useState("USD")

  return (
    <>
      <Topbar title="语言" />
      <SettingsShell title="语言" subtitle="界面语言、时区、日期 / 时间格式与货币显示。">
        {/* 界面语言 */}
        <SettingsCard icon={Languages} title="界面语言" description="切换后部分文案立即生效，其余文案在下次刷新后应用。">
          <div className="grid grid-cols-2 gap-2">
            {LOCALES.map((l) => {
              const active = locale === l.code
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLocale(l.code)}
                  className={cn(
                    "rounded-xl border p-3 flex items-center gap-3 cursor-pointer text-left transition-colors",
                    active ? "border-[var(--text)] bg-white" : "border-[var(--line)] bg-[var(--soft-2)] hover:border-[var(--line-strong)]"
                  )}
                >
                  <span className="text-[24px] leading-none">{l.flag}</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-extrabold text-[var(--text)]">{l.name}</p>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5 font-mono">{l.code}</p>
                  </div>
                  {active && (
                    <span className="w-5 h-5 rounded-full bg-[var(--text)] text-white flex items-center justify-center">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </SettingsCard>

        {/* 时区 */}
        <SettingsCard icon={Globe2} title="时区" description="影响任务时间戳与定时推送的显示。">
          <select
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-[var(--line)] bg-white text-[12.5px] font-bold outline-none focus:border-[var(--text)] cursor-pointer"
          >
            {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </SettingsCard>

        {/* 日期 / 时间格式 */}
        <SettingsCard icon={Calendar} title="日期 / 时间格式">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <p className="text-[11.5px] font-extrabold text-[var(--muted)] uppercase tracking-wide mb-2">日期格式</p>
              <ul className="space-y-1.5">
                {DATE_FORMATS.map((f) => {
                  const active = dateFmt === f.id
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => setDateFmt(f.id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 flex items-center justify-between cursor-pointer transition-colors text-left",
                          active ? "border-[var(--text)] bg-white" : "border-[var(--line)] bg-[var(--soft-2)] hover:border-[var(--line-strong)]"
                        )}
                      >
                        <span className="text-[12px] font-extrabold text-[var(--text)]">{f.label}</span>
                        <span className="text-[11px] text-[var(--muted)] font-mono">{f.sample}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div>
              <p className="text-[11.5px] font-extrabold text-[var(--muted)] uppercase tracking-wide mb-2">时间格式</p>
              <ul className="space-y-1.5">
                {TIME_FORMATS.map((f) => {
                  const active = timeFmt === f.id
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        onClick={() => setTimeFmt(f.id)}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2 flex items-center justify-between cursor-pointer transition-colors text-left",
                          active ? "border-[var(--text)] bg-white" : "border-[var(--line)] bg-[var(--soft-2)] hover:border-[var(--line-strong)]"
                        )}
                      >
                        <span className="text-[12px] font-extrabold text-[var(--text)]">{f.label}</span>
                        <span className="text-[11px] text-[var(--muted)] font-mono">{f.sample}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </SettingsCard>

        {/* 货币 */}
        <SettingsCard icon={Coins} title="货币显示" description="账单、积分等效价值的展示币种。">
          <div className="grid grid-cols-4 gap-2">
            {CURRENCIES.map((c) => {
              const active = currency === c.code
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={cn(
                    "rounded-lg border p-3 flex flex-col items-center text-center cursor-pointer transition-colors",
                    active ? "border-[var(--text)] bg-white" : "border-[var(--line)] bg-[var(--soft-2)] hover:border-[var(--line-strong)]"
                  )}
                >
                  <span className="text-[20px] font-extrabold text-[var(--text)]">{c.symbol}</span>
                  <p className="text-[11.5px] font-bold text-[var(--muted)] mt-1">{c.label}</p>
                </button>
              )
            })}
          </div>
        </SettingsCard>

        <div className="rounded-xl border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] px-4 py-3 flex items-center gap-3">
          <MapPin size={14} className="text-[var(--muted)] shrink-0" />
          <p className="text-[12px] text-[var(--muted)] leading-relaxed flex-1">
            语言 / 时区设置仅作用于你的账号，团队成员可独立配置自己的偏好。
          </p>
        </div>
      </SettingsShell>
    </>
  )
}
