import React, { createContext, useContext, useState, useEffect } from 'react'

interface TokenStats {
    totalTokens: number
    sessionTokens: number
    messagesCount: number
    sessionStart: number
}

interface StatsContextType {
    stats: TokenStats
    addTokens: (tokens: number) => void
    incrementMessages: () => void
    resetStats: () => void
    resetSession: () => void
}

const StatsContext = createContext<StatsContextType | undefined>(undefined)

const initialStats: TokenStats = {
    totalTokens: 0,
    sessionTokens: 0,
    messagesCount: 0,
    sessionStart: Date.now()
}

export function StatsProvider({ children }: { children: React.ReactNode }) {
    const [stats, setStats] = useState<TokenStats>(() => {
        const saved = localStorage.getItem('tokenStats')
        if (saved) {
            const parsed = JSON.parse(saved)
            return {
                ...parsed,
                sessionTokens: 0,
                sessionStart: Date.now()
            }
        }
        return initialStats
    })

    useEffect(() => {
        localStorage.setItem('tokenStats', JSON.stringify({
            totalTokens: stats.totalTokens,
            messagesCount: stats.messagesCount,
            sessionTokens: 0,
            sessionStart: Date.now()
        }))
    }, [stats.totalTokens, stats.messagesCount])

    const addTokens = (tokens: number) => {
        setStats(prev => ({
            ...prev,
            totalTokens: prev.totalTokens + tokens,
            sessionTokens: prev.sessionTokens + tokens
        }))
    }

    const incrementMessages = () => {
        setStats(prev => ({
            ...prev,
            messagesCount: prev.messagesCount + 1
        }))
    }

    const resetStats = () => {
        setStats(initialStats)
        localStorage.removeItem('tokenStats')
    }

    const resetSession = () => {
        setStats(prev => ({
            ...prev,
            sessionTokens: 0,
            sessionStart: Date.now()
        }))
    }

    return (
        <StatsContext.Provider value={{ stats, addTokens, incrementMessages, resetStats, resetSession }}>
            {children}
        </StatsContext.Provider>
    )
}

export function useStats() {
    const context = useContext(StatsContext)
    if (!context) {
        throw new Error('useStats must be used within StatsProvider')
    }
    return context
}
