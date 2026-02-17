'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// Local types for dashboard page
type ChatHistoryItem = {
  id: string
  lastMessage: string
  timestamp: Date
  messageCount: number
}

type UserProfile = {
  id: string
  name: string | null
  email: string
  createdAt: Date
}

type DataFetchingStrategy = {
  fetchChatHistory: (userId: string) => Promise<ChatHistoryItem[]>
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>
}

// Injectable data fetching strategy
const createDataFetchingStrategy = (): DataFetchingStrategy => ({
  fetchChatHistory: async (userId: string) => {
    try {
      // Mock data for now - will be replaced with actual API call in task 6
      const mockHistory: ChatHistoryItem[] = [
        {
          id: '1',
          lastMessage: 'Hello, how can I help you today?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          messageCount: 5,
        },
        {
          id: '2',
          lastMessage: 'Thanks for the information!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          messageCount: 12,
        },
        {
          id: '3',
          lastMessage: 'Can you explain more about this feature?',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          messageCount: 8,
        },
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockHistory
    } catch (error) {
      console.error('Failed to fetch chat history:', error)
      return []
    }
  },
  fetchUserProfile: async (userId: string) => {
    try {
      // Mock data for now - will be replaced with actual API call in task 6
      const mockProfile: UserProfile = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockProfile
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      return null
    }
  },
})

// Inline ChatHistory component
function ChatHistory({ userId }: { userId: string }) {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const dataFetchingStrategy = createDataFetchingStrategy()
  
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const history = await dataFetchingStrategy.fetchChatHistory(userId)
        setChatHistory(history)
      } catch (err) {
        setError('Failed to load chat history')
        console.error('Chat history loading error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    if (userId) {
      loadChatHistory()
    }
  }, [userId])
  
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Try again
        </button>
      </div>
    )
  }
  
  if (chatHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No chat history yet</p>
        <Link
          href="/chat"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Start your first chat
        </Link>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {chatHistory.map((chat) => (
        <Link
          key={chat.id}
          href={`/chat?id=${chat.id}`}
          className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-gray-900 truncate flex-1">
              Chat #{chat.id}
            </h3>
            <span className="text-sm text-gray-500 ml-2">
              {formatTimestamp(chat.timestamp)}
            </span>
          </div>
          <p className="text-gray-600 text-sm truncate mb-2">
            {chat.lastMessage}
          </p>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{chat.messageCount} messages</span>
            <span className="text-indigo-600">View chat →</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  
  const dataFetchingStrategy = createDataFetchingStrategy()
  
  useEffect(() => {
    const loadUserProfile = async () => {
      if (session?.user?.id) {
        try {
          setIsLoadingProfile(true)
          const profile = await dataFetchingStrategy.fetchUserProfile(session.user.id)
          setUserProfile(profile)
        } catch (error) {
          console.error('Failed to load user profile:', error)
        } finally {
          setIsLoadingProfile(false)
        }
      }
    }
    
    if (status === 'authenticated') {
      loadUserProfile()
    }
  }, [session, status])
  
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
          <p className="text-gray-600 mb-4">Please sign in to access your dashboard.</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              {isLoadingProfile ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-48 mt-1"></div>
                </div>
              ) : (
                <p className="text-gray-600">
                  Welcome back, {userProfile?.name || session?.user?.name || 'User'}!
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/chat"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                New Chat
              </Link>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat History Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Chats</h2>
                {session?.user?.id && <ChatHistory userId={session.user.id} />}
              </div>
            </div>
            
            {/* Profile Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Profile</h2>
                {isLoadingProfile ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ) : userProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-sm text-gray-900">{userProfile.name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{userProfile.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member since</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userProfile.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Failed to load profile</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
