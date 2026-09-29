export type SectionColor = 'red' | 'green' | 'blue' | 'brown' | 'dark'

export const SECTION_BG: Record<SectionColor, string> = {
  red: 'bg-[#d42a1c]',
  green: 'bg-[#1f4a34]',
  blue: 'bg-[#1b3d8f]',
  brown: 'bg-[#8c3b12]',
  dark: 'bg-neutral-900',
}

interface SectionBarProps {
  title: string
  color: SectionColor
  children?: React.ReactNode
}

export function SectionBar({ title, color, children }: SectionBarProps) {
  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 text-white ${SECTION_BG[color]}`}>
      <h2 className="font-display text-lg font-semibold uppercase leading-tight tracking-wide md:text-xl">{title}</h2>
      {children}
    </div>
  )
}
