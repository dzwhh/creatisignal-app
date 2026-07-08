"use client"

import { useEffect, useRef, useState } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { X, Link2, ArrowRight, ArrowLeft, Check, Upload, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildAnalyzedProduct } from "@/lib/generate/products"
import type { Product, AnalyzingProduct } from "@/lib/generate/types"

// ─── 解析进度环 ──────────────────────────────────────────────────────────────

function ProgressRing({ progress }: { progress: number }) {
  const R = 16
  const C = 2 * Math.PI * R
  return (
    <div className="relative w-11 h-11">
      <svg viewBox="0 0 40 40" className="w-11 h-11 -rotate-90">
        <circle cx="20" cy="20" r={R} fill="none" stroke="var(--line)" strokeWidth="3" />
        <circle
          cx="20" cy="20" r={R} fill="none" stroke="var(--near-black)" strokeWidth="3"
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress / 100)}
          className="transition-[stroke-dashoffset] duration-200"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[var(--text)]">
        {Math.round(progress)}%
      </span>
    </div>
  )
}

// ─── 商品卡 ──────────────────────────────────────────────────────────────────

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
      className="rounded-[14px] border border-[var(--line)] bg-white p-2.5 text-left cursor-pointer group hover:border-[var(--line-strong)] hover:shadow-[0_10px_24px_rgba(9,9,11,0.08)] transition-all"
    >
      <div className="aspect-square rounded-[10px] overflow-hidden bg-[var(--soft)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.images[0]?.src} alt={product.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
      </div>
      <p className="mt-2 text-[12px] font-bold text-[var(--text)] truncate">{product.title}</p>
      <p className="text-[10.5px] text-[var(--muted-2)] mt-0.5">{product.images.length} 张图片 · {product.source === "link" ? "链接解析" : "手动上传"}</p>
    </motion.button>
  )
}

function AnalyzingCard({ item }: { item: AnalyzingProduct }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-[14px] border border-dashed border-[var(--line-strong)] bg-[var(--soft-2)] p-2.5"
    >
      <div className="aspect-square rounded-[10px] bg-[var(--soft)] flex flex-col items-center justify-center gap-2.5">
        <ProgressRing progress={item.progress} />
        <div className="text-center px-2">
          <p className="text-[11.5px] font-bold text-[var(--text)]">正在解析商品</p>
          <p className="text-[10px] text-[var(--muted)] mt-0.5">通常只需几秒</p>
        </div>
      </div>
      <p className="mt-2 text-[10.5px] text-[var(--muted-2)] truncate">{item.url}</p>
    </motion.div>
  )
}

// ─── 主 Modal：商品库 ⇄ 选图两步 ─────────────────────────────────────────────

export function ProductModal({ open, onOpenChange, products, onAddProduct, onInsert }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  products: Product[]
  onAddProduct: (p: Product) => void
  onInsert: (product: Product, imageIds: string[]) => void
}) {
  const [url, setUrl] = useState("")
  const [analyzing, setAnalyzing] = useState<AnalyzingProduct[]>([])
  const [detail, setDetail] = useState<Product | null>(null)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach((t) => window.clearInterval(t))
  }, [])

  function startAnalysis() {
    const trimmed = url.trim()
    if (!trimmed) return
    const id = `analyzing-${Date.now()}`
    setUrl("")
    setAnalyzing((prev) => [...prev, { id, url: trimmed, progress: 4 }])
    const timer = window.setInterval(() => {
      setAnalyzing((prev) => prev.map((a) => (a.id === id ? { ...a, progress: Math.min(a.progress + 4 + Math.random() * 9, 100) } : a)))
    }, 130)
    timersRef.current.push(timer)
    // 进度到 100 后落库并直接进入选图
    const check = window.setInterval(() => {
      setAnalyzing((prev) => {
        const item = prev.find((a) => a.id === id)
        if (!item || item.progress < 100) return prev
        window.clearInterval(timer)
        window.clearInterval(check)
        const product = buildAnalyzedProduct(item.url)
        onAddProduct(product)
        setDetail(product)
        setPicked(new Set([product.images[0].id]))
        return prev.filter((a) => a.id !== id)
      })
    }, 150)
    timersRef.current.push(check)
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const id = `prod-upload-${Date.now().toString(36)}`
    const product: Product = {
      id,
      title: files[0].name.replace(/\.[^.]+$/, "") || "手动上传商品",
      source: "manual",
      images: Array.from(files).slice(0, 8).map((f, i) => ({ id: `${id}-${i}`, src: URL.createObjectURL(f) })),
    }
    onAddProduct(product)
    setDetail(product)
    setPicked(new Set([product.images[0].id]))
  }

  function togglePick(imageId: string) {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(imageId)) next.delete(imageId)
      else next.add(imageId)
      return next
    })
  }

  function handleInsert() {
    if (!detail || picked.size === 0) return
    onInsert(detail, detail.images.filter((img) => picked.has(img.id)).map((img) => img.id))
    setDetail(null)
    setPicked(new Set())
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[760px] max-w-[calc(100vw-48px)] max-h-[82vh] bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">

          <div className="flex items-center justify-between px-6 pt-5 pb-1">
            <Dialog.Title className="text-[17px] font-bold text-[var(--text)] flex items-center gap-2">
              <Package size={17} strokeWidth={2.2} />
              添加你的商品
            </Dialog.Title>
            <Dialog.Close className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer">
              <X size={18} />
            </Dialog.Close>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {detail === null ? (
              // ── 第一步：链接 / 上传 / 商品库 ──
              <motion.div
                key="library"
                initial={{ opacity: 0, x: -14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.16 }}
                className="flex flex-col min-h-0"
              >
                <p className="px-6 text-[12.5px] text-[var(--muted)]">粘贴商品链接自动解析，或手动上传图片，商品图可在所有生成中复用</p>

                <div className="px-6 pt-4 pb-4 flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-2)]" />
                    <input
                      type="text"
                      className="w-full h-11 pl-10 pr-12 rounded-full border border-[var(--line)] bg-[var(--soft-2)] text-[14px] placeholder:text-[var(--muted-2)] outline-none focus:border-[var(--line-strong)] focus:bg-white transition-colors"
                      placeholder="https://your-shop.com/products/..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") startAnalysis() }}
                    />
                    <button
                      type="button"
                      onClick={startAnalysis}
                      disabled={!url.trim()}
                      aria-label="解析商品链接"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--lime)] text-[#1a2010] flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-95 transition-all"
                    >
                      <ArrowRight size={15} strokeWidth={2.6} />
                    </button>
                  </div>
                  <span className="text-[12px] text-[var(--muted-2)]">或</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-11 px-4.5 rounded-full bg-[var(--near-black)] text-white text-[13px] font-bold flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    <Upload size={14} strokeWidth={2.4} />
                    手动上传
                  </button>
                  <input
                    ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => { handleFiles(e.target.files); e.target.value = "" }}
                  />
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-[280px]">
                  <div className="rounded-[16px] bg-[var(--soft-2)] border border-[var(--line)] p-4">
                    <p className="text-[11px] font-bold text-[var(--muted)] tracking-wide mb-3">我的商品</p>
                    <div className="grid grid-cols-4 gap-3">
                      <AnimatePresence initial={false}>
                        {analyzing.map((a) => <AnalyzingCard key={a.id} item={a} />)}
                        {products.map((p) => (
                          <ProductCard
                            key={p.id} product={p}
                            onClick={() => { setDetail(p); setPicked(new Set([p.images[0].id])) }}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                    {products.length === 0 && analyzing.length === 0 && (
                      <div className="py-12 text-center text-[13px] text-[var(--muted)]">还没有商品，粘贴链接或上传图片开始</div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              // ── 第二步：选图引用 ──
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 14 }}
                transition={{ duration: 0.16 }}
                className="flex flex-col min-h-0"
              >
                <div className="px-6 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetail(null)}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-[var(--soft)] cursor-pointer"
                    aria-label="返回商品库"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <p className="text-[13.5px] font-bold text-[var(--text)] truncate">{detail.title}</p>
                  <span className="text-[11px] text-[var(--muted-2)] shrink-0">选择要引用的图片</span>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pt-4 pb-4 min-h-[280px]">
                  <div className="grid grid-cols-4 gap-3">
                    {detail.images.map((img, i) => {
                      const isPicked = picked.has(img.id)
                      return (
                        <motion.button
                          key={img.id}
                          type="button"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => togglePick(img.id)}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer group",
                            isPicked ? "border-[var(--near-black)]" : "border-transparent hover:border-[var(--line-strong)]"
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.src} alt={`${detail.title} ${i + 1}`} className="w-full h-full object-cover" />
                          <div className={cn(
                            "absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                            isPicked
                              ? "bg-[var(--lime)] border-[var(--lime)] text-[#1a2010]"
                              : "bg-white/80 border-[var(--line-strong)] text-transparent group-hover:border-[var(--muted)]"
                          )}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                          {i === 0 && (
                            <span className="absolute bottom-2 left-2 h-[18px] px-1.5 rounded-md bg-black/55 backdrop-blur-sm text-white text-[9px] font-bold flex items-center leading-none">主图</span>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--line)]">
                  <span className="text-[13px] text-[var(--muted)]">已选 {picked.size} 张 · 将以 [Image #n] 引用进提示词</span>
                  <button
                    type="button"
                    onClick={handleInsert}
                    disabled={picked.size === 0}
                    className="h-9 px-5 rounded-full bg-[var(--near-black)] text-white text-[13px] font-bold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    引用 {picked.size > 0 ? `${picked.size} 张` : ""}图片
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
