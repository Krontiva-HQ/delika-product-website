import { Search, Store, ShoppingBag } from "lucide-react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: "search" | "store" | "shopping-bag"
}

export function EmptyState({ title, description, icon = "search" }: EmptyStateProps) {
  const Icon = icon === "store" 
    ? Store 
    : icon === "shopping-bag"
    ? ShoppingBag
    : Search

  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
        <Icon className="w-6 h-6 text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-gray-500 max-w-sm mx-auto">{description}</p>
    </div>
  )
} 