"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie } from "lucide-react"

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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-orange-500 border border-orange-500 rounded-full px-3 py-2 z-50 shadow-md flex items-center gap-2 w-auto min-w-[0]"
        >
          <Cookie className="h-4 w-4 text-white flex-shrink-0" />
          <span className="text-xs text-white">This website uses cookies.</span>
          <button
            onClick={handleAccept}
            className="ml-2 p-1 rounded-full bg-orange-600 hover:bg-orange-700 transition-colors text-white"
            aria-label="Close cookie consent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

