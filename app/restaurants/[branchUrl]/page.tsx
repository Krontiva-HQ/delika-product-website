"use client"

import { BranchPage } from "@/components/branch-page"
import { use } from "react"
import { useSearchParams } from "next/navigation"

interface PageProps {
  params: Promise<{ branchUrl: string }>
}

export default function RestaurantPage({ params }: PageProps) {
  try {
    // Get the URL slug from params and the ID from query
    const { branchUrl } = use(params);
    const searchParams = useSearchParams() || new URLSearchParams();
    const branchId = searchParams.get('id');

    if (!branchId) {
      // If no ID in query, try to get it from localStorage
      const storedId = localStorage.getItem('selectedBranchId');
      if (!storedId) {
        throw new Error('Branch ID not found');
      }
      return <BranchPage params={{ id: storedId }} />;
    }
    
    // Pass the actual branch ID to BranchPage
    return <BranchPage params={{ id: branchId }} />;
  } catch (error) {
    console.error('Error in RestaurantPage:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="text-center p-8 text-red-600 font-semibold">
          Restaurant not found
        </div>
        <p className="text-gray-500 text-sm">
          The restaurant you're looking for might have been moved or doesn't exist.
        </p>
        <div className="mt-4">
          <a 
            href="/"
            className="text-orange-500 hover:text-orange-600 text-sm"
          >
            Return to restaurants list
          </a>
        </div>
      </div>
    );
  }
}

// Make the page dynamic since we're fetching fresh data each time
export const dynamic = 'force-dynamic'; 