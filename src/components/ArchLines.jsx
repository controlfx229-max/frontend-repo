/* Concentric arches: the church-window motif used on dark brand surfaces. */
export default function ArchLines({ className = '' }) {
  const arches = [0, 1, 2, 3, 4].map((i) => {
    const w = 500 - i * 84
    const x = (560 - w) / 2
    const r = w / 2
    const top = 40 + i * 52
    return `M${x} 620V${top + r}A${r} ${r} 0 0 1 ${x + w} ${top + r}V620`
  })
  return (
    <svg className={className} viewBox="0 0 560 620" fill="none" aria-hidden="true">
      {arches.map((d, i) => (
        <path key={i} d={d} stroke="#C9973F" strokeOpacity={0.34 - i * 0.055} strokeWidth="1" />
      ))}
    </svg>
  )
}
