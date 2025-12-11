import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { StatsProvider } from './contexts/StatsContext'
import { ChatProvider } from './contexts/ChatContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider>
            <StatsProvider>
                <ChatProvider>
                    <App />
                </ChatProvider>
            </StatsProvider>
        </ThemeProvider>
    </React.StrictMode>
)
