"use client"

import { useState, useEffect } from 'react'
import { MessageCircle, X, Send, MessageSquareMore, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type ChatState = 'closed' | 'questionnaire' | 'chat'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'agent'
  timestamp: Date
}

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

// Generate a unique session ID for this chat session
const generateSessionId = () => {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Get or create session ID from localStorage
const getSessionId = () => {
  let sessionId = localStorage.getItem('delika_chat_session_id')
  if (!sessionId) {
    sessionId = generateSessionId()
    localStorage.setItem('delika_chat_session_id', sessionId)
  }
  return sessionId
}

export function ChatWidget() {
  const [chatState, setChatState] = useState<ChatState>('closed')
  const [message, setMessage] = useState('')
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null)
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Initialize session ID on component mount
  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  // Load existing messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('delika_chat_messages')
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        setMessages(parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch (error) {
        console.error('Error loading chat messages:', error)
      }
    }
  }, [])

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('delika_chat_messages', JSON.stringify(messages))
    }
  }, [messages])

  // Poll for new messages from the server
  useEffect(() => {
    if (chatState === 'chat' && sessionId) {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_CHAT_GET_ENDPOINT}?session_id=${sessionId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.messages && Array.isArray(data.messages)) {
              // Add new messages that we don't already have
              const newMessages = data.messages.filter((serverMsg: any) => 
                !messages.some(localMsg => localMsg.id === serverMsg.id)
              )
              if (newMessages.length > 0) {
                setMessages(prev => [...prev, ...newMessages])
              }
            }
          }
        } catch (error) {
          console.error('Error polling for messages:', error)
        }
      }, 10000) // Poll every 10 seconds

      return () => clearInterval(pollInterval)
    }
  }, [chatState, sessionId, messages])

  const sendMessageToServer = async (messageText: string) => {
    if (!sessionId || !selectedIssue) return

    const messageData = {
      sender_id: sessionId,
      context_text: messageText,
      sender_type: 'user',
      issue_type: selectedIssue
    }

    try {
      setIsLoading(true)
      const response = await fetch(process.env.NEXT_PUBLIC_CHAT_POST_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const data = await response.json()
        // Add the user message to local state
        const userMessage: ChatMessage = {
          id: `user_${Date.now()}`,
          text: messageText,
          sender: 'user',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])

        // If the server responds with an immediate reply, add it
        if (data.response) {
          const agentMessage: ChatMessage = {
            id: `agent_${Date.now()}`,
            text: data.response,
            sender: 'agent',
            timestamp: new Date()
          }
          setMessages(prev => [...prev, agentMessage])
        }
      } else {
        console.error('Failed to send message to server')
        // Still add the user message locally for better UX
        const userMessage: ChatMessage = {
          id: `user_${Date.now()}`,
          text: messageText,
          sender: 'user',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, userMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Add message locally even if server fails
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        text: messageText,
        sender: 'user',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      await sendMessageToServer(message.trim())
      setMessage('')
    }
  }

  const handleIssueSelect = (issueId: string) => {
    setSelectedIssue(issueId)
    setChatState('chat')
    
    // Send initial message to server when starting chat
    setTimeout(() => {
      sendMessageToServer(`I need help with: ${commonIssues.find(issue => issue.id === issueId)?.title}`)
    }, 500)
  }

  const clearChatHistory = () => {
    setMessages([])
    localStorage.removeItem('delika_chat_messages')
    localStorage.removeItem('delika_chat_session_id')
    setSessionId(generateSessionId())
    localStorage.setItem('delika_chat_session_id', sessionId)
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
          {messages.length === 0 && (
            <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
              <p className="text-sm">Hello! How can we help you with your {commonIssues.find(issue => issue.id === selectedIssue)?.title.toLowerCase()}?</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg max-w-[80%] ${
                msg.sender === 'user' 
                  ? 'bg-orange-500 text-white ml-auto' 
                  : 'bg-gray-100'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}

          {isLoading && (
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
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            className="bg-orange-500 hover:bg-orange-600"
            disabled={isLoading || !message.trim()}
          >
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