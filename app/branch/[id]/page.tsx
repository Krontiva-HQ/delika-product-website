import { Metadata } from 'next'
import { BranchPage } from "@/components/branch-page"

export const metadata: Metadata = {
  title: 'Branch Details',
  description: 'View branch details and menu',
}

interface PageProps {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

async function getData(id: string) {
  // You can add actual data fetching here if needed
  return { id }
}

export default async function Page({ params }: PageProps) {
  await getData(params.id)
  
  return (
    <main>
      <BranchPage params={params} />
    </main>
  )
} 