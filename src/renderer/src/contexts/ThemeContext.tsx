import React, { createContext, useContext, useState, useEffect } from 'react'

export type Theme = 'dark' | 'light' | 'night' | 'oled' | 'warm' | 'lofi' | 'macha' | 'midnight' | 'forest' | 'sunset' | 'ocean' | 'terminal' | 'synthwave' | 'nord' | 'dracula' | 'coffee'

interface ThemeContextType {
    theme: Theme
    setTheme: (theme: Theme) => void
    accentColor: string
    setAccentColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const THEME_DEFAULTS: Record<Theme, string> = {
    dark: 'hsl(0 84.2% 60.2%)',
    light: 'hsl(0 72.2% 50.6%)',
    night: 'hsl(263.4 70% 50.4%)',
    oled: 'hsl(0 0% 100%)',
    warm: 'hsl(24.6 95% 53.1%)',
    lofi: 'hsl(256 42% 50%)',
    macha: 'hsl(142.1 76.2% 36.3%)',
    midnight: 'hsl(210 100% 60%)',
    forest: 'hsl(140 60% 50%)',
    sunset: 'hsl(20 90% 60%)',
    ocean: 'hsl(180 80% 50%)',
    terminal: 'hsl(120 100% 50%)',
    synthwave: 'hsl(320 100% 60%)',
    nord: 'hsl(193 43% 67%)',
    dracula: 'hsl(0 100% 67%)', // Dracula Red
    coffee: 'hsl(35 40% 60%)'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme')
        return (saved as Theme) || 'dark'
    })

    const [accentColor, setAccentColorState] = useState<string>(() => {
        const saved = localStorage.getItem('accentColor')
        return saved || 'hsl(0 84.2% 60.2%)' // Default red
    })

    // Export this for use in UI components


    useEffect(() => {
        localStorage.setItem('theme', theme)
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    useEffect(() => {
        localStorage.setItem('accentColor', accentColor)
        const match = accentColor.match(/hsl\((.*?)\)/)
        const colorValue = match ? match[1] : accentColor

        document.documentElement.style.setProperty('--primary', colorValue)
        document.documentElement.style.setProperty('--ring', colorValue)
        document.documentElement.style.setProperty('--accent', colorValue)
    }, [accentColor])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        const defaultColor = THEME_DEFAULTS[newTheme]
        if (defaultColor) {
            setAccentColorState(defaultColor)
        }
    }

    const setAccentColor = (color: string) => {
        setAccentColorState(color)
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}
