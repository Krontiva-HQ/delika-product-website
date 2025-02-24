import { SearchX, Store } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: 'search' | 'store'
}

export function EmptyState({ title, description, icon = 'search' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon === 'search' ? (
          <SearchX className="w-6 h-6 text-gray-500" />
        ) : (
          <Store className="w-6 h-6 text-gray-500" />
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
    </div>
  )
} 