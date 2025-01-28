"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasConsent = localStorage.getItem("cookieConsent")
    if (!hasConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true")
    setIsVisible(false)
  }

  const handleDecline = () => {
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 bg-orange-500 text-white p-4 z-50"
        >
          <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm flex-grow">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of
              cookies.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={handleAccept}
                variant="default"
                className="text-white border-white hover:bg-white hover:text-gray-900"
              >
                Accept
              </Button>
              <Button onClick={handleDecline} variant="secondary" className="text-black hover:bg-white/10">
                Decline
              </Button>
            </div>
            <button onClick={handleDecline} className="absolute top-2 right-2 text-white/60 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

