import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch('https://api-server.krontiva.africa/api:uEBBwbSs/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      
      if (response.ok) {
        setIsSuccess(true)
      } else {
        setError(data.message || "Failed to send reset link. Please try again.")
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToLogin}
              className="hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <DialogTitle>Reset Password</DialogTitle>
          </div>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
            <div className="h-5 w-5 text-red-500 mr-2">⚠️</div>
            {error}
          </div>
        )}

        {isSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="bg-green-50 text-green-600 p-4 rounded-lg">
              Password reset link has been sent to your email.
            </div>
            <Button
              onClick={onBackToLogin}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                }}
                required
                className={error ? "border-red-300 focus:ring-red-500" : ""}
              />
              <p className="text-sm text-gray-500">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 