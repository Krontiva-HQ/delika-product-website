import { ProductSkeleton } from "@/components/product-skeleton";
import { CategorySkeleton } from "@/components/category-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="container mx-auto px-4 py-6">
        {/* Banner skeleton */}
        <div className="mb-8">
          <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden shadow-lg bg-gray-200 animate-pulse"></div>
          <div className="text-center py-4">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Categories skeleton */}
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <CategorySkeleton key={index} />
            ))}
          </div>
        </div>

        {/* Menu grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
} 