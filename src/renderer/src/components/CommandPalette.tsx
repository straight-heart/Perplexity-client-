import React, { useEffect, useState, useRef } from 'react'
import { Search, Command, MessageSquare, Settings2, Sparkles, Moon, Sun, Zap, Palette } from 'lucide-react'
import { cn } from '../lib/utils'
import { useTheme } from '../contexts/ThemeContext'
import { useChat } from '../contexts/ChatContext'
import { useStats } from '../contexts/StatsContext'
import { MODELS } from '../lib/constants'

interface CommandItem {
    id: string
    title: string
    description?: string
    icon: React.ReactNode
    group: string
    action: () => void
    keywords?: string[]
}

interface CommandPaletteProps {
    isOpen: boolean
    onClose: () => void
    onOpenSettings: () => void
    onModelChange: (model: string) => void
}

export function CommandPalette({ isOpen, onClose, onOpenSettings, onModelChange }: CommandPaletteProps) {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)

    const { setTheme } = useTheme()
    const { createChat, chats, loadChat } = useChat()
    const { resetSession } = useStats()


    const commands: CommandItem[] = [
        {
            id: 'new-chat',
            title: 'New Chat',
            description: 'Start a fresh conversation',
            icon: <MessageSquare size={16} />,
            group: 'Actions',
            action: () => { createChat(); onClose() },
            keywords: ['start', 'create', 'chat']
        },
        {
            id: 'settings',
            title: 'Open Settings',
            description: 'Manage preferences and API keys',
            icon: <Settings2 size={16} />,
            group: 'Actions',
            action: () => { onOpenSettings(); onClose() },
            keywords: ['config', 'preferences']
        },
        {
            id: 'reset-session',
            title: 'Reset Session Stats',
            description: 'Clear token usage for this session',
            icon: <Zap size={16} />,
            group: 'Actions',
            action: () => { resetSession(); onClose() },
            keywords: ['clear', 'tokens']
        },

        {
            id: 'theme-dark',
            title: 'Theme: Dark',
            icon: <Moon size={16} />,
            group: 'Themes',
            action: () => { setTheme('dark'); onClose() },
            keywords: ['dark', 'mode']
        },
        {
            id: 'theme-light',
            title: 'Theme: Light',
            icon: <Sun size={16} />,
            group: 'Themes',
            action: () => { setTheme('light'); onClose() },
            keywords: ['light', 'mode']
        },
        {
            id: 'theme-midnight',
            title: 'Theme: Midnight',
            icon: <Palette size={16} />,
            group: 'Themes',
            action: () => { setTheme('midnight'); onClose() },
            keywords: ['blue', 'dark']
        },
        {
            id: 'theme-dracula',
            title: 'Theme: Dracula',
            icon: <Palette size={16} />,
            group: 'Themes',
            action: () => { setTheme('dracula'); onClose() },
            keywords: ['vampire', 'purple', 'red']
        },
        {
            id: 'theme-ocean',
            title: 'Theme: Ocean',
            icon: <Palette size={16} />,
            group: 'Themes',
            action: () => { setTheme('ocean'); onClose() },
            keywords: ['blue', 'water']
        },
        {
            id: 'theme-forest',
            title: 'Theme: Forest',
            icon: <Palette size={16} />,
            group: 'Themes',
            action: () => { setTheme('forest'); onClose() },
            keywords: ['green', 'nature']
        },

        ...MODELS.map((model) => ({
            id: `model-${model.id}`,
            title: `Model: ${model.name}`,
            description: model.id,
            icon: <Sparkles size={16} />,
            group: 'Models',
            action: () => { onModelChange(model.id); onClose() },
            keywords: ['ai', 'llm', 'switch']
        })),

        ...chats.slice(0, 5).map(chat => ({
            id: `chat-${chat.id}`,
            title: chat.title,
            description: 'Jump to conversation',
            icon: <MessageSquare size={16} />,
            group: 'History',
            action: () => { loadChat(chat.id); onClose() },
            keywords: ['history', 'recent']
        }))
    ]

    const filteredCommands = commands.filter(cmd => {
        const search = query.toLowerCase()
        return (
            cmd.title.toLowerCase().includes(search) ||
            cmd.description?.toLowerCase().includes(search) ||
            cmd.group.toLowerCase().includes(search) ||
            cmd.keywords?.some(k => k.toLowerCase().includes(search))
        )
    })

    useEffect(() => {
        setSelectedIndex(0)
    }, [query])

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 10)
            setQuery('')
            setSelectedIndex(0)
        }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => Math.max(prev - 1, 0))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                const selected = filteredCommands[selectedIndex]
                if (selected) {
                    selected.action()
                }
            } else if (e.key === 'Escape') {
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, filteredCommands, selectedIndex, onClose])

    useEffect(() => {
        if (listRef.current) {
            const selectedElement = listRef.current.children[selectedIndex] as HTMLElement
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest' })
            }
        }
    }, [selectedIndex])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-popover/95 backdrop-blur-xl border border-border shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[60vh]">
                <div className="flex items-center px-4 py-3 border-b border-border/50">
                    <Search className="w-5 h-5 text-muted-foreground mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted-foreground"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-1">
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            <span className="text-xs">ESC</span>
                        </kbd>
                    </div>
                </div>

                <div ref={listRef} className="overflow-y-auto p-2 scrollbar-hide">
                    {filteredCommands.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredCommands.map((cmd, index) => (
                                <button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left group",
                                        selectedIndex === index ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "flex items-center justify-center w-5 h-5",
                                            selectedIndex === index ? "text-primary-foreground" : "text-muted-foreground"
                                        )}>
                                            {cmd.icon}
                                        </div>
                                        <div>
                                            <div className="font-medium">{cmd.title}</div>
                                            {cmd.description && (
                                                <div className={cn(
                                                    "text-xs truncate max-w-[300px]",
                                                    selectedIndex === index ? "text-primary-foreground/80" : "text-muted-foreground"
                                                )}>
                                                    {cmd.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedIndex === index && (
                                        <div className="text-xs opacity-70 flex items-center gap-1">
                                            <span className="mr-1">{cmd.group}</span>
                                            <Command size={12} />
                                            <span>Enter</span>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 py-2 border-t border-border/50 bg-secondary/20 text-[10px] text-muted-foreground flex justify-between items-center">
                    <div>
                        Spotlight Search
                    </div>
                    <div className="flex gap-2">
                        <span>Use <kbd className="font-sans">↑↓</kbd> to navigate</span>
                        <span><kbd className="font-sans">↵</kbd> to select</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
