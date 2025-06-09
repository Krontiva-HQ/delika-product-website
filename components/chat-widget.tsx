"use client"

import { useState, useEffect } from 'react'
import { MessageCircle, X, Send, MessageSquareMore, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ChatState = 'closed' | 'questionnaire' | 'chat'

const commonIssues = [
  {
    id: 'order',
    title: 'Order Issues',
    description: 'Problems with your order, delivery, or payment'
  },
  {
    id: 'account',
    title: 'Account & Profile',
    description: 'Help with your account settings or profile'
  },
  {
    id: 'technical',
    title: 'Technical Support',
    description: 'App or website technical problems'
  },
  {
    id: 'business',
    title: 'Business Partnership',
    description: 'Interested in partnering with Delika'
  },
  {
    id: 'other',
    title: 'Other Issues',
    description: 'Any other concerns or questions'
  }
]

export function ChatWidget() {
  const [chatState, setChatState] = useState<ChatState>('closed')
  const [message, setMessage] = useState('')
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'agent' }>>([])

  // Simulate agent response after user sends a message
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      setIsAgentTyping(true)
      const timer = setTimeout(() => {
        setIsAgentTyping(false)
        setMessages(prev => [...prev, {
          text: "I understand your concern. Let me help you with that. Could you please provide more details about your issue?",
          sender: 'agent'
        }])
      }, 2000) // Simulate 2 seconds of typing

      return () => clearTimeout(timer)
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      setMessages(prev => [...prev, { text: message, sender: 'user' }])
      setMessage('')
    }
  }

  const handleIssueSelect = (issueId: string) => {
    setSelectedIssue(issueId)
    setChatState('chat')
  }

  const renderQuestionnaire = () => (
    <div className="bg-white rounded-lg shadow-lg w-80 h-[32rem] flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-orange-500 text-white rounded-t-lg">
        <h3 className="font-semibold">How can we help you?</h3>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-orange-600"
          onClick={() => setChatState('closed')}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {commonIssues.map((issue) => (
            <button
              key={issue.id}
              onClick={() => handleIssueSelect(issue.id)}
              className="w-full text-left p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <h4 className="font-semibold text-gray-900">{issue.title}</h4>
              <p className="text-sm text-gray-600">{issue.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderChat = () => (
    <div className="bg-white rounded-lg shadow-lg w-80 h-96 flex flex-col">
      <div className="p-4 border-b flex justify-between items-center bg-orange-500 text-white rounded-t-lg">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-orange-600"
              onClick={() => setChatState('questionnaire')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h3 className="font-semibold">Chat with us</h3>
              <p className="text-xs text-orange-100">
                {commonIssues.find(issue => issue.id === selectedIssue)?.title}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-orange-600 ml-2"
          onClick={() => setChatState('closed')}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
            <p className="text-sm">Hello! How can we help you with your {commonIssues.find(issue => issue.id === selectedIssue)?.title.toLowerCase()}?</p>
          </div>
          
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.sender === 'user' 
                  ? 'bg-orange-500 text-white ml-auto' 
                  : 'bg-gray-100'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          ))}

          {isAgentTyping && (
            <div className="flex space-x-2 ml-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          )}
        </div>
      </div>

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
  )

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {chatState === 'closed' ? (
        <Button
          onClick={() => setChatState('questionnaire')}
          className="rounded-full h-16 w-16 bg-orange-500 hover:bg-orange-600 shadow-lg"
        >
          <MessageSquareMore className="h-12 w-12 text-white" />
        </Button>
      ) : chatState === 'questionnaire' ? (
        renderQuestionnaire()
      ) : (
        renderChat()
      )}
    </div>
  )
} 