import { Metadata } from 'next'
import { BranchPage } from "@/components/branch-page"

export const metadata: Metadata = {
  title: 'Branch Details',
  description: 'View branch details and menu',
}

export default function Page({
  params,
}: {
  params: { id: string }
}) {
  return (
    <main>
      <BranchPage params={params} />
    </main>
  )
} 