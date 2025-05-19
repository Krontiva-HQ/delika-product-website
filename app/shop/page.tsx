"use client"

import { SiteHeader } from "@/components/site-header"
import { StoreHeader } from "@/components/store-header"
import { Suspense } from "react"

export default function Shop() {
  return (
    <main className="min-h-screen bg-gray-50">
      <SiteHeader />
      <Suspense fallback={<div>Loading...</div>}>
        <StoreHeader />
      </Suspense>
    </main>
  )
} 