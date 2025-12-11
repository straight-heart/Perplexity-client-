import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { User, Bot, Copy, Maximize2, Quote, Check, FileText, Download } from 'lucide-react'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '../lib/utils'

SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('python', python)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('json', json)

interface MessageBubbleProps {
    role: 'user' | 'assistant'
    content: string
    isStreaming?: boolean
    onReply?: (content: string) => void
    replyTo?: string
    attachment?: {
        type: 'image' | 'text'
        content: string
        name: string
    }
    isThinking?: boolean
}

export function MessageBubble({ role, content, isStreaming, onReply, replyTo, attachment, isThinking }: MessageBubbleProps) {
    const isUser = role === 'user'
    const [isExpanded, setIsExpanded] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleExpand = () => {
        setIsExpanded(true)
    }

    return (
        <>
            <div className={cn(
                "group w-full py-8 px-4 relative hover:bg-secondary/10 transition-colors",
                isUser ? "bg-background" : "bg-muted/30"
            )}>
                <div className="max-w-4xl mx-auto flex gap-6">
                    <div className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm",
                        isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground border-2 border-border"
                    )}>
                        {isUser ? (
                            <User size={20} />
                        ) : (
                            <Bot size={20} />
                        )}
                    </div>

                    <div className="flex-1 min-w-0 pt-1 group/content">
                        <div className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide flex justify-between items-center">
                            <span>{isUser ? 'You' : 'Assistant'}</span>

                            {!isStreaming && !isThinking && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                                        title="Copy"
                                    >
                                        {copied ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                    <button
                                        onClick={handleExpand}
                                        className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                                        title="Expand"
                                    >
                                        <Maximize2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => onReply?.(content)}
                                        className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                                        title="Reply"
                                    >
                                        <Quote size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {replyTo && (
                            <div className="mb-3 pl-3 border-l-2 border-primary/50 text-sm text-muted-foreground bg-secondary/20 rounded-r-lg p-2">
                                <div className="text-xs font-medium text-primary mb-1">Replying to:</div>
                                <div className="line-clamp-2">{replyTo}</div>
                            </div>
                        )}

                        {attachment && (
                            <div className="mb-4">
                                {attachment.type === 'image' ? (
                                    <div className="rounded-xl overflow-hidden border border-border/50 max-w-sm">
                                        <img src={attachment.content} alt={attachment.name} className="w-full h-auto" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border/50 max-w-sm">
                                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border/50">
                                            <FileText size={20} className="text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{attachment.name}</div>
                                            <div className="text-xs text-muted-foreground">Text File</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="text-foreground leading-7">
                            {isThinking ? (
                                <div className="flex items-center gap-1 h-7">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce-delay-1" />
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce-delay-2" />
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce-delay-3" />
                                </div>
                            ) : isUser ? (
                                <div className="whitespace-pre-wrap select-text">{content}</div>
                            ) : (
                                <div className="prose prose-sm select-text">
                                    <ReactMarkdown
                                        components={{
                                            a: ({ node, ...props }) => (
                                                <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" />
                                            ),
                                            pre: ({ children }) => <>{children}</>,
                                            code({ node, inline, className, children, ...props }: any) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                const codeString = String(children).replace(/\n$/, '')
                                                const language = match?.[1] || 'text'

                                                const copyCode = () => {
                                                    navigator.clipboard.writeText(codeString)
                                                }

                                                const downloadCode = () => {
                                                    const blob = new Blob([codeString], { type: 'text/plain' })
                                                    const url = URL.createObjectURL(blob)
                                                    const a = document.createElement('a')
                                                    a.href = url
                                                    a.download = `snippet.${language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language}`
                                                    document.body.appendChild(a)
                                                    a.click()
                                                    document.body.removeChild(a)
                                                    URL.revokeObjectURL(url)
                                                }

                                                return !inline && match ? (
                                                    <div className="rounded-lg overflow-hidden my-4 border border-border/50 bg-secondary/30 relative max-w-full">
                                                        <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border/50 text-xs text-muted-foreground font-mono select-none">
                                                            <div className="flex items-center gap-2">
                                                                <span className="uppercase">{language}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <button
                                                                    onClick={copyCode}
                                                                    className="flex items-center gap-1 hover:text-foreground transition-colors p-1 rounded hover:bg-background/50"
                                                                    title="Copy Code"
                                                                >
                                                                    <Copy size={12} />
                                                                    <span>Copy</span>
                                                                </button>
                                                                <button
                                                                    onClick={downloadCode}
                                                                    className="flex items-center gap-1 hover:text-foreground transition-colors p-1 rounded hover:bg-background/50"
                                                                    title="Download Code"
                                                                >
                                                                    <Download size={12} />
                                                                    <span>Download</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="overflow-x-auto">
                                                            <SyntaxHighlighter
                                                                {...props}
                                                                style={vscDarkPlus}
                                                                language={language}
                                                                PreTag="div"
                                                                customStyle={{
                                                                    margin: 0,
                                                                    padding: '1.5rem',
                                                                    background: 'transparent',
                                                                    fontSize: '0.9rem',
                                                                    lineHeight: '1.5',
                                                                    minWidth: '100%'
                                                                }}
                                                            >
                                                                {codeString}
                                                            </SyntaxHighlighter>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <code {...props} className={cn("bg-secondary/50 px-1.5 py-0.5 rounded text-sm font-mono text-primary", className)}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                    {isStreaming && (
                                        <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse rounded-sm" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-semibold">Message Details</h3>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            >
                                <span className="text-xl">×</span>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="prose max-w-none">
                                {isUser ? (
                                    <div className="whitespace-pre-wrap">{content}</div>
                                ) : (
                                    <ReactMarkdown>{content}</ReactMarkdown>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
