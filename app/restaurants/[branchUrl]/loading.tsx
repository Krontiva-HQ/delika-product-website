import { LoadingSpinner } from "@/components/loading-spinner"

export default function Loading() {
  return (
    <LoadingSpinner 
      size="md" 
      color="orange" 
      text="Loading restaurant..." 
      fullScreen 
    />
  )
} 