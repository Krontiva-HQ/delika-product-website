"use client"

import { useState } from 'react'
import { MessageCircle, X, Send, MessageSquareMore } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      // TODO: Implement message sending logic
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white rounded-lg shadow-lg w-80 h-96 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex justify-between items-center bg-orange-500 text-white rounded-t-lg">
            <h3 className="font-semibold">Chat with us</h3>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-orange-600"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Chat Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Placeholder for messages */}
            <div className="space-y-4">
              <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
                <p className="text-sm">Hello! How can we help you today?</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-16 w-16 bg-orange-500 hover:bg-orange-600 shadow-lg"
        >
          <MessageSquareMore className="h-12 w-12 text-white" />
        </Button>
      )}
    </div>
  )
} 