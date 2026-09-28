interface SectionDividerProps {
  title: string
  subtitle?: string
}

export function SectionDivider({ title, subtitle }: SectionDividerProps) {
  return (
    <div className="mt-12 mb-6 py-4 border-y-2 border-neutral-900">
      <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-600 mt-1">{subtitle}</p>}
    </div>
  )
}
