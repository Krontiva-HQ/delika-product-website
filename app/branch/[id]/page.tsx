"use client"

import { use } from "react"
import { Metadata } from 'next'
import { BranchPage } from "@/components/branch-page"

export const metadata: Metadata = {
  title: 'Branch Details',
  description: 'View branch details and menu',
}

interface PageProps {
  params: Promise<{ id: string }>
}

async function getData(id: string) {
  // You can add actual data fetching here if needed
  return { id }
}

export default function Page({ params }: PageProps) {
  const resolvedParams = use(params)
  
  return (
    <main>
      <BranchPage params={resolvedParams} />
    </main>
  )
} 