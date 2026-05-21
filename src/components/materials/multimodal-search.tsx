"use client"

import { useState, useRef } from "react"
import {
  Search,
  Image as ImageIcon,
  Video,
  X,
  ArrowRight,
  Upload,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SearchMode = "text" | "image" | "video"

const modes: { id: SearchMode; icon: typeof Search; label: string; placeholder: string }[] = [
  {
    id: "text",
    icon: Search,
    label: "关键词",
    placeholder: "描述你想找的素材风格、卖点、场景或品类...",
  },
  {
    id: "image",
    icon: ImageIcon,
    label: "以图搜图/视频",
    placeholder: "上传参考图，找相似构图、风格或卖点的广告素材",
  },
  {
    id: "video",
    icon: Video,
    label: "以视频搜视频",
    placeholder: "上传参考视频，找相似节奏、结构或创意手法的素材",
  },
]

export function MultimodalSearch() {
  const [mode, setMode] = useState<SearchMode>("text")
  const [query, setQuery] = useState("")
  const [uploadedFile, setUploadedFile] = useState<{ name: string; preview?: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const activeMode = modes.find((m) => m.id === mode)!
  const canSearch = mode === "text" ? query.trim().length > 0 : uploadedFile !== null

  function handleFile(file: File) {
    const isImage = file.type.startsWith("image/")
    const preview = isImage ? URL.createObjectURL(file) : undefined
    setUploadedFile({ name: file.name, preview })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="w-full max-w-[800px] mx-auto mb-8">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 mb-3">
        {modes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setMode(id); setUploadedFile(null); setQuery("") }}
            className={cn(
              "h-8 rounded-lg px-3 flex items-center gap-1.5 text-[13px] font-semibold cursor-pointer transition-colors",
              mode === id
                ? "bg-[var(--near-black)] text-white"
                : "bg-transparent text-[var(--muted)] hover:bg-[var(--soft)] hover:text-[var(--text)]"
            )}
          >
            <Icon size={13} strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {/* Search box */}
      <div
        className={cn(
          "relative border rounded-2xl bg-white transition-colors",
          isDragging
            ? "border-[var(--lime)] shadow-[0_0_0_3px_rgba(201,255,41,0.2)]"
            : "border-[var(--line)] shadow-[0_1px_2px_rgba(9,9,11,0.04),0_8px_20px_rgba(9,9,11,0.05)]"
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Text mode */}
        {mode === "text" && (
          <div className="flex items-center gap-3 px-5 py-4">
            <Search size={18} strokeWidth={2} className="text-[var(--muted-2)] shrink-0" />
            <input
              className="flex-1 outline-none border-0 bg-transparent text-[15px] text-[#24272f] placeholder:text-[var(--muted-2)]"
              placeholder={activeMode.placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSearch && console.log("search:", query)}
            />
            <button
              type="button"
              disabled={!canSearch}
              className={cn(
                "shrink-0 h-9 px-4 rounded-xl flex items-center gap-1.5 text-[13px] font-bold transition-colors",
                canSearch
                  ? "bg-[var(--near-black)] text-white cursor-pointer"
                  : "bg-[var(--soft)] text-[var(--muted-2)] cursor-not-allowed"
              )}
            >
              搜索 <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Image / Video upload mode */}
        {(mode === "image" || mode === "video") && (
          <div className="p-4">
            {!uploadedFile ? (
              /* Drop zone */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[120px] rounded-xl border-2 border-dashed border-[var(--line)] bg-[var(--soft-2)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--line-strong)] hover:bg-[var(--soft)] transition-colors"
              >
                <Upload size={22} strokeWidth={1.5} className="text-[var(--muted-2)]" />
                <span className="text-[13px] font-semibold text-[var(--muted)]">
                  点击上传或拖拽{mode === "image" ? "图片" : "视频"}至此处
                </span>
                <span className="text-[12px] text-[var(--muted-2)]">
                  {mode === "image" ? "支持 JPG、PNG、WebP" : "支持 MP4、MOV、WebM"}
                </span>
              </button>
            ) : (
              /* Preview + query */
              <div className="flex items-start gap-4">
                {/* File preview */}
                <div className="relative shrink-0 w-[80px] h-[80px] rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--soft)]">
                  {uploadedFile.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={uploadedFile.preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video size={28} strokeWidth={1.5} className="text-[var(--muted-2)]" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[rgba(0,0,0,0.55)] text-white flex items-center justify-center cursor-pointer"
                    aria-label="移除文件"
                  >
                    <X size={11} strokeWidth={3} />
                  </button>
                </div>

                {/* Optional text + search */}
                <div className="flex-1 flex flex-col gap-2">
                  <p className="text-[12px] text-[var(--muted)] truncate">{uploadedFile.name}</p>
                  <input
                    className="w-full outline-none border border-[var(--line)] rounded-lg px-3 py-2 text-[13px] text-[#24272f] placeholder:text-[var(--muted-2)] bg-white"
                    placeholder="可选：补充描述关键词，提升搜索精度"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[12px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer flex items-center gap-1"
                    >
                      <Upload size={12} />
                      换一个文件
                    </button>
                    <button
                      type="button"
                      className="h-9 px-4 rounded-xl bg-[var(--near-black)] text-white flex items-center gap-1.5 text-[13px] font-bold cursor-pointer"
                    >
                      以{mode === "image" ? "图" : "视频"}搜索 <ArrowRight size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept={mode === "image" ? "image/*" : "video/*"}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      {/* Search tips */}
      {mode === "text" && !query && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-[var(--muted-2)]">热门搜索：</span>
          {["开箱测评", "痛点切入", "达人种草", "产品对比", "限时促销"].map((tip) => (
            <button
              key={tip}
              type="button"
              onClick={() => setQuery(tip)}
              className="h-7 rounded-full border border-[var(--line)] bg-white px-3 text-[12px] font-medium text-[var(--muted)] cursor-pointer hover:border-[var(--line-strong)] hover:text-[var(--text)] transition-colors"
            >
              {tip}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
