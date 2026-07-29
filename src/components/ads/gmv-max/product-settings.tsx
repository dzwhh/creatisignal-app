"use client"

import { Check, Info, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockProducts, mockShops } from "@/lib/ads/gmv-max-mock"
import { ChoiceCard, FieldError, SectionCard, type SectionProps } from "./section-card"

// ─── 商品设置：关联店铺 / 商品范围 ───────────────────────────────────────────

export function ProductSettings({ config, update, errors }: SectionProps) {
  const toggleProduct = (id: string) => {
    update(
      "productIds",
      config.productIds.includes(id)
        ? config.productIds.filter((p) => p !== id)
        : [...config.productIds, id]
    )
  }

  return (
    <SectionCard id="section-product" icon={ShoppingBag} title="商品设置" desc="选择推广的店铺和商品范围">
      <div>
        <Label required htmlFor="gmv-shop">关联店铺</Label>
        <div className="mt-2">
          <Select value={config.shopId} onValueChange={(v) => update("shopId", v)}>
            <SelectTrigger id="gmv-shop" aria-invalid={!!errors.shopId}>
              <SelectValue placeholder="请选择 TikTok Shop 店铺" />
            </SelectTrigger>
            <SelectContent>
              {mockShops.map((shop) => (
                <SelectItem key={shop.id} value={shop.id}>
                  {shop.name}（{shop.region}）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <FieldError message={errors.shopId} />
      </div>

      <div>
        <Label>商品范围</Label>
        <div className="mt-2 grid grid-cols-1 @xl:grid-cols-2 gap-3">
          <ChoiceCard
            title="全部商品"
            desc="推广店铺内全部在售商品，系统自动分配流量"
            selected={config.productScope === "all"}
            onClick={() => update("productScope", "all")}
          />
          <ChoiceCard
            title="指定商品"
            desc="手动挑选参与 GMV Max 投放的商品"
            selected={config.productScope === "specific"}
            onClick={() => update("productScope", "specific")}
          />
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs text-[var(--muted-2)]">
          <Info size={13} strokeWidth={2} className="mt-[1px] shrink-0" />
          <span>
            没有合适的商品？请前往{" "}
            <a
              href="https://seller.tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--text)] underline underline-offset-2 hover:text-[var(--near-black)]"
            >
              Seller 后台
            </a>{" "}
            添加商品后再来选择。（通过视频自动上传商品功能正在开发中...）
          </span>
        </p>
      </div>

      {config.productScope === "specific" && (
        <div>
          <div className="flex items-center justify-between">
            <Label>选择商品</Label>
            <span className="text-xs text-[var(--muted-2)]">已选 {config.productIds.length} 个</span>
          </div>
          <div className="mt-2 grid grid-cols-1 @2xl:grid-cols-2 gap-2">
            {mockProducts.map((prod) => {
              const selected = config.productIds.includes(prod.id)
              return (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => toggleProduct(prod.id)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 cursor-pointer",
                    selected
                      ? "border-[var(--lime)] bg-[var(--lime-soft)]/40 ring-1 ring-[var(--lime)]"
                      : "border-[var(--line)] hover:border-[var(--line-strong)]"
                  )}
                >
                  <span
                    className={cn(
                      "w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors duration-200",
                      selected ? "bg-[var(--near-black)] border-[var(--near-black)]" : "border-[var(--line-strong)]"
                    )}
                  >
                    {selected && <Check size={11} strokeWidth={3} className="text-[var(--lime)]" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] text-[var(--text)] truncate">{prod.name}</span>
                    <span className="block text-xs text-[var(--muted-2)]">
                      {prod.price} · 已售 {prod.sales}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          <FieldError message={errors.productIds} />
        </div>
      )}
    </SectionCard>
  )
}
