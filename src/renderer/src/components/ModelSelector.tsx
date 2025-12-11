import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Zap, Brain, Sparkles, Cpu } from 'lucide-react'
import { cn } from '../lib/utils'
import { MODELS } from '../lib/constants'

interface ModelSelectorProps {
    selectedModel: string
    onModelChange: (model: string) => void
}

export function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const currentModel = MODELS.find(m => m.id === selectedModel) || MODELS[0]

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                !buttonRef.current?.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])



    const getModelIcon = (id: string) => {
        if (id.includes('reasoning')) return <Brain size={16} />
        if (id.includes('pro')) return <Sparkles size={16} />
        return <Zap size={16} />
    }

    return (
        <div className="relative flex justify-center py-2 z-40 bg-gradient-to-b from-background to-transparent">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200",
                    "bg-secondary/30 hover:bg-secondary/60 border border-border/50 hover:border-border",
                    "text-sm font-medium text-muted-foreground hover:text-foreground",
                    isOpen && "bg-secondary/60 text-foreground border-border ring-2 ring-primary/20"
                )}
            >
                <div className="text-primary opacity-80">
                    {getModelIcon(currentModel.id)}
                </div>
                <span>{currentModel.name}</span>
                <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className="absolute top-full mt-2 w-[400px] bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2"
                >
                    <div className="flex flex-col gap-1">
                        {MODELS.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onModelChange(model.id)
                                    setIsOpen(false)
                                }}
                                className={cn(
                                    "relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left group",
                                    selectedModel === model.id
                                        ? "bg-secondary/60"
                                        : "hover:bg-secondary/30"
                                )}
                            >

                                <div className={cn(
                                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-300",
                                    selectedModel === model.id ? "bg-primary" : "bg-transparent scale-y-0 group-hover:scale-y-50 group-hover:bg-primary/30"
                                )} />

                                <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                                    selectedModel === model.id ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground group-hover:text-foreground"
                                )}>
                                    {getModelIcon(model.id)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={cn(
                                            "font-medium text-sm transition-colors",
                                            selectedModel === model.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                                        )}>
                                            {model.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-background/50 text-muted-foreground border border-border/50">
                                                {model.badge}
                                            </span>
                                            {selectedModel === model.id && <Check size={14} className="text-primary" />}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1 group-hover:line-clamp-none transition-all">
                                        {model.description}
                                    </p>

                                    <div className="mt-3 flex items-center gap-2">
                                        <Cpu size={10} className="text-muted-foreground/50" />
                                        <div className="flex-1 h-1 bg-secondary/50 rounded-full overflow-hidden flex gap-0.5">
                                            {Array.from({ length: 4 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={cn(
                                                        "h-full flex-1 rounded-full transition-all duration-500",
                                                        i < model.complexity
                                                            ? (selectedModel === model.id ? "bg-primary animate-pulse" : "bg-primary/50")
                                                            : "bg-transparent"
                                                    )}
                                                    style={{
                                                        animationDelay: `${i * 100}ms`,
                                                        opacity: i < model.complexity ? 1 : 0.1
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground/70 font-mono">
                                            {['Low', 'Medium', 'High', 'Max'][model.complexity - 1]} Load
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
