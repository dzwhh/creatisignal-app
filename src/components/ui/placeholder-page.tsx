interface PlaceholderPageProps {
  title: string
  desc: string
}

export function PlaceholderPage({ title, desc }: PlaceholderPageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-12 h-12 rounded-xl bg-[var(--soft)] flex items-center justify-center mb-4">
        <span className="text-2xl">🚧</span>
      </div>
      <h2 className="text-[18px] font-extrabold text-[#17181c] mb-2">{title}</h2>
      <p className="text-[14px] text-[var(--muted)] max-w-[320px]">{desc}</p>
      <p className="mt-3 text-[12px] text-[var(--muted-2)]">即将上线</p>
    </div>
  )
}
