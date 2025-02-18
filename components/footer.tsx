import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Download } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm text-gray-400">
              We are revolutionizing the restaurant industry with our cutting-edge management and delivery solutions.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Delika. All rights reserved.
        </div>
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-gray-400 md:text-left">
              Built by Delika. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/download/rider" 
              className="text-sm text-gray-400 hover:text-gray-100 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Rider App
            </Link>
            <Link 
              href="/download/restaurant" 
              className="text-sm text-gray-400 hover:text-gray-100 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Restaurant App
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

