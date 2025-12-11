import { useRef, useState, useEffect } from 'react'
import { cn } from '../lib/utils'

interface SpotlightSpanProps {
    children: React.ReactNode
    className?: string
}

export function SpotlightSpan({ children, className }: SpotlightSpanProps) {
    const divRef = useRef<HTMLSpanElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const [opacity, setOpacity] = useState(0)
    const [isPressed, setIsPressed] = useState(false)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!divRef.current) return

            const rect = divRef.current.getBoundingClientRect()
            setPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            })
            setOpacity(1)
        }

        const handleMouseLeaveWindow = () => {
            setOpacity(0)
        }

        window.addEventListener('mousemove', handleMouseMove)
        document.documentElement.addEventListener('mouseleave', handleMouseLeaveWindow)
        document.documentElement.addEventListener('mouseenter', () => setOpacity(1))

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            document.documentElement.removeEventListener('mouseleave', handleMouseLeaveWindow)
            document.documentElement.removeEventListener('mouseenter', () => setOpacity(1))
        }
    }, [])

    const handleMouseDown = () => {
        setIsPressed(true)
    }

    const handleMouseUp = () => {
        setIsPressed(false)
    }



    const handleMouseLeaveEl = () => {
        setIsPressed(false)
    }

    return (
        <span
            ref={divRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeaveEl}

            className={cn(
                "relative inline-flex items-center justify-center overflow-hidden rounded-full transition-colors duration-200",
                "border border-transparent select-none cursor-default active:scale-95 transition-transform",
                isPressed
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-primary/20 text-primary",
                className
            )}
        >
            <span
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                    opacity: isPressed ? 0 : opacity,
                    transition: 'opacity 0.2s ease',
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    padding: '2px',

                    background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, hsl(var(--primary)), transparent 60%)`
                }}
            />

            <span className="relative z-10 pointer-events-none">{children}</span>
        </span>
    )
}
