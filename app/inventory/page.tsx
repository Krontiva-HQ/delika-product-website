"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import InventoryModal from "@/components/inventory-modal"
import CurrentInventorySection from "@/components/current-inventory-section"

export default function InventoryPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [expandedRestaurant, setExpandedRestaurant] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<any[]>([])

  // Handler for opening modal in add mode
  const handleAddInventory = () => {
    setSelectedItem(null)
    setEditMode(false)
    setModalOpen(true)
  }

  // Handler for opening modal in edit mode with item data
  const handleEditInventory = (item) => {
    setSelectedItem(item)
    setEditMode(true)
    setModalOpen(true)
  }

  const handleRestaurantClick = (restaurant: string, items: any[]) => {
    setExpandedRestaurant(restaurant)
    setExpandedItems(items)
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 py-16 px-4">
          {/* Column 1: Hero Section */}
          <section className="flex-1 mb-8 md:mb-0 flex flex-col items-center justify-center bg-white rounded-lg shadow p-8">
            <h1 className="text-3xl font-bold mb-4 text-center">Add Inventory for Restaurants</h1>
            <button
              className="px-6 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary-dark transition"
              onClick={handleAddInventory}
            >
              Add Inventory
            </button>
          </section>
          {/* Column 2: Current Inventory List */}
          <section className="flex-1 mb2 md:mb-0 flex flex-col items-center justify-center bg-white rounded-lg shadow p-8">
            <CurrentInventorySection onRestaurantClick={handleRestaurantClick} />
          </section>
        </div>
        {/* Expanded Section */}
        {expandedRestaurant && (
          <div className="w-full max-w-6xl bg-white rounded-lg shadow p-8 mt-4 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setExpandedRestaurant(null)}
              aria-label="Close expanded inventory"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">{expandedRestaurant} Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expandedItems.map(item => (
                <div key={item.Name + item.Category} className="border rounded p-4 flex gap-4 items-center">
                  <img src={item.imag} alt={item.Name} className="w-16 h-16 object-cover rounded" />
                  <div>
                    <div className="font-semibold">{item.Name}</div>
                    <div className="text-xs text-gray-500">{item.Category} &gt; {item.Subcategory}</div>
                    {item.price && <div className="text-xs text-green-600">₵{item.price}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <InventoryModal open={modalOpen} onClose={() => setModalOpen(false)} item={selectedItem} editMode={editMode} />
      </main>
      <Footer />
    </>
  )
} 