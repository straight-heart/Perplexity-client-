import { useState, useRef, useEffect } from 'react'
import { ArrowUp, Square, Paperclip, X, FileText } from 'lucide-react'
import { cn } from '../lib/utils'

interface Attachment {
    type: 'image' | 'text'
    content: string
    name: string
    size: number
}

interface InputAreaProps {
    onSend: (content: string, attachment?: Attachment) => void
    onStop: () => void
    isLoading: boolean
    replyingTo?: string | null
    onCancelReply?: () => void
}
export function InputArea({ onSend, onStop, isLoading, replyingTo, onCancelReply }: InputAreaProps) {
    const [input, setInput] = useState('')
    const [attachment, setAttachment] = useState<Attachment | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [suggestion, setSuggestion] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const SUGGESTIONS = [
        "Why do cats look at you like that?",
        "How to convince my dog I'm actually the alpha",
        "Is cereal soup? deeply analyze",
        "Why do we press harder on the remote when the batteries are dead?",
        "Where do missing socks go?",
        "Can a kangaroo jump higher than a house?",
        "Why is pizza round but the box square?",
        "If tomato is a fruit, is ketchup a smoothie?",
        "How to act normal in public",
        "Why do we say 'heads up' when we duck?",
        "Is a hotdog a sandwich? (The final verdict)",
        "Why is it called a building if it's already built?",
        "Why do we park on driveways and drive on parkways?",
        "If I punch myself and it hurts, am I weak or strong?",
        "Do fish get thirsty?",
        "Why isn't phonetic spelled phonetically?",
        "Who taught the first teacher?",
        "Why is the alphabet in that order?",
        "If money doesn't grow on trees, why do banks have branches?",
        "Why do feet smell and noses run?",
        "Why is 'abbreviation' such a long word?",
        "Do crabs think fish are flying?",
        "Why is there a 'd' in fridge but not in refrigerator?",
        "If I melt dry ice, can I swim without getting wet?",
        "Why do we click tongs twice before using them?",
        "How to politely ask a ghost to leave",
        "Why do round pizzas come in square boxes?",
        "Why is it called 'shipping' if it goes by truck?",
        "If you try to fail, and succeed, which have you done?",
        "Why isn't 11 pronounced onety-one?",
        "Do blind people see black or nothing?",
        "Why do we bake cookies and cook bacon?",
        "If you clean a vacuum, you become a vacuum cleaner",
        "Why is called 'rush hour' when nothing moves?",
        "Can I legally adopt a raccoon?",
        "How to train a dragon (for real)",
        "Why do we sing 'Take Me Out to the Ball Game' when we're already there?",
        "When did time actually start?",
        "Are we living in a simulation?",
        "How to survive a zombie apocalypse (walmart strategy)",
        "Why does nothing rhyme with orange?",
        "If corn oil is made from corn, what is baby oil made from?",
        "How to make water not wet",
        "Why is the sky blue (wrong answers only)",
        "If I eat a clock, will it be time consuming?",
        "Why do scuba divers fall backwards off the boat?",
        "Can I teach my cat to do my taxes?",
        "How to build a time machine using household items",
        "Why do we wash bath towels? Aren't we clean when we use them?",
        "If a word is misspelled in the dictionary, how would we know?",
        "Why do we call it a pair of pants but only one bra?",
        "If I get a second degree burn, do I get a diploma?",
        "Why is looking for glasses without glasses so hard?",
        "How to talk to plants so they grow faster",
        "Why do we put suits in garment bags and garments in suitcases?",
        "Is it possible to sneeze with your eyes open?",
        "Why aren't blueberrys blue?",
        "How to become a professional napper",
        "Why do we drive on parkways and park on driveways?",
        "If nothing is impossible, is it impossible to do nothing?",
        "Why is 'palindrome' not a palindrome?",
        "Who decided that a clock moves clockwise?",
        "Why are boxing rings square?",
        "If I buy a new boomerang, how do I throw the old one away?",
        "Why do we say 'after dark' when it's really after light?",
        "If a turtle loses its shell, is it naked or homeless?",
        "How to convince people I'm a time traveler",
        "Why do we play in recitals and recite in plays?",
        "If I'm transparent, can you see right through me?",
        "How to fold a fitted sheet (mission impossible)",
        "Why is it called quicksand if it works slowly?",
        "If I replace all the parts of my car, is it still my car?",
        "How to win an argument with a toddler",
        "Why does glue not stick to the bottle?",
        "If I have x-ray vision, can I see through my eyelids?",
        "How to unsubscribe from adulthood",
        "Why is it called a 'tv set' when there's only one?",
        "If I weigh 99 lbs and eat 1 lb of nachos, am I 1% nacho?",
        "How to become a meme lord",
        "Why do we have finger tips but not toe tips?",
        "If I steal a Tesla, is it an Edison?",
        "How to interpret my cat's meows",
        "Why do we call it a 'crash' landing?",
        "If I paint a red rose white, is it a white rose?",
        "How to evade taxes (hypothetically)",
        "Why is the third hand on a watch called the second hand?",
        "If I drink half a 5 hour energy, do I get 2.5 hours of energy?",
        "How to stop procrastinating... tomorrow",
        "Why do we say 'sleep like a baby' when babies wake up every 2 hours?",
        "If I work as security at a Samsung store, am I a Guardian of the Galaxy?",
        "How to legally change my name to 'Batman'",
        "Why do we call them 'apartments' when they are stuck together?",
        "If I get scared half to death twice, what happens?",
        "How to tell if my plant is judging me",
        "Why is it called a 'hamburger' if there's no ham?",
        "If I buy a 3D printer, can I print another 3D printer?",
        "How to make my wifi faster by yelling at it",
        "Why do we say 'screens' when they are flat?",
        "If I hold my breath, will I stop time?",
        "How to convince my boss I'm working when I'm not",
        "Why is the pizza box square if the pizza is round?",
        "If I tell you I'm lying, am I telling the truth?",
        "How to speak whale",
        "Why do we call it 'rush hour' when everyone is stopped?",
        "If I clone myself, is it incest to date my clone?",
        "How to optimize my sleep schedule for maximum chaos",
        "Why do we call it a 'pencil' if it has no lead?",
        "If I eat a magnet, will I become attractive?",
        "How to find the end of a rainbow",
        "Why do we have 'drive-thru' banks?",
        "If I run backwards, do I gain weight?",
        "How to be cool",
        "Why do we cook bacon and bake cookies?",
        "If I get a haircut, where does the cut go?",
        "How to make friends with a crow",
        "Why is it called 'lipstick' if you can't stick your lips?",
        "If I catch a cold, can I throw it back?",
        "How to verify if I'm a robot",
        "Why do we say 'cheese' when taking a photo?",
        "If I eat a polar bear liver, will I die?",
        "How to open a banana like a monkey",
        "Why do we have eyebrows?",
        "If I sleep on a corduroy pillow, will I make headlines?",
        "How to calculate the trajectory of a thrown chancla",
        "Why is it called 'standup' comedy if you can sit?",
        "If I buy a classic car, is it old or new?",
        "How to professionally resign from a family group chat",
        "Why do we call it a 'soundtrack' if it's on a movie?",
        "If I eat a Dictionary, will I find the right words?",
        "How to become invisible (asking for a friend)",
        "Why do we have wisdom teeth if they are stupid?",
        "If I get a patent for a time machine, when does it expire?",
        "How to explain the internet to a medieval peasant",
        "Why do we call it 'fast food' if we wait in line?",
        "If I watch a movie backwards, is it a prequel?",
        "How to properly apologize to a cat",
        "Why do we check the fridge when we know it's empty?",
        "If you are what you eat, am I a pizza?",
        "How to convince aliens to take me with them",
        "Why do we call it a 'pair' of scissors?",
        "If I swim in vinegar, do I become a pickle?",
        "How to organize a revolution against printers",
        "Why is 'literal' used figuratively?",
        "If I accidentally swallow ice, did I eat or drink?",
        "How to become a wizard in 3 easy steps",
        "Why do we press 'start' to turn off a computer?",
        "If I get a sunburn, am I cooked?",
        "How to locate the 'any' key",
        "Why is it called 'pineapple' if it has neither?",
        "If I have a thought, is it mine?",
        "How to debate a flat earther",
        "Why do we say 'break a leg'?",
        "If I drop soap on the floor, is the floor clean or the soap dirty?",
        "How to summon a pizza",
        "Why do we yawn?",
        "If there's a fork in the road, should I take it?",
        "How to delete my browser history from my brain",
        "Why do we cry when cutting onions?",
        "If I travel at the speed of light, can I turn on a flashlight?",
        "How to ask a question without asking a question",
        "Why do we have kneecaps?",
        "If I dig a hole to China, will I fall up?",
        "How to pet a porcupine safely",
        "Why do we have leap years?",
        "If I lose my memory, can I find it?",
        "How to make a decision without overthinking",
        "Why is the ocean salty?",
        "If I have a déjà vu, have I been here before?",
        "How to negotiate with a toddler",
        "Why do we have belly buttons?",
        "If I scream in space, will anyone hear me?",
        "How to catch a cloud",
        "Why do we have dreams?",
        "If I eat a rainbow, will I be colorful?",
        "How to fly without wings",
        "Why is the grass green?",
        "If I count sheep, will I fall asleep?",
        "How to find the meaning of life",
        "Why do we have emotions?",
        "If I touch a star, will I burn?",
        "How to stop time",
        "Why is the moon round?",
        "If I jump, will I land?",
        "How to breathe underwater",
        "Why do we have fingerprints?",
        "If I whisper, is it a secret?",
        "How to see the future",
        "Why do we ask questions?",
        "If I know everything, am I smart?",
        "How to be happy",
        "Why is love blind?",
        "If I follow my heart, where will it lead?",
        "How to find true love",
        "Why do we have friends?",
        "If I laugh, is it funny?",
        "How to make someone smile",
        "Why is music magic?",
        "If I dance, am I free?",
        "How to write a hit song",
        "Why do we like art?",
        "If I paint, am I an artist?",
        "How to become famous",
        "Why do we watch movies?",
        "If I act, am I playing a role?",
        "How to direct a film",
        "Why do we read books?",
        "If I write, am I an author?",
        "How to publish a bestseller",
        "Why do we play games?",
        "If I win, am I the best?",
        "How to level up in life",
        "Why is nature beautiful?",
        "If I plant a tree, will it grow?",
        "How to save the planet",
        "Why do we travel?",
        "If I explore, will I discover?",
        "How to see the world",
        "Why is history important?",
        "If I remember, will I learn?",
        "How to change the future",
        "Why is science cool?",
        "If I experiment, will I know?",
        "How to invent something",
        "Why is math useful?",
        "If I calculate, am I accurate?",
        "How to solve a puzzle",
        "Why is technology amazing?",
        "If I code, am I a creator?",
        "What is the capital of Italy?",
        "Who directed Jurassic Park?",
        "What is the density of gold?",
        "How to use kubernetes",
        "What is the largest desert?",
        "Who is the father of physics?",
        "What is the meaning of life?",
        "How to center a div (again)",
        "Why is javascript weird?",
        "How to cook pasta",
        "Best pizza toppings",
        "Top 10 movies of all time",
        "How to tie a tie",
        "Jokes to tell at a party",
        "Fun facts about octopuses",
        "How to learn guitar",
        "Best travel destinations",
        "How to make coffee",
        "History of the internet",
        "How to meditate",
        "Best books to read",
        "How to do a backflip",
        "Science fair ideas",
        "How to write a resume",
        "Gift ideas for mom",
        "How to change a tire",
        "Best video games 2024",
        "How to start a business",
        "Healthy breakfast recipes",
        "How to relieve stress",
        "Best obscure words",
        "How to build a birdhouse",
        "Facts about space",
        "How to learn a language",
        "Best podcasts to listen to",
        "How to paint watercolors",
        "DIY home decor",
        "How to grow tomatoes",
        "Best board games",
        "How to jungle in LoL",
        "Strategies for chess",
        "How to solve a rubik's cube",
        "Best hiking trails",
        "How to take good photos",
        "Yoga for beginners",
        "How to bake bread",
        "Best netflix shows",
        "How to budget money",
        "Origins of halloween",
        "How to knot a scarf",
        "Best dad jokes",
        "How to perform magic tricks",
        "Types of clouds",
        "How to read palm lines",
        "Best karaoke songs",
        "How to make slime",
        "History of chocolate",
        "How to play poker",
        "Best motivational quotes",
        "How to survive in the wild",
        "Urban legends",
        "How to write calligraphy",
        "Best dog breeds",
        "How to make sushi",
        "Planets in solar system",
        "How to compost",
        "Best classic cars",
        "How to knit",
        "Wonders of the world",
        "How to lucid dream",
        "Best super powers",
        "How to define success",
        "What is a black hole?",
        "How to be charismatic",
        "Best ice cream flavors",
        "How to make paper planes",
        "Symbols in dreams",
        "How to improve memory",
        "Best riddles"
    ]

    useEffect(() => {
        setSuggestion(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)])

        const interval = setInterval(() => {
            setSuggestion(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)])
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px'
        }
    }, [input])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Tab' && !input.trim() && !e.shiftKey) {
            e.preventDefault()
            setInput(suggestion)
            return
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if ((input.trim() || attachment) && !isLoading && !isProcessing) {
                handleSubmit()
            }
        }
    }

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const isImage = file.type.startsWith('image/')
        const isText = file.type === 'text/plain' || file.type === 'text/html'

        if (!isImage && !isText) {
            alert('Only images and text/html files are supported')
            return
        }

        setIsProcessing(true)

        setIsProcessing(true)

        await new Promise(resolve => setTimeout(resolve, 500))

        const reader = new FileReader()
        reader.onload = (e) => {
            const content = e.target?.result as string
            setAttachment({
                type: isImage ? 'image' : 'text',
                content,
                name: file.name,
                size: file.size
            })
            setIsProcessing(false)
        }

        reader.onerror = () => {
            setIsProcessing(false)
            alert('Error reading file')
        }

        if (isImage) {
            reader.readAsDataURL(file)
        } else {
            reader.readAsText(file)
        }

        if (isImage) {
            reader.readAsDataURL(file)
        } else {
            reader.readAsText(file)
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const removeAttachment = () => {
        setAttachment(null)
    }

    const handleSubmit = () => {
        if (isLoading) {
            onStop()
        } else if ((input.trim() || attachment) && !isProcessing) {
            onSend(input, attachment || undefined)
            if (replyingTo) {
                onCancelReply?.()
            }
            setInput('')
            setAttachment(null)
            setSuggestion(SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)])
        }
    }

    return (
        <div className="w-full py-4 px-4">
            <div className="max-w-4xl mx-auto relative flex flex-col gap-2 bg-secondary/50 backdrop-blur-xl rounded-2xl border border-border/50 p-2 shadow-lg transition-all duration-200 focus-within:ring-1 focus-within:ring-primary/50 focus-within:border-primary/50 overflow-hidden">

                {isProcessing && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-medium text-primary">Processing...</span>
                        </div>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,text/plain,text/html"
                />

                {replyingTo && (
                    <div className="mx-1 p-3 bg-secondary/50 rounded-xl border border-border/50 flex items-start justify-between gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                                Reply to
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2 pl-2 border-l-2 border-primary/30">
                                {replyingTo}
                            </div>
                        </div>
                        <button
                            onClick={onCancelReply}
                            className="p-1 hover:bg-background/50 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Attachment Preview */}
                {attachment && (
                    <div className="mx-1 p-3 bg-secondary/50 rounded-xl border border-border/50 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center overflow-hidden border border-border/50 flex-shrink-0">
                                {attachment.type === 'image' ? (
                                    <img src={attachment.content} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <FileText size={20} className="text-primary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium truncate">{attachment.name}</div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase">
                                    <span>{attachment.type}</span>
                                    <span>•</span>
                                    <span>{formatSize(attachment.size)}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={removeAttachment}
                            className="p-1 hover:bg-background/50 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2 w-full relative">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-4 text-muted-foreground hover:text-primary hover:bg-secondary/80 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:ring-1 hover:ring-primary/50"
                        title="Attach file"
                        disabled={isProcessing}
                    >
                        <Paperclip size={24} />
                    </button>

                    <div className="flex-1 relative">
                        {!input && !isProcessing && (
                            <div className="absolute inset-0 px-4 py-4 text-sm text-muted-foreground pointer-events-none flex items-center z-0">
                                <span className="truncate flex-1 mr-2 opacity-50">{suggestion}</span>
                                <span className="text-primary/70 text-xs font-medium whitespace-nowrap hidden sm:inline-block bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">Tab to fill</span>
                            </div>
                        )}
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className={cn(
                                "w-full bg-transparent resize-none px-4 py-4 text-sm text-foreground outline-none min-h-[60px] max-h-[200px] flex items-center rounded-xl relative z-10"
                            )}
                            rows={1}
                            disabled={isProcessing}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={((!input.trim() && !attachment) && !isLoading) || isProcessing}
                        className={cn(
                            "p-4 rounded-xl transition-all duration-300 shadow-lg",
                            isLoading
                                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-destructive/20 hover:shadow-[0_0_20px_hsl(var(--destructive)/0.4)] hover:ring-1 hover:ring-destructive/50"
                                : (input.trim() || attachment)
                                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:ring-1 hover:ring-primary/50"
                                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                        )}
                    >
                        {isLoading ? <Square size={24} /> : <ArrowUp size={24} />}
                    </button>
                </div>
            </div>
        </div>
    )
}
