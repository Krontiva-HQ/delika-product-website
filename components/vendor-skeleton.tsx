export function VendorSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
      {/* Image skeleton */}
      <div className="relative h-36 bg-gray-200"></div>
      
      {/* Content skeleton */}
      <div className="p-4 space-y-2">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded"></div>
        
        {/* Location skeleton */}
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        
        {/* Rating skeleton */}
        <div className="flex items-center gap-1 mt-2">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
        </div>
        
        {/* Delivery time skeleton */}
        <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
      </div>
    </div>
  );
} 