"use client"

import { useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import {
  AlertTriangle,
  Building2,
  Camera,
  CheckCircle2,
  Download,
  Link2,
  ShieldOff,
  Trash2,
  UserCircle,
  X,
} from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { SettingsShell } from "@/components/settings/settings-shell"
import { SettingsCard } from "@/components/settings/settings-card"
import { SettingsRow } from "@/components/settings/settings-row"
import { RainbowButton } from "@/components/ui/rainbow-button"
import { cn } from "@/lib/utils"

const TIMEZONES = ["Asia/Shanghai", "Asia/Tokyo", "Asia/Singapore", "Europe/London", "America/New_York", "America/Los_Angeles"]

type ConnectedAccount = {
  id: "google" | "apple" | "github"
  label: string
  initial: string
  bg: string
  account?: string
}

const LINKED_INIT: ConnectedAccount[] = [
  { id: "google", label: "Google", initial: "G", bg: "#ea4335", account: "alex.deng@gmail.com" },
  { id: "apple",  label: "Apple",  initial: "Ap", bg: "#0f172a" },
  { id: "github", label: "GitHub", initial: "GH", bg: "#0f172a", account: "@alexd" },
]

export default function AccountPage() {
  const [name, setName] = useState("Alex Deng")
  const [email, setEmail] = useState("alex.deng@creatisignal.com")
  const [phone, setPhone] = useState("+86 138 0013 8000")
  const [tz, setTz] = useState("Asia/Shanghai")
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(LINKED_INIT)
  const [saved, setSaved] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function save() {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  return (
    <>
      <Topbar title="账户" />
      <SettingsShell title="账户" subtitle="管理你的个人资料、组织信息与关联账号。">
        {/* 个人资料 */}
        <SettingsCard
          icon={UserCircle}
          title="个人资料"
          description="对外显示的基础信息，邮箱用于登录和接收通知。"
          actions={
            <button
              type="button"
              onClick={save}
              className="h-9 px-3.5 rounded-full bg-[#18181b] text-white text-[12.5px] font-extrabold cursor-pointer hover:opacity-90 flex items-center gap-1.5"
            >
              {saved && <CheckCircle2 size={12} strokeWidth={2.6} />}
              {saved ? "已保存" : "保存"}
            </button>
          }
        >
          <div className="flex gap-5">
            <div className="shrink-0">
              <div className="relative w-20 h-20 rounded-2xl bg-[var(--lime-soft)] flex items-center justify-center text-[28px] font-extrabold text-[#3a4b1f] overflow-hidden">
                AD
                <button
                  type="button"
                  aria-label="更换头像"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#18181b] text-white flex items-center justify-center cursor-pointer hover:opacity-90"
                >
                  <Camera size={12} strokeWidth={2.4} />
                </button>
              </div>
              <p className="text-[10.5px] text-[var(--muted-2)] mt-2 text-center">PNG / JPG · 最大 2MB</p>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Field label="用户名" value={name} onChange={setName} />
              <Field label="邮箱"   value={email} onChange={setEmail} type="email" />
              <Field label="手机号" value={phone} onChange={setPhone} />
              <div>
                <p className="text-[11.5px] font-bold text-[var(--text)] mb-1">时区</p>
                <select
                  value={tz}
                  onChange={(e) => setTz(e.target.value)}
                  className="w-full h-9 px-2.5 rounded-lg border border-[var(--line)] bg-white text-[12.5px] outline-none focus:border-[var(--text)] cursor-pointer"
                >
                  {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>
        </SettingsCard>

        {/* 组织信息 */}
        <SettingsCard
          icon={Building2}
          title="组织信息"
          description="工作区共享给团队成员的素材、报告与额度。"
          actions={
            <RainbowButton type="button" className="h-9 px-3.5 rounded-full text-[12px]">
              升级到 Team
            </RainbowButton>
          }
        >
          <div className="grid grid-cols-3 gap-3">
            <Stat label="工作区"   value="TikTok Shop · Hotligh" />
            <Stat label="当前套餐" value={<span className="inline-flex items-center gap-1"><span className="text-[#1d4ed8]">Pro Monthly</span></span>} />
            <Stat label="成员数"   value="3 / 5" />
          </div>
        </SettingsCard>

        {/* 关联账号 */}
        <SettingsCard
          icon={Link2}
          title="关联账号"
          description="可用任一关联账号快速登录。"
        >
          <div className="divide-y divide-[var(--line)]">
            {accounts.map((a) => {
              const linked = Boolean(a.account)
              return (
                <SettingsRow
                  key={a.id}
                  label={a.label}
                  description={linked ? a.account : "尚未关联"}
                  divider={false}
                >
                  <span
                    className={cn(
                      "inline-flex items-center h-5 px-2 rounded-md text-[10.5px] font-extrabold",
                      linked ? "bg-[#dcfce7] text-[#15803d]" : "bg-[var(--soft)] text-[var(--muted)]"
                    )}
                  >
                    {linked ? "已关联" : "未关联"}
                  </span>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-extrabold" style={{ backgroundColor: a.bg }}>
                    {a.initial}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setAccounts((prev) =>
                        prev.map((x) => (x.id === a.id ? { ...x, account: linked ? undefined : (a.id === "apple" ? "alex@icloud.com" : a.id === "github" ? "@alexd" : "alex@gmail.com") } : x))
                      )
                    }
                    className={cn(
                      "h-8 px-3 rounded-full text-[11.5px] font-bold cursor-pointer transition-colors",
                      linked
                        ? "border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)]"
                        : "bg-[#18181b] text-white hover:opacity-90"
                    )}
                  >
                    {linked ? "断开" : "连接"}
                  </button>
                </SettingsRow>
              )
            })}
          </div>
        </SettingsCard>

        {/* 危险操作 */}
        <SettingsCard icon={AlertTriangle} title="危险操作" description="以下操作不可恢复，请谨慎执行。">
          <SettingsRow
            label="导出我的数据"
            description="生成 ZIP 包含所有任务、生成结果与设置。"
            divider={false}
          >
            <button
              type="button"
              className="h-8 px-3 rounded-full border border-[var(--line)] text-[11.5px] font-bold text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer flex items-center gap-1"
            >
              <Download size={11} strokeWidth={2.4} />
              生成导出
            </button>
          </SettingsRow>
          <SettingsRow label="删除账户" description="永久注销并清空所有数据。">
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="h-8 px-3 rounded-full text-[11.5px] font-bold text-[#dc2626] border border-[#fecaca] hover:bg-[#fef2f2] cursor-pointer flex items-center gap-1"
            >
              <Trash2 size={11} strokeWidth={2.4} />
              删除账户
            </button>
          </SettingsRow>
        </SettingsCard>
      </SettingsShell>

      <DeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  )
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <p className="text-[11.5px] font-bold text-[var(--text)] mb-1">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-2.5 rounded-lg border border-[var(--line)] bg-white text-[12.5px] outline-none focus:border-[var(--text)]"
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--soft-2)] p-3">
      <p className="text-[10.5px] font-bold text-[var(--muted)] uppercase tracking-wide">{label}</p>
      <p className="text-[13px] font-extrabold text-[var(--text)] mt-1">{value}</p>
    </div>
  )
}

function DeleteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [confirm, setConfirm] = useState("")
  const ok = confirm.trim() === "DELETE"
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[440px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Dialog.Title className="text-[15px] font-extrabold text-[var(--text)] flex items-center gap-2">
                <ShieldOff size={14} className="text-[#dc2626]" />
                删除账户
              </Dialog.Title>
              <Dialog.Description className="text-[12px] text-[var(--muted)] mt-1 leading-relaxed">
                此操作不可恢复，所有任务、生成结果与积分将被永久清除。
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={14} />
            </Dialog.Close>
          </div>
          <p className="text-[11.5px] text-[var(--muted)] mb-2">输入 <code className="px-1.5 py-0.5 rounded bg-[var(--soft)] font-mono text-[var(--text)]">DELETE</code> 以确认：</p>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            className="w-full h-9 px-2.5 rounded-lg border border-[var(--line)] bg-white text-[12.5px] outline-none focus:border-[#dc2626] font-mono"
          />
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 px-3.5 rounded-full text-[12.5px] font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--soft-2)] cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              disabled={!ok}
              onClick={() => onOpenChange(false)}
              className={cn(
                "h-9 px-4 rounded-full text-[12.5px] font-extrabold transition-opacity",
                ok ? "bg-[#dc2626] text-white hover:opacity-90 cursor-pointer" : "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
              )}
            >
              永久删除
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
