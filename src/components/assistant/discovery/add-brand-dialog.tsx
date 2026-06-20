"use client"

import { useEffect, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { ArrowRight, Crosshair, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onAdd: (brand: { name: string; homepage: string; avatar?: string }) => void
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`)
    return Boolean(u.hostname && u.hostname.includes("."))
  } catch {
    return false
  }
}

export function AddBrandDialog({ open, onOpenChange, onAdd }: Props) {
  const [name, setName] = useState("")
  const [homepage, setHomepage] = useState("")
  const [avatar, setAvatar] = useState("")
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName("")
      setHomepage("")
      setAvatar("")
      window.setTimeout(() => nameRef.current?.focus(), 80)
    }
  }, [open])

  const nameTrim = name.trim()
  const homepageTrim = homepage.trim()
  const homepageOk = homepageTrim.length === 0 ? false : isValidUrl(homepageTrim)
  const canSubmit = nameTrim.length > 0 && homepageOk

  function submit() {
    if (!canSubmit) return
    onAdd({
      name: nameTrim,
      homepage: homepageTrim.startsWith("http") ? homepageTrim : `https://${homepageTrim}`,
      avatar: avatar.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[460px] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] p-5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Dialog.Title className="text-[15px] font-extrabold text-[var(--text)] flex items-center gap-2">
                <Crosshair size={14} className="text-[#5a7821]" />
                添加追踪品牌
              </Dialog.Title>
              <Dialog.Description className="text-[12px] text-[var(--muted)] mt-1 leading-relaxed">
                添加竞品品牌，系统每日抓取其正在投放的素材，按 live ads 数排序。
              </Dialog.Description>
            </div>
            <Dialog.Close className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={14} />
            </Dialog.Close>
          </div>

          <div className="space-y-3">
            <Field
              label="品牌名"
              required
              value={name}
              onChange={setName}
              placeholder="例：goop"
              inputRef={nameRef}
              onEnter={submit}
            />
            <Field
              label="主页链接"
              required
              value={homepage}
              onChange={setHomepage}
              placeholder="https://goop.com"
              error={homepageTrim.length > 0 && !homepageOk ? "请输入有效的网址" : undefined}
              onEnter={submit}
            />
            <Field
              label="头像 URL（可选）"
              value={avatar}
              onChange={setAvatar}
              placeholder="https://...png"
              onEnter={submit}
            />
          </div>

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
              disabled={!canSubmit}
              onClick={submit}
              className={cn(
                "h-9 px-4 rounded-full text-[12.5px] font-extrabold flex items-center gap-1.5 transition-opacity",
                canSubmit ? "bg-[#18181b] text-white hover:opacity-90 cursor-pointer" : "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
              )}
            >
              添加到追踪
              <ArrowRight size={12} strokeWidth={2.4} />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Field({
  label,
  required,
  value,
  onChange,
  placeholder,
  error,
  inputRef,
  onEnter,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
  onEnter?: () => void
}) {
  return (
    <div>
      <p className="text-[11.5px] font-bold text-[var(--text)] mb-1">
        {label}
        {required && <span className="text-[#dc2626] ml-0.5">*</span>}
      </p>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onEnter?.() }}
        placeholder={placeholder}
        className={cn(
          "w-full h-9 px-2.5 rounded-lg border bg-white text-[12.5px] outline-none transition-colors",
          error ? "border-[#dc2626] focus:border-[#dc2626]" : "border-[var(--line)] focus:border-[var(--text)]"
        )}
      />
      {error && <p className="text-[10.5px] text-[#dc2626] mt-1 font-bold">{error}</p>}
    </div>
  )
}
