"use client";

import Image from "next/image";

const mockPharmacyItems = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    price: "₵10.00",
    image: "https://images.unsplash.com/photo-1588776814546-ec7e8c1b1b1b?auto=format&fit=crop&w=400&q=80",
    description: "Pain relief tablets. 10 pack."
  },
  {
    id: "2",
    name: "Vitamin C 1000mg",
    price: "₵25.00",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80",
    description: "Immune support. 30 tablets."
  },
  {
    id: "3",
    name: "Cough Syrup",
    price: "₵18.00",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
    description: "Soothes dry coughs. 100ml."
  },
  {
    id: "4",
    name: "Antiseptic Cream",
    price: "₵15.00",
    image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
    description: "For minor cuts and grazes."
  },
  {
    id: "5",
    name: "Allergy Relief Tablets",
    price: "₵22.00",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    description: "24hr allergy relief. 20 tablets."
  },
];

export default function PharmacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pharmacy Products</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {mockPharmacyItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left">
            <div className="relative h-36">
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                No Image
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
              <span className="text-xs text-gray-600 truncate block">{item.price}</span>
              <span className="text-xs text-gray-500 block mt-1">{item.description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 