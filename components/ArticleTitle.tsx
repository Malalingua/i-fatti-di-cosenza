// Newspaper-style title: the lead-in up to the first comma is set in red.
export function splitTitle(title: string): [string, string] {
  const comma = title.indexOf(',')
  if (comma === -1 || comma > 60) return ['', title]
  return [title.slice(0, comma + 1), title.slice(comma + 1)]
}

export function ArticleTitle({ title, className = '' }: { title: string; className?: string }) {
  const [lead, rest] = splitTitle(title)
  return (
    <h3 className={`font-display font-bold leading-tight text-black ${className}`}>
      {lead && <span className="text-[#d42a1c]">{lead}</span>}
      {rest}
    </h3>
  )
}
