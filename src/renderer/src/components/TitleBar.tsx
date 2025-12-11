import { Minus, X, Maximize2, Minimize2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [cpuUsage, setCpuUsage] = useState(0)

    useEffect(() => {
        const handleResize = () => {
        }
        window.addEventListener('resize', handleResize)

        window.addEventListener('resize', handleResize)

        if (window.api && window.api.onCpuUsageUpdate) {
            window.api.onCpuUsageUpdate((usage) => {
                setCpuUsage(usage)
            })
        }

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleMinimize = () => {
        window.api.minimize()
    }

    const handleMaximize = () => {
        window.api.maximize()
        setIsMaximized(!isMaximized)
    }

    const handleClose = () => {
        window.api.close()
    }



    const hue = Math.max(0, 120 - (cpuUsage * 1.2))
    const color = `hsl(${hue}, 100%, 50%)`

    return (
        <div
            className="h-10 bg-background flex items-center justify-between select-none z-50 border-b border-border/40 drag-region px-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex items-center gap-2 no-drag-region w-20">
                <button
                    onClick={handleClose}
                    className="w-4 h-4 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 border border-[#E0443E] flex items-center justify-center group transition-all"
                >
                    <X size={10} className={`text-black/60 opacity-0 ${isHovered ? 'opacity-100' : ''}`} />
                </button>
                <button
                    onClick={handleMinimize}
                    className="w-4 h-4 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 border border-[#D8A213] flex items-center justify-center group transition-all"
                >
                    <Minus size={10} className={`text-black/60 opacity-0 ${isHovered ? 'opacity-100' : ''}`} />
                </button>
                <button
                    onClick={handleMaximize}
                    className="w-4 h-4 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 border border-[#1AAB29] flex items-center justify-center group transition-all"
                >
                    {isMaximized ? (
                        <Minimize2 size={10} className={`text-black/60 opacity-0 ${isHovered ? 'opacity-100' : ''}`} />
                    ) : (
                        <Maximize2 size={10} className={`text-black/60 opacity-0 ${isHovered ? 'opacity-100' : ''}`} />
                    )}
                </button>
            </div>

            <div className="flex-1 flex justify-center items-center pointer-events-none">
                <span className="text-sm font-medium text-muted-foreground/80">Perplexity</span>
            </div>

            <div className="w-20 flex justify-end items-center pr-2">
                <div
                    className="w-1.5 h-1.5 rounded-full transition-colors duration-500 shadow-[0_0_6px_currentColor]"
                    style={{ backgroundColor: color, color: color }}
                    title={`CPU Usage: ${cpuUsage.toFixed(1)}%`}
                />
            </div>

            <style>{`
                .drag-region {
                    -webkit-app-region: drag;
                }
                .no-drag-region {
                    -webkit-app-region: no-drag;
                }
            `}</style>
        </div>
    )
}
