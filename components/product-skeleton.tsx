export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left flex flex-col animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-36 w-full bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-4 flex flex-col flex-1">
        {/* Product name skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-1"></div>
        
        {/* Price and button skeleton */}
        <div className="flex items-center justify-between mt-auto">
          <div className="h-5 bg-gray-200 rounded w-16"></div>
          <div className="w-9 h-9 bg-gray-200 rounded-full ml-2"></div>
        </div>
      </div>
    </div>
  );
} 