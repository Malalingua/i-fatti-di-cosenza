interface CategoryBadgeProps {
  name: string
  accentColor: string
}

export function CategoryBadge({ name, accentColor }: CategoryBadgeProps) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: accentColor }}
    >
      {name}
    </span>
  )
}
