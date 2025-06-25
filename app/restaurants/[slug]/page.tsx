import { Metadata } from 'next'
import { BranchPage } from '@/components/branch-page'

interface Props {
  params: {
    slug: string
  }
  searchParams: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params
  
  return {
    title: `${slug} | Delika`,
    description: `Order from ${slug} on Delika`,
  }
}

export default function Page({ params, searchParams }: Props) {
  const { slug } = params
  const { id } = searchParams

  // If no ID in query params, try to get from localStorage (client-side only)
  const branchId = id || (typeof window !== 'undefined' ? localStorage.getItem('selectedBranchId') : null)

  if (!branchId) {
    return <div>Branch not found</div>
  }

  return <BranchPage params={{ id: branchId }} />
} 