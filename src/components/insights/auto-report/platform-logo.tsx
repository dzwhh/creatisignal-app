"use client"

import type { PlatformId } from "@/lib/insights/auto-report-data"

export function PlatformLogo({ id, size = 18 }: { id: PlatformId; size?: number }) {
  if (id === "tiktok") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <path d="M14.3 3v11.25a4.65 4.65 0 1 1-4-4.6" stroke="#25F4EE" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M14.3 3c.35 2.7 1.9 4.25 4.7 4.55" stroke="#FE2C55" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M13.3 2v11.25a4.65 4.65 0 1 1-4-4.6M13.3 2c.35 2.7 1.9 4.25 4.7 4.55" stroke="#161823" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  if (id === "meta") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 20" aria-hidden>
        <path d="M3 16.5C4.7 9.2 7.6 3.5 11.2 3.5c4.9 0 7.3 13 11.4 13 2.5 0 4.4-3.7 6.4-10.1" stroke="#1877F2" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  if (id === "google") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
        <path d="M8.2 3.2a3.1 3.1 0 0 1 4.2 1.15l7.05 12.2a3.05 3.05 0 0 1-5.28 3.05L7.1 7.4A3.1 3.1 0 0 1 8.2 3.2Z" fill="#4285F4" />
        <path d="M10.9 7.4 5.35 17a3.05 3.05 0 1 0 5.28 3.05l3.15-5.45-2.88-7.2Z" fill="#34A853" />
        <circle cx="7.98" cy="18.52" r="3.05" fill="#FBBC04" />
      </svg>
    )
  }
  if (id === "amazon") {
    return (
      <svg width={size} height={size} viewBox="0 0 28 22" aria-hidden>
        <path d="M8.2 14.8V9.4c0-3 1.8-4.7 5.2-4.7 3.5 0 5.4 1.7 5.4 4.8v5.3M8.4 10.2h10.2" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M5 17c4.8 3.1 11.6 3.2 17 .2" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" fill="none" />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <circle cx="8" cy="9" r="5" fill="#7c3aed" fillOpacity="0.7" />
      <circle cx="15" cy="14" r="5" fill="#0ea5e9" fillOpacity="0.7" />
    </svg>
  )
}

export function PlatformLogoTile({ id, size = "w-8 h-8" }: { id: PlatformId; size?: string }) {
  return (
    <span className={`${size} border border-[var(--line)] rounded-md bg-white inline-flex items-center justify-center shrink-0`}>
      <PlatformLogo id={id} size={18} />
    </span>
  )
}
