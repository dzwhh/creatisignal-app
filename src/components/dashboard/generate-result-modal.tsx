"use client"

import { useState, useEffect } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { ChevronUp, ChevronDown, X } from "lucide-react"

export interface GenerateResult {
  title: string
  desc: string
  date: string
  thumbnail: string
  videoSrc: string
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  results: GenerateResult[]
  initialIndex?: number
}

export function GenerateResultModal({ open, onOpenChange, results, initialIndex = 0 }: Props) {
  const [idx, setIdx] = useState(initialIndex)

  useEffect(() => {
    if (open) setIdx(initialIndex)
  }, [open, initialIndex])

  const result = results[idx]
  if (!result) return null

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[680px] bg-white rounded-2xl shadow-xl outline-none overflow-visible data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          {/* Navigation arrows outside left border */}
          <div className="absolute left-[-52px] top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button
              onClick={() => setIdx(i => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="w-9 h-9 rounded-full bg-white border border-[var(--line)] shadow-sm flex items-center justify-center disabled:opacity-30 hover:bg-[var(--soft)] transition-colors cursor-pointer"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => setIdx(i => Math.min(results.length - 1, i + 1))}
              disabled={idx === results.length - 1}
              className="w-9 h-9 rounded-full bg-white border border-[var(--line)] shadow-sm flex items-center justify-center disabled:opacity-30 hover:bg-[var(--soft)] transition-colors cursor-pointer"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-extrabold text-[#17181c]">{result.title}</h2>
                <p className="text-[12px] text-[var(--muted)] mt-0.5">{result.desc}</p>
              </div>
              <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--soft)] transition-colors cursor-pointer">
                <X size={15} />
              </Dialog.Close>
            </div>

            <div className="rounded-xl overflow-hidden bg-[#0a0a0a] aspect-video">
              <video
                key={result.videoSrc}
                src={result.videoSrc}
                poster={result.thumbnail}
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--muted-2)]">
              <span className="flex items-center gap-1.5">
                <i className="inline-block w-[7px] h-[7px] rounded-full bg-[#5cc981]" />
                已完成
              </span>
              <span>{result.date}</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
