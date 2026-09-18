interface SkillTagProps {
  label: string
  tone?: 'green' | 'amber' | 'accent'
  onRemove?: () => void
}

const toneStyles = {
  green: 'bg-green-tint border-green-tint-border text-green',
  amber: 'bg-amber-tint border-amber-tint-border text-amber',
  accent: 'bg-accent-tint border-accent-tint-border text-accent-hover',
}

export default function SkillTag({ label, tone = 'accent', onRemove }: SkillTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium ${toneStyles[tone]}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-current opacity-70 hover:opacity-100"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
