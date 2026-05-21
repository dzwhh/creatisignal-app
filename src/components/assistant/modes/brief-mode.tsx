"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { SendButton } from "../send-button"

export function BriefMode() {
  const [text, setText] = useState("")

  return (
    <>
      <textarea
        className="w-full min-h-[44px] border-0 outline-none resize-none text-[#24272f] text-[15px] leading-[1.5] bg-transparent placeholder:text-[var(--muted-2)]"
        placeholder="填写 Brief 目标、人群、卖点、投放场景或参考方向"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="创意 Brief"
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
        </div>
        <SendButton disabled={!text.trim()} />
      </div>
    </>
  )
}
