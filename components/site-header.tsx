"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { href: "/restaurants", label: "Restaurants" },
    { href: "/about", label: "About" },
  ]

  // Don't show header at all on /restaurants page
  if (pathname === "/restaurants") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="relative z-20 flex items-center"
        >
          <img
            src="/Delika-Logo.png"
            alt="Delika Logo"
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-black hover:text-orange-500 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          
          {/* Join Delika Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 text-sm font-medium text-black hover:text-orange-500 transition-colors"
            >
              Join Delika
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform duration-200",
                isDropdownOpen ? "rotate-180" : ""
              )} />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                <Link
                  href="/restaurant-partner"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  as Restaurant Partner
                </Link>
                <Link
                  href="/courier-partner"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  as Courier Partner
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="relative z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "fixed inset-0 z-10 bg-white md:hidden transition-transform duration-300",
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <nav className="flex flex-col space-y-4 p-6 pt-20">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-medium hover:text-orange-500 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-900">Join Delika</div>
              <div className="pl-4 space-y-2">
                <Link
                  href="/restaurant-partner"
                  className="block text-base text-gray-600 hover:text-orange-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  as Restaurant Partner
                </Link>
                <Link
                  href="/courier-partner"
                  className="block text-base text-gray-600 hover:text-orange-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  as Courier Partner
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

