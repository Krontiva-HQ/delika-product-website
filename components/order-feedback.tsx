import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

interface OrderFeedbackProps {
  branchId: string
  customerPhone: string
}

export function OrderFeedback({ branchId, customerPhone }: OrderFeedbackProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmitFeedback = async () => {
    setIsSubmitting(true)
    try {
      await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          feedback,
          branchId,
          customerPhone
        }),
      })
      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-orange-600" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Thank You for Your Feedback!</h4>
        <p className="text-gray-600 mb-6">Your feedback helps us improve our service.</p>
        <Link href="/shop">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 h-12">
            Browse More Restaurants
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">How was your experience?</h4>
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => setRating(value)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all
              ${value <= rating
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-orange-100 hover:text-orange-500'}`}
          >
            {value}
          </button>
        ))}
      </div>
      <textarea
        placeholder="Share your feedback about your order experience (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full rounded-xl border border-gray-200 p-4 mb-6 h-32 resize-none
          focus:border-orange-500 focus:ring-orange-500 hover:border-orange-300 transition-colors"
      />
      <div className="flex gap-4">
        <Button 
          className="flex-1 bg-orange-500 hover:bg-orange-600 h-12"
          onClick={handleSubmitFeedback}
          disabled={isSubmitting || !rating}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              Submitting...
            </span>
          ) : (
            'Submit Feedback'
          )}
        </Button>
        <Link href="/shop" className="flex-1">
          <Button 
            variant="outline"
            className="w-full h-12 border-orange-200 text-orange-500 hover:bg-orange-50"
          >
            Skip & Browse
          </Button>
        </Link>
      </div>
    </div>
  )
} 