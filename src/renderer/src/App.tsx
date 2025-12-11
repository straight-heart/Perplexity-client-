import { useState, useEffect, useRef } from 'react'
import { Sidebar } from './components/Sidebar'
import { TitleBar } from './components/TitleBar'
import { MessageBubble } from './components/MessageBubble'
import { InputArea } from './components/InputArea'
import { SettingsModal } from './components/SettingsModal'
import { Menu } from 'lucide-react'
import { useStats } from './contexts/StatsContext'
import { useChat, Message } from './contexts/ChatContext'
import { cn } from './lib/utils'

import { ModelSelector } from './components/ModelSelector'
import { SpotlightSpan } from './components/SpotlightSpan'
import { CommandPalette } from './components/CommandPalette'

function App(): JSX.Element {
    const [apiKey, setApiKey] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('selectedModel') || 'sonar')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    useEffect(() => {
        localStorage.setItem('selectedModel', selectedModel)
    }, [selectedModel])

    const [streamingContent, setStreamingContent] = useState('')
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [showDiscordPopup, setShowDiscordPopup] = useState(false)
    const [isPaletteOpen, setIsPaletteOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key === 'k') {
                e.preventDefault()
                setIsPaletteOpen(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const abortControllerRef = useRef<AbortController | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const { addTokens, incrementMessages } = useStats()
    const { chats, currentChatId, createChat, updateCurrentChatMessages, systemPrompt } = useChat()

    const currentChat = chats.find(c => c.id === currentChatId)
    const messages = currentChat?.messages || []

    useEffect(() => {
        if (!currentChatId && chats.length === 0) {
            createChat()
        }
    }, [currentChatId, chats, createChat])

    const [placeholderIndex, setPlaceholderIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    const placeholders = [
        { text: 'Create', highlight: 'a web app' },
        { text: 'Explain', highlight: 'quantum physics' },
        { text: 'Debug', highlight: 'my life choices' },
        { text: 'Summon', highlight: 'a demon' },
        { text: 'Center', highlight: 'a div' },
        { text: 'Exit', highlight: 'vim' },
        { text: 'Delete', highlight: 'production db' },
        { text: 'Hack', highlight: 'the mainframe' },
        { text: 'Install', highlight: 'gentoo' },
        { text: 'Download', highlight: 'more RAM' },
        { text: 'Fix', highlight: 'the printer' },
        { text: 'Find', highlight: 'Carmen Sandiego' },
        { text: 'Solve', highlight: 'P vs NP' },
        { text: 'Write', highlight: 'clean code' },
        { text: 'Understand', highlight: 'politics' },
        { text: 'Cook', highlight: 'meth (breaking bad style)' },
        { text: 'Bake', highlight: 'cookies' },
        { text: 'Generate', highlight: 'infinite money' },
        { text: 'Bypass', highlight: 'the firewall' },
        { text: 'Invert', highlight: 'a binary tree' },
        { text: 'Travel', highlight: 'to Mars' },
        { text: 'Buy', highlight: 'bitcoin in 2010' },
        { text: 'Sell', highlight: 'NFTs' },
        { text: 'Mint', highlight: 'a token' },
        { text: 'Deploy', highlight: 'on Friday' },
        { text: 'Push', highlight: 'to master' },
        { text: 'Git', highlight: 'blame' },
        { text: 'Sudo', highlight: 'rm -rf /' },
        { text: 'Ping', highlight: 'google.com' },
        { text: 'Trace', highlight: 'the IP' },
        { text: 'Enhance', highlight: 'the image' },
        { text: 'Zoom', highlight: 'in' },
        { text: 'Rotate', highlight: 'the owl' },
        { text: 'Draw', highlight: 'the rest of the owl' },
        { text: 'Find', highlight: 'Waldo' },
        { text: 'Prove', highlight: 'Riemann Hypothesis' },
        { text: 'Divide', highlight: 'by zero' },
        { text: 'Calculate', highlight: 'pi to last digit' },
        { text: 'Parse', highlight: 'HTML with regex' },
        { text: 'Train', highlight: 'an AI' },
        { text: 'Steal', highlight: 'the declaration of independence' },
        { text: 'Compose', highlight: 'a twitter thread' },
        { text: 'Write', highlight: 'a linkedin post' },
        { text: 'Optimize', highlight: 'the algorithm' },
        { text: 'Refactor', highlight: 'legacy code' },
        { text: 'Migrate', highlight: 'to microservices' },
        { text: 'Scale', highlight: 'to infinity' },
        { text: 'Dockerize', highlight: 'my toaster' },
        { text: 'Kubernetes', highlight: 'everything' },
        { text: 'Blockchain', highlight: 'for pets' },
        { text: 'Machine Learning', highlight: 'for cats' },
        { text: 'NFT', highlight: 'for rocks' },
        { text: 'Metaverse', highlight: 'real estate' },
        { text: 'Web3', highlight: 'is the future' },
        { text: 'Crypto', highlight: 'crash course' },
        { text: 'Stonks', highlight: 'only go up' },
        { text: 'Diamond', highlight: 'hands' },
        { text: 'Paper', highlight: 'hands' },
        { text: 'To', highlight: 'the moon' },
        { text: 'Wen', highlight: 'lambo' },
        { text: 'Ask', highlight: 'Jeeves' },
        { text: 'Google', highlight: 'it' },
        { text: 'Bing', highlight: 'chilling' },
        { text: 'DuckDuck', highlight: 'Go' },
        { text: 'Yahoo', highlight: 'Answers' },
        { text: 'Stack', highlight: 'Overflow' },
        { text: 'Copy', highlight: 'paste' },
        { text: 'Ctrl', highlight: 'C' },
        { text: 'Ctrl', highlight: 'V' },
        { text: 'Alt', highlight: 'F4' },
        { text: 'System', highlight: '32' },
        { text: 'Blue', highlight: 'Screen of Death' },
        { text: '404', highlight: 'Not Found' },
        { text: '500', highlight: 'Internal Server Error' },
        { text: 'Tea', highlight: 'Earl Grey, Hot' },
        { text: 'Beam', highlight: 'me up' },
        { text: 'Live', highlight: 'long and prosper' },
        { text: 'May', highlight: 'the force be with you' },
        { text: 'I am', highlight: 'your father' },
        { text: 'Winter', highlight: 'is coming' },
        { text: 'You know', highlight: 'nothing Jon Snow' },
        { text: 'Hold', highlight: 'the door' },
        { text: 'Dracarys', highlight: 'burn it all' },
        { text: 'Expecto', highlight: 'Patronum' },
        { text: 'Wingardium', highlight: 'Leviosa' },
        { text: 'Avada', highlight: 'Kedavra' },
        { text: 'My', highlight: 'precious' },
        { text: 'One', highlight: 'does not simply' },
        { text: 'Run', highlight: 'you fools' },
        { text: 'Keep', highlight: 'it secret' },
        { text: 'Keep', highlight: 'it safe' },
        { text: 'Hello', highlight: 'World' },
        { text: 'Console', highlight: 'log' },
        { text: 'Return', highlight: 'void' },
        { text: 'Import', highlight: 'lodash' },
        { text: 'Export', highlight: 'default' },
        { text: 'Async', highlight: 'await' },
        { text: 'Promise', highlight: 'pending' },
        { text: 'Null', highlight: 'pointer exception' },
        { text: 'Undefined', highlight: 'is not a function' },
        { text: 'NaN', highlight: 'Batman' },
        { text: 'Object', highlight: 'Object' },
        { text: 'Array', highlight: 'Index Out Of Bounds' },
        { text: 'Segmentation', highlight: 'Fault' },
        { text: 'Buffers', highlight: 'overflowing' },
        { text: 'Memory', highlight: 'leaking' },
        { text: 'Garbage', highlight: 'collection' },
        { text: 'Deadlock', highlight: 'detected' },
        { text: 'Race', highlight: 'condition' },
        { text: 'Infinite', highlight: 'loop' },
        { text: 'Recursion', highlight: 'recursion recursion' },
        { text: 'Stack', highlight: 'trace' },
        { text: 'Core', highlight: 'dumped' },
        { text: 'Kernel', highlight: 'panic' }
    ]

    useEffect(() => {
        if (messages.length > 0) return

        const interval = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setPlaceholderIndex((prev) => (prev + 1) % placeholders.length)
                setIsAnimating(false)
            }, 500)
        }, 4000)

        return () => clearInterval(interval)
    }, [messages.length])

    const fetchApiKey = async () => {
        try {
            if (window.api) {
                const key = await window.api.getApiKey()
                setApiKey(key)
            }
        } catch (error) {
            console.error('Failed to fetch API key:', error)
            setApiKey('')
        }
    }

    useEffect(() => {
        fetchApiKey()
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, streamingContent])

    const handleSend = async (content: string, attachment?: { type: 'image' | 'text', content: string, name: string }) => {
        if (!apiKey) return

        if (!currentChatId) {
            createChat()
        }

        let validHistory = [...messages]
        if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === 'user') {
            validHistory.pop()
        }

        const newMessages: Message[] = [...validHistory, {
            role: 'user',
            content,
            replyTo: replyingTo || undefined,
            attachment
        }]
        updateCurrentChatMessages(newMessages)
        setIsLoading(true)
        setStreamingContent('')
        incrementMessages()

        abortControllerRef.current = new AbortController()

        try {
            const apiMessages = newMessages.map(m => {
                let content: any = m.content

                if (m.replyTo) {
                    content = `> ${m.replyTo.split('\n').join('\n> ')}\n\n${content}`
                }

                if (m.attachment) {
                    if (m.attachment.type === 'image') {
                        content = [
                            { type: 'text', text: content },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: m.attachment.content
                                }
                            }
                        ]
                    } else if (m.attachment.type === 'text') {
                        content = `${content}\n\n--- Attached File: ${m.attachment.name} ---\n${m.attachment.content}`
                    }
                }

                return { role: m.role, content }
            })

            if (systemPrompt.trim()) {
                apiMessages.unshift({ role: 'system' as any, content: systemPrompt })
            }

            const response = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: apiMessages,
                    stream: true
                }),
                signal: abortControllerRef.current.signal
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`)
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) throw new Error('No response body')

            let accumulatedContent = ''
            let totalTokens = 0

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(6))
                            const content = data.choices[0]?.delta?.content || ''
                            accumulatedContent += content
                            setStreamingContent(accumulatedContent)

                            if (data.usage) {
                                totalTokens = data.usage.total_tokens || 0
                            }
                        } catch (e) {
                            console.error('Error parsing chunk', e)
                        }
                    }
                }
            }

            const estimatedTokens = totalTokens || Math.ceil(
                (content.length + accumulatedContent.length) / 4
            )
            addTokens(estimatedTokens)

            updateCurrentChatMessages([...newMessages, { role: 'assistant', content: accumulatedContent }])
            setStreamingContent('')
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Chat error:', error)
                updateCurrentChatMessages([...newMessages, { role: 'assistant', content: `Error: ${error.message}` }])
            }
        } finally {
            setIsLoading(false)
            setStreamingContent('')
            abortControllerRef.current = null
        }
    }

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            setIsLoading(false)
            if (streamingContent) {
                updateCurrentChatMessages([...messages, { role: 'assistant', content: streamingContent }])
                setStreamingContent('')
            }
        }
    }

    const handleReply = (content: string) => {
        setReplyingTo(content)
    }

    const handleCancelReply = () => {
        setReplyingTo(null)
    }

    return (
        <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden transition-colors duration-300 select-none">
            <TitleBar />

            <div className="flex-1 flex overflow-hidden">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                />

                <div className="flex-1 flex flex-col h-full relative">
                    <div className="absolute top-2 left-2 z-50">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-background/50 backdrop-blur-md border border-border/20 shadow-sm rounded-lg transition-all hover:bg-secondary/80 text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95"
                        >
                            <Menu size={20} />
                        </button>
                    </div>

                    <ModelSelector
                        selectedModel={selectedModel}
                        onModelChange={setSelectedModel}
                    />

                    <div className="flex-1 overflow-y-auto scroll-smooth bg-background select-text">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center p-4 text-center select-none">
                                <div className="text-4xl md:text-5xl font-bold mb-6 text-foreground flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "transition-all duration-500 ease-in-out transform",
                                        isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                                    )}>
                                        <span>{placeholders[placeholderIndex].text} </span>
                                        <SpotlightSpan className="px-6 py-2 cursor-default whitespace-nowrap">
                                            {placeholders[placeholderIndex].highlight}
                                        </SpotlightSpan>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Made with ❤️ by{' '}
                                    <button
                                        onClick={() => setShowDiscordPopup(true)}
                                        className="hover:text-primary hover:underline transition-colors focus:outline-none"
                                    >
                                        ronny.ciao
                                    </button>
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <MessageBubble
                                key={idx}
                                role={msg.role}
                                content={msg.content}
                                replyTo={msg.replyTo}
                                attachment={msg.attachment}
                                onReply={handleReply}
                            />
                        ))}

                        {isLoading && !streamingContent && (
                            <MessageBubble
                                role="assistant"
                                content=""
                                isThinking={true}
                            />
                        )}

                        {streamingContent && (
                            <MessageBubble
                                role="assistant"
                                content={streamingContent}
                                isStreaming={true}
                                onReply={handleReply}
                            />
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <div className="flex-shrink-0 border-t border-border bg-card/50 backdrop-blur-sm">
                        <InputArea
                            onSend={handleSend}
                            onStop={handleStop}
                            isLoading={isLoading}
                            replyingTo={replyingTo}
                            onCancelReply={handleCancelReply}
                        />
                    </div>
                </div>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onApiKeyChange={fetchApiKey}
            />

            {showDiscordPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card border border-border p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center gap-4">
                            <h3 className="text-xl font-bold mt-2">Add me on discord!</h3>
                            <p className="text-muted-foreground">
                                Username: <span className="font-mono font-bold text-foreground select-all">ronny.ciao</span>
                            </p>
                            <button
                                onClick={() => setShowDiscordPopup(false)}
                                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                            >
                                ok dude
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CommandPalette
                isOpen={isPaletteOpen}
                onClose={() => setIsPaletteOpen(false)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onModelChange={setSelectedModel}
            />
        </div>
    )
}

export default App
