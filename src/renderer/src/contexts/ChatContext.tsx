import React, { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface Message {
    role: 'user' | 'assistant'
    content: string
    replyTo?: string
    attachment?: {
        type: 'image' | 'text'
        content: string
        name: string
    }
}

export interface Chat {
    id: string
    title: string
    messages: Message[]
    createdAt: number
}

interface ChatContextType {
    chats: Chat[]
    currentChatId: string | null
    createChat: () => void
    deleteChat: (id: string) => void
    loadChat: (id: string) => void
    updateCurrentChatMessages: (messages: Message[]) => void
    systemPrompt: string
    setSystemPrompt: (prompt: string) => void
    savedSystemPrompts: string[]
    saveSystemPrompt: (prompt: string) => void
    deleteSystemPrompt: (index: number) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [chats, setChats] = useState<Chat[]>(() => {
        const saved = localStorage.getItem('chats')
        return saved ? JSON.parse(saved) : []
    })

    const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
        return localStorage.getItem('currentChatId')
    })

    const [systemPrompt, setSystemPromptState] = useState<string>(() => {
        return localStorage.getItem('systemPrompt') || ''
    })

    const [savedSystemPrompts, setSavedSystemPrompts] = useState<string[]>(() => {
        const saved = localStorage.getItem('savedSystemPrompts')
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        localStorage.setItem('chats', JSON.stringify(chats))
    }, [chats])

    useEffect(() => {
        if (currentChatId) {
            localStorage.setItem('currentChatId', currentChatId)
        } else {
            localStorage.removeItem('currentChatId')
        }
    }, [currentChatId])

    useEffect(() => {
        localStorage.setItem('systemPrompt', systemPrompt)
    }, [systemPrompt])

    useEffect(() => {
        localStorage.setItem('savedSystemPrompts', JSON.stringify(savedSystemPrompts))
    }, [savedSystemPrompts])

    const createChat = () => {
        const newChat: Chat = {
            id: uuidv4(),
            title: 'New Chat',
            messages: [],
            createdAt: Date.now()
        }
        setChats(prev => [newChat, ...prev])
        setCurrentChatId(newChat.id)
    }

    const deleteChat = (id: string) => {
        setChats(prev => prev.filter(c => c.id !== id))
        if (currentChatId === id) {
            setCurrentChatId(null)
        }
    }

    const loadChat = (id: string) => {
        setCurrentChatId(id)
    }

    const updateCurrentChatMessages = (messages: Message[]) => {
        if (!currentChatId) return

        setChats(prev => prev.map(chat => {
            if (chat.id === currentChatId) {
                // Generate a title from the first message if it's "New Chat"
                // Only update if title is "New Chat" and we have a user message
                let title = chat.title
                if (chat.title === 'New Chat' && messages.length > 0) {
                    const firstUserMsg = messages.find(m => m.role === 'user')
                    if (firstUserMsg) {
                        const content = firstUserMsg.content
                        title = content.slice(0, 40) + (content.length > 40 ? '...' : '')
                    }
                }
                return { ...chat, title, messages }
            }
            return chat
        }))
    }

    const setSystemPrompt = (prompt: string) => {
        setSystemPromptState(prompt)
    }

    const saveSystemPrompt = (prompt: string) => {
        if (prompt && !savedSystemPrompts.includes(prompt)) {
            setSavedSystemPrompts(prev => [...prev, prompt])
        }
    }

    const deleteSystemPrompt = (index: number) => {
        setSavedSystemPrompts(prev => prev.filter((_, i) => i !== index))
    }

    return (
        <ChatContext.Provider value={{
            chats,
            currentChatId,
            createChat,
            deleteChat,
            loadChat,
            updateCurrentChatMessages,
            systemPrompt,
            setSystemPrompt,
            savedSystemPrompts,
            saveSystemPrompt,
            deleteSystemPrompt
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChat must be used within ChatProvider')
    }
    return context
}
