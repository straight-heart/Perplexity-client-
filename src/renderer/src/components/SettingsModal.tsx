import { useRef, useEffect, useState } from 'react'
import { X, Save, Trash2, BarChart3, RefreshCw, Key, Plus, Loader2, Link } from 'lucide-react'
import { cn } from '../lib/utils'
import { useTheme, THEME_DEFAULTS, Theme } from '../contexts/ThemeContext'
import { useStats } from '../contexts/StatsContext'
import { useChat } from '../contexts/ChatContext'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    onApiKeyChange?: () => void
}

export function SettingsModal({ isOpen, onClose, onApiKeyChange }: SettingsModalProps) {
    const { theme, setTheme, accentColor, setAccentColor } = useTheme()
    const { stats, resetStats, resetSession } = useStats()
    const { systemPrompt, setSystemPrompt, savedSystemPrompts, saveSystemPrompt, deleteSystemPrompt } = useChat()
    const modalRef = useRef<HTMLDivElement>(null)

    const [apiKeys, setApiKeys] = useState<any[]>([])
    const [newKeyInput, setNewKeyInput] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [validating, setValidating] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const loadKeys = async () => {
        if (window.api?.getKeys) {
            const keys = await window.api.getKeys()
            setApiKeys(keys)
        }
    }

    useEffect(() => {
        if (isOpen) loadKeys()
    }, [isOpen])

    const handleAddKey = async () => {
        setError(null)
        const trimmedKey = newKeyInput.trim()
        if (!trimmedKey.startsWith('pplx-')) {
            setError('Key must start with pplx-')
            return
        }

        try {
            await window.api.addKey(trimmedKey)
            setNewKeyInput('')
            setIsAdding(false)
            await loadKeys()
            onApiKeyChange?.()
        } catch (e: any) {
            console.error(e)
            setError(e.message || 'Failed to add key')
        }
    }

    const handleRemoveKey = async (key: string) => {
        await window.api.removeKey(key)
        await loadKeys()
        onApiKeyChange?.()
    }

    const handleSetActive = async (key: string) => {
        await window.api.setActiveKey(key)
        await loadKeys()
        onApiKeyChange?.()
    }

    const handleValidate = async (key: string) => {
        setValidating(key)
        await window.api.validateKey(key)
        setTimeout(() => setValidating(null), 800)
    }

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num)
    }



    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 select-none">
            <div
                ref={modalRef}
                className="bg-background border border-border/50 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 custom-scrollbar"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Key size={16} />
                                API Keys
                            </label>
                            <button
                                onClick={() => setIsAdding(!isAdding)}
                                className={cn(
                                    "p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-medium",
                                    isAdding ? "bg-secondary text-foreground" : "text-primary hover:bg-secondary/50"
                                )}
                            >
                                <Plus size={14} className={cn("transition-transform", isAdding && "rotate-45")} />
                                {isAdding ? 'Cancel' : 'Add Key'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            {isAdding && (
                                <div className="animate-in slide-in-from-top-2 duration-200 bg-secondary/30 p-3 rounded-xl border border-border/50 space-y-2">
                                    <input
                                        type="text"
                                        value={newKeyInput}
                                        onChange={(e) => {
                                            setNewKeyInput(e.target.value)
                                            setError(null)
                                        }}
                                        placeholder="pplx-..."
                                        className={cn(
                                            "w-full bg-background/50 border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary select-text",
                                            error ? "border-destructive text-destructive placeholder:text-destructive/50" : "border-border/50"
                                        )}
                                    />
                                    {error && <div className="text-[10px] text-destructive px-1">{error}</div>}
                                    <button
                                        onClick={handleAddKey}
                                        disabled={!newKeyInput.trim().startsWith('pplx-')}
                                        className="w-full bg-primary text-primary-foreground rounded-lg py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                                    >
                                        Save Key
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                {apiKeys.map((k) => (
                                    <div
                                        key={k.key}
                                        className={cn(
                                            "group relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                                            k.isActive
                                                ? "bg-primary/5 border-primary/20 shadow-sm"
                                                : "bg-secondary/20 border-border/50 hover:border-primary/20 hover:bg-secondary/40"
                                        )}
                                    >
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleSetActive(k.key)}>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={cn(
                                                    "text-xs font-medium truncate transition-colors",
                                                    k.isActive ? "text-primary" : "text-muted-foreground"
                                                )}>
                                                    {k.name}
                                                </span>
                                                {k.isActive && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Active</span>}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground/60 font-mono truncate">
                                                {k.key.substring(0, 8)}...{k.key.substring(k.key.length - 4)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleValidate(k.key)}
                                                disabled={!!validating}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-green-500 hover:bg-green-500/10 transition-colors"
                                                title="Check Status"
                                            >
                                                {validating === k.key ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                            </button>

                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(k.key)
                                                }}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                                title="Copy"
                                            >
                                                <Link size={14} />
                                            </button>

                                            <button
                                                onClick={() => handleRemoveKey(k.key)}
                                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary rounded-full"></span>
                                System Prompt
                            </label>
                            <button
                                onClick={() => saveSystemPrompt(systemPrompt)}
                                disabled={!systemPrompt.trim()}
                                className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={12} />
                                Save
                            </button>
                        </div>
                        <textarea
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            placeholder="You are a helpful assistant..."
                            className="w-full h-24 bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none placeholder:text-muted-foreground/50 select-text"
                        />

                        {savedSystemPrompts.length > 0 && (
                            <div className="space-y-2">
                                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Saved Prompts</div>
                                <div className="space-y-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                    {savedSystemPrompts.map((prompt, idx) => (
                                        <div key={idx} className="group flex items-center gap-2 bg-secondary/30 hover:bg-secondary/60 rounded-lg p-2 transition-all">
                                            <button
                                                onClick={() => setSystemPrompt(prompt)}
                                                className="flex-1 text-left text-xs truncate text-muted-foreground group-hover:text-foreground transition-colors"
                                                title={prompt}
                                            >
                                                {prompt}
                                            </button>
                                            <button
                                                onClick={() => deleteSystemPrompt(idx)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-all"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                            Theme
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {(Object.keys(THEME_DEFAULTS) as Theme[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={cn(
                                        "flex items-center gap-2 p-2 rounded-lg border transition-all text-left group",
                                        theme === t
                                            ? "bg-primary/10 border-primary shadow-sm"
                                            : "bg-secondary/30 border-transparent hover:bg-secondary/50 hover:border-border/50"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-4 h-4 rounded-full border shadow-sm transition-all",
                                            theme === t ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : "group-hover:scale-110"
                                        )}
                                        style={{ background: THEME_DEFAULTS[t] }}
                                    />
                                    <span className={cn(
                                        "text-[10px] font-medium truncate",
                                        theme === t ? "text-primary" : "text-foreground"
                                    )}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-4 bg-primary rounded-full"></span>
                            Accent Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                'hsl(0 84.2% 60.2%)',
                                'hsl(221.2 83.2% 53.3%)',
                                'hsl(142.1 76.2% 36.3%)',
                                'hsl(262.1 83.3% 57.8%)',
                                'hsl(24.6 95% 53.1%)',
                                'hsl(346.8 77.2% 49.8%)',
                            ].map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setAccentColor(color)}
                                    className={cn(
                                        "w-8 h-8 rounded-full transition-all border-2",
                                        accentColor === color ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                                    )}
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <BarChart3 size={16} />
                            Token Usage
                        </label>
                        <div className="bg-secondary/30 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Total Tokens:</span>
                                <span className="text-sm font-semibold text-primary">{formatNumber(stats.totalTokens)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Session Tokens:</span>
                                <span className="text-sm font-medium">{formatNumber(stats.sessionTokens)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Messages Sent:</span>
                                <span className="text-sm font-medium">{formatNumber(stats.messagesCount)}</span>
                            </div>
                            <div className="pt-2 border-t border-border/50 flex gap-2">
                                <button
                                    onClick={resetSession}
                                    className="flex-1 bg-secondary/50 hover:bg-secondary/70 rounded-lg px-3 py-2 text-xs transition-all flex items-center justify-center gap-1"
                                >
                                    <RefreshCw size={12} />
                                    Reset Session
                                </button>
                                <button
                                    onClick={resetStats}
                                    className="flex-1 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg px-3 py-2 text-xs transition-all"
                                >
                                    Reset All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50 text-center">
                    <div className="text-xs text-muted-foreground">
                        Perplexity Client <span className="text-primary">v3.0.0</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
