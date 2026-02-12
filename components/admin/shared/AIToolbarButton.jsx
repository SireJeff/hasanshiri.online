'use client'

/**
 * Base AI Toolbar Button Component
 * Reusable button for TipTap toolbar AI actions
 */
export function AIToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  className = '',
  title = '',
}) {
  const BaseClassName = 'p-1.5 rounded hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${BaseClassName} ${className}`}
      title={title}
    >
      <Icon className="w-4 h-4" />
      <span className="ml-1.5 text-xs">{label}</span>
    </button>
  )
}
