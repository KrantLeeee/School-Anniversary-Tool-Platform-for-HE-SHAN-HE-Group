'use client'

import { useState, useEffect, useCallback } from 'react'

export interface ConversationSummary {
  id: string
  title: string
  updatedAt: Date
  toolId: string
}

interface UseConversationsResult {
  conversations: ConversationSummary[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  renameConversation: (id: string, title: string) => Promise<void>
}

export function useConversations(toolId?: string): UseConversationsResult {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const url = toolId
        ? `/api/conversations?toolId=${toolId}`
        : '/api/conversations'
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }
      const data = await response.json()
      setConversations(
        data.map((conv: any) => ({
          ...conv,
          updatedAt: new Date(conv.updatedAt),
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [toolId])

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }
      setConversations((prev) => prev.filter((conv) => conv.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  const renameConversation = useCallback(async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      if (!response.ok) {
        throw new Error('Failed to rename conversation')
      }
      setConversations((prev) =>
        prev.map((conv) => (conv.id === id ? { ...conv, title } : conv))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    isLoading,
    error,
    refresh: fetchConversations,
    deleteConversation,
  }
}
