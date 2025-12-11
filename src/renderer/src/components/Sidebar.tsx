import { cn } from '../lib/utils'
import { MessageSquare, Trash2, Plus, BarChart3, RefreshCw, Settings2 } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
import { useStats } from '../contexts/StatsContext'

interface SidebarProps {
    isOpen: boolean
    onOpenSettings: () => void
}

export function Sidebar({ isOpen, onOpenSettings }: SidebarProps) {
    const { chats, currentChatId, createChat, deleteChat, loadChat } = useChat()
    const { stats, resetStats, resetSession } = useStats()

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num)
    }

    return (
        <div
            className={cn(
                "flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl supports-[backdrop-filter]:bg-card/30 transition-all duration-300 ease-in-out relative z-20",
                isOpen ? "w-80 translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 overflow-hidden"
            )}
        >
            <div className="p-4 border-b border-border/50 flex items-center gap-3">
                <button
                    onClick={createChat}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    New Chat
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
                        Recent Chats
                    </div>
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            className={cn(
                                "group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                                currentChatId === chat.id
                                    ? "bg-secondary text-foreground"
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            )}
                            onClick={() => loadChat(chat.id)}
                        >
                            <MessageSquare size={16} className="flex-shrink-0" />
                            <span className="flex-1 truncate">{chat.title}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    deleteChat(chat.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 border-t border-border/50 space-y-3 bg-secondary/10">
                <div className="flex items-center gap-2 mb-2 text-primary">
                    <BarChart3 size={16} />
                    <h2 className="font-semibold text-xs uppercase tracking-wider">Token Usage</h2>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Total Tokens:</span>
                        <span className="text-sm font-semibold text-foreground">{formatNumber(stats.totalTokens)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Session Tokens:</span>
                        <span className="text-sm font-medium">{formatNumber(stats.sessionTokens)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Messages Sent:</span>
                        <span className="text-sm font-medium">{formatNumber(stats.messagesCount)}</span>
                    </div>
                    <div className="pt-2 flex gap-2">
                        <button
                            onClick={resetSession}
                            className="flex-1 bg-secondary/50 hover:bg-secondary/70 rounded-lg px-3 py-2 text-xs transition-all flex items-center justify-center gap-1"
                            title="Reset Session Stats"
                        >
                            <RefreshCw size={12} />
                            Session
                        </button>
                        <button
                            onClick={resetStats}
                            className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg px-3 py-2 text-xs transition-all"
                            title="Reset All Stats"
                        >
                            All
                        </button>
                    </div>
                </div>

                <button
                    onClick={onOpenSettings}
                    className="w-full flex items-center gap-2 p-2 mt-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                    <Settings2 size={16} />
                    <span>Settings</span>
                </button>
            </div>
        </div>
    )
}
