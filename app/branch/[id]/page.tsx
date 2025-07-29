"use client"

import { use } from "react"
import { BranchPage } from "@/components/branch-page"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params)
  
  return (
    <main>
      <BranchPage params={resolvedParams} urlParams={{}} />
    </main>
  )
} 