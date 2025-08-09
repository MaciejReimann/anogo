'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// Local types for chat page
type Message = {
  id: string
  content: string
  userId: string
  userName: string
  timestamp: Date
  isOwn: boolean
}

type ChatSession = {
  id: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

type MessageHandlingStrategy = {
  sendMessage: (content: string, chatId?: string) => Promise<{ success: boolean; message?: Message; error?: string }>
  loadMessages: (chatId?: string) => Promise<{ success: boolean; messages?: Message[]; chatId?: string; error?: string }>
}

// Injectable message handling strategy
const createMessageHandlingStrategy = (userId: string, userName: string): MessageHandlingStrategy => ({
  sendMessage: async (content: string, chatId?: string) => {
    try {
      // Mock implementation - will be replaced with actual API call in task 6
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        content,
        userId,
        userName,
        timestamp: new Date(),
        isOwn: true,
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Simulate AI response after user message
      setTimeout(() => {
        // This would trigger a state update in a real implementation
      }, 1000)
      
      return { success: true, message: newMessage }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send message' 
      }
    }
  },
  loadMessages: async (chatId?: string) => {
    try {
      // Mock implementation - will be replaced with actual API call in task 6
      const mockMessages: Message[] = chatId ? [
        {
          id: '1',
          content: 'Hello! How can I help you today?',
          userId: 'ai',
          userName: 'AI Assistant',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          isOwn: false,
        },
        {
          id: '2',
          content: 'I need help with my project setup.',
          userId,
          userName,
          timestamp: new Date(Date.now() - 1000 * 60 * 4),
          isOwn: true,
        },
        {
          id: '3',
          content: 'I\'d be happy to help! What kind of project are you working on?',
          userId: 'ai',
          userName: 'AI Assistant',
          timestamp: new Date(Date.now() - 1000 * 60 * 3),
          isOwn: false,
        },
      ] : []
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return { 
        success: true, 
        messages: mockMessages, 
        chatId: chatId || `chat_${Date.now()}` 
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to load messages' 
      }
    }
  },
})

// Inline MessageList component
function MessageList({ messages, isLoading }: { messages: Message[]; isLoading: boolean }) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
                <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
          <p className="text-gray-500">Send a message to begin chatting.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.isOwn
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm">{message.content}</p>
            <p
              className={`text-xs mt-1 ${
                message.isOwn ? 'text-indigo-200' : 'text-gray-500'
              }`}
            >
              {formatTimestamp(message.timestamp)}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  )
}

// Inline ChatInterface component
function ChatInterface({ userId, userName }: { userId: string; userName: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  
  const searchParams = useSearchParams()
  const chatId = searchParams.get('id')
  
  const messageHandlingStrategy = createMessageHandlingStrategy(userId, userName)
  
  useEffect(() => {
    const loadInitialMessages = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await messageHandlingStrategy.loadMessages(chatId || undefined)
        
        if (result.success && result.messages) {
          setMessages(result.messages)
          setCurrentChatId(result.chatId || null)
        } else {
          setError(result.error || 'Failed to load messages')
        }
      } catch (err) {
        setError('Failed to load chat')
        console.error('Chat loading error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialMessages()
  }, [chatId])
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isSending) return
    
    const messageContent = inputValue.trim()
    setInputValue('')
    setIsSending(true)
    setError(null)
    
    try {
      const result = await messageHandlingStrategy.sendMessage(messageContent, currentChatId || undefined)
      
      if (result.success && result.message) {
        setMessages(prev => [...prev, result.message!])
        
        // Simulate AI response
        setTimeout(() => {
          const aiResponse: Message = {
            id: `ai_${Date.now()}`,
            content: `I received your message: "${messageContent}". This is a mock response that will be replaced with actual AI integration in future tasks.`,
            userId: 'ai',
            userName: 'AI Assistant',
            timestamp: new Date(),
            isOwn: false,
          }
          setMessages(prev => [...prev, aiResponse])
        }, 1000)
      } else {
        setError(result.error || 'Failed to send message')
      }
    } catch (err) {
      setError('Failed to send message')
      console.error('Message sending error:', err)
    } finally {
      setIsSending(false)
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      
      <MessageList messages={messages} isLoading={isLoading} />
      
      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please sign in to access the chat.</p>
          <Link
            href="/sign-in"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-indigo-600 hover:text-indigo-500 font-medium"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Chat Interface */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto bg-white shadow-sm">
          {session?.user?.id && (
            <ChatInterface 
              userId={session.user.id} 
              userName={session.user.name || session.user.email || 'User'} 
            />
          )}
        </div>
      </main>
    </div>
  )
}
