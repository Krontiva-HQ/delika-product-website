"use client";

import { PharmacyList } from "@/components/pharmacy-list";

export default function PharmacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pharmacy Shops</h1>
      <PharmacyList />
    </div>
  );
} 