"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, Image } from "lucide-react"
import { SendButton } from "../send-button"
import { ImageSelectModal } from "@/components/modals/image-select-modal"

interface AnalysisModeProps {
  initialPrompt?: string
  onSubmit?: () => void
  submitting?: boolean
}

export function AnalysisMode({ initialPrompt, onSubmit, submitting }: AnalysisModeProps = {}) {
  const [text, setText] = useState("")
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!initialPrompt) return
    setText(initialPrompt)
    window.setTimeout(() => {
      const el = textareaRef.current
      if (!el) return
      el.focus()
      el.selectionStart = el.selectionEnd = el.value.length
    }, 0)
  }, [initialPrompt])

  function handleSend() {
    if (!text.trim()) return
    onSubmit?.()
  }

  return (
    <>
      <textarea
        ref={textareaRef}
        className="w-full min-h-[44px] border-0 outline-none resize-none text-[#24272f] text-[15px] leading-[1.5] bg-transparent placeholder:text-[var(--muted-2)]"
        placeholder="描述要分析的素材、投放目标或问题"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="创意分析任务"
        maxLength={2000}
        rows={3}
      />
      <div className="flex items-center justify-between gap-[14px] mt-auto">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="w-[34px] h-[34px] rounded-full border border-[var(--line)] bg-white text-[#52525b] flex items-center justify-center cursor-pointer"
            aria-label="上传文件"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className="h-[34px] border border-transparent rounded-full bg-white text-[#18181b] px-[9px] flex items-center gap-1.5 text-[13px] font-[650] cursor-pointer hover:bg-[var(--soft)]"
          >
            <Image size={15} strokeWidth={2} />
            <span>选择素材</span>
          </button>
        </div>
        <SendButton disabled={!text.trim()} loading={submitting} onClick={handleSend} />
      </div>
      <ImageSelectModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
      />
    </>
  )
}
