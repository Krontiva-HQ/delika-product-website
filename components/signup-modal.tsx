"use client"

import { Store, Bike } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface SignupModalProps {
  trigger: React.ReactNode
}

export function SignupModal({ trigger }: SignupModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Choose your role</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          <Link 
            href="/restaurants"
            className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-gray-100 hover:border-orange-500 hover:bg-orange-50 transition-all group"
          >
            <div className="w-16 h-16 rounded-xl bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Store className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Restaurant</h3>
              <p className="text-sm text-gray-500">Partner with us</p>
            </div>
          </Link>

          <Link 
            href="/couriers"
            className="flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-gray-100 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Bike className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Rider</h3>
              <p className="text-sm text-gray-500">Start earning</p>
            </div>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
} 