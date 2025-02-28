interface FloatingCartProps {
  total: number
  itemCount: number
  onClick: () => void
}

export function FloatingCart({ total, itemCount, onClick }: FloatingCartProps) {
  if (itemCount === 0) return null

  return (
    <div className="fixed bottom-4 inset-x-0 mx-auto px-4 z-50 flex justify-center">
      <button
        onClick={onClick}
        className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-full flex items-center gap-4 shadow-lg max-w-md w-full sm:w-auto"
      >
        <div className="flex items-center gap-2">
          <div className="bg-orange-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm">
            {itemCount}
          </div>
          <span className="font-medium">View Basket</span>
        </div>
        <span className="font-medium sm:border-l border-orange-400 sm:pl-4 pl-2">
          GH₵ {total.toFixed(2)}
        </span>
      </button>
    </div>
  )
} 