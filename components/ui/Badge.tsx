import { Category } from '@/lib/types'
import { CATEGORY_STYLES, CATEGORY_ICONS } from '@/lib/utils'

interface BadgeProps {
  category: Category
  showIcon?: boolean
  size?: 'sm' | 'md'
}

export default function Badge({ category, showIcon = true, size = 'md' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1 font-medium rounded-full border'
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'

  return (
    <span className={`${baseClasses} ${sizeClasses} ${CATEGORY_STYLES[category]}`}>
      {showIcon && <span>{CATEGORY_ICONS[category]}</span>}
      {category}
    </span>
  )
}
