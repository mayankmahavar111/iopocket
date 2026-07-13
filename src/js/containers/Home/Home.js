import React, { useState, useEffect, useRef } from "react"
import {
    QrCode,
    BookOpen,
    Calendar,
    Search,
    Mic,
    MicOff,
    CheckSquare,
    AlertCircle,
    Download,
    Share2,
    Plus,
    Trash2,
    ExternalLink,
    ChevronDown,
    MapPin,
    User,
    Clock,
    Sun,
    Moon,
    X,
    Folder,
    FileText,
    RefreshCw,
    Edit2,
    Check
} from "lucide-react"
import { useVideoStream, useHapticFeedback } from "catalyst-core/hooks"
import { BrowserQRCodeReader } from "@zxing/library"
import { classifyUrlType, classifyCategory } from "../../utils/classifier"
import scss from "./Home.scss" // If we need component-level SCSS overrides

const TYPES = ["All", "Video", "Repo", "Documentation", "Codelab", "Form", "Link"]
const CATEGORIES = ["All", "AI/Gemini", "Android", "Web", "Cloud", "Firebase", "Flutter", "AR/XR", "Other"]

// Helper to determine background color from type
const getTypeColor = (type) => {
    switch (type) {
        case "Video": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
        case "Repo": return "bg-gray-100 text-gray-700 dark:bg-gray-800/80 dark:text-gray-300 border-gray-200 dark:border-gray-700"
        case "Codelab": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
        case "Documentation": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800"
        case "Form": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800 animate-pulse"
        default: return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
    }
}

// Google 4 accent colors for categories
const getCategoryColor = (category) => {
    switch (category) {
        case "AI/Gemini": return "bg-blue-500 text-white"
        case "Android": return "bg-green-600 text-white"
        case "Web": return "bg-red-500 text-white"
        case "Cloud": return "bg-yellow-500 text-gray-900"
        case "Firebase": return "bg-amber-500 text-white"
        case "Flutter": return "bg-sky-500 text-white"
        case "AR/XR": return "bg-purple-600 text-white"
        default: return "bg-gray-500 text-white"
    }
}

const getStatusColor = (status) => {
    switch (status) {
        case "Planned": return "bg-blue-500 text-white"
        case "Attended": return "bg-green-500 text-white"
        case "Skipped": return "bg-gray-400 text-white dark:bg-gray-600"
        case "Watch-later": return "bg-yellow-500 text-gray-900"
        default: return "bg-gray-500"
    }
}

function Home() {
    // ── Navigation & System ──────────────────────────────────────────
    const [activeTab, setActiveTab] = useState("library") // 'library' | 'scan' | 'schedule'
    const [darkMode, setDarkMode] = useState(false)
    const [scanResultToast, setScanResultToast] = useState(null)
    const toastTimeoutRef = useRef(null)

    // ── Cards & Sessions State ───────────────────────────────────────
    const [cards, setCards] = useState([])
    const [sessions, setSessions] = useState([])
    const [loadingCards, setLoadingCards] = useState(true)
    const [loadingSessions, setLoadingSessions] = useState(true)

    // ── Filters & Search ─────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTypeFilter, setSelectedTypeFilter] = useState("All")
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All")
    const [selectedSessionFilter, setSelectedSessionFilter] = useState("All")
    const [actionNeededOnly, setActionNeededOnly] = useState(false)

    // ── Session Importer/Adder ───────────────────────────────────────
    const [importText, setImportText] = useState("")
    const [showImporter, setShowImporter] = useState(false)
    const [showAddSessionModal, setShowAddSessionModal] = useState(false)
    const [newSessionData, setNewSessionData] = useState({
        time: "",
        title: "",
        speaker: "",
        location: "",
        status: "Planned",
        notes: ""
    })

    // ── Voice Speech-to-Text ─────────────────────────────────────────
    const [isListening, setIsListening] = useState(false)
    const [listeningTarget, setListeningTarget] = useState(null) // { type: 'card' | 'session', id: string }
    const recognitionRef = useRef(null)

    // ── Haptic feedback and Video Stream Hook ────────────────────────
    const haptic = useHapticFeedback()

    const triggerToast = (message) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
        setScanResultToast(message)
        toastTimeoutRef.current = setTimeout(() => {
            setScanResultToast(null)
        }, 3000)
    }

    const handleQRScan = async (qrData) => {
        const url = typeof qrData === "string" ? qrData : qrData.text || qrData.result || ""
        if (!url || !url.startsWith("http")) return;

        // Perform vibration
        haptic.light()

        // Local UI feedback: Add immediately to state in loading mode
        const tempId = `temp-${Date.now()}`
        const localType = classifyUrlType(url)
        const localCat = classifyCategory(url)
        
        const tempCard = {
            id: tempId,
            raw_url: url,
            resolved_url: url,
            timestamp: new Date().toISOString(),
            type: localType,
            category: localCat,
            title: "Resolving metadata...",
            description: "Scanned! Extracting title & description in background...",
            status: "pending",
            notes: "",
            action_needed: localType === "Form",
            loading: true
        }

        setCards(prev => [tempCard, ...prev])
        triggerToast(`Scanned: ${localType} link detected!`)

        try {
            const res = await fetch("/api/cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ raw_url: url, timestamp: tempCard.timestamp })
            })
            if (res.ok) {
                const savedCard = await res.json()
                // Replace temp card
                setCards(prev => prev.map(c => c.id === tempId ? savedCard : c))
                triggerToast(`Enriched: "${savedCard.title}" saved!`)
            } else {
                throw new Error("API failed")
            }
        } catch (e) {
            // Mark temp card as failed to enrich
            setCards(prev => prev.map(c => c.id === tempId ? {
                ...c,
                title: url,
                description: "Failed to enrich metadata. Touch here to retry.",
                loading: false,
                enrichFailed: true
            } : c))
        }
    }

    const videoStream = useVideoStream({
        onQRDetected: (data) => {
            handleQRScan(data)
        }
    })

    // Web Fallback QR code scanner
    useEffect(() => {
        let codeReader = null
        if (activeTab === "scan" && videoStream.webFallbackActive && videoStream.isStreaming) {
            codeReader = new BrowserQRCodeReader()
            const videoElement = document.getElementById("web-viewfinder")
            if (videoElement) {
                console.log("Initializing Web ZXing scanner")
                codeReader.decodeFromVideoElement(videoElement, (result, error) => {
                    if (result) {
                        handleQRScan(result.getText())
                    }
                })
            }
        }
        return () => {
            if (codeReader) {
                codeReader.reset()
            }
        }
    }, [activeTab, videoStream.webFallbackActive, videoStream.isStreaming])

    // Load initial data
    useEffect(() => {
        fetchCards()
        fetchSessions()
        
        // Load theme from localStorage
        const storedTheme = localStorage.getItem("theme")
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
            setDarkMode(true)
            document.documentElement.classList.add("dark")
        }
    }, [])

    const fetchCards = async () => {
        setLoadingCards(true)
        try {
            const res = await fetch("/api/cards")
            if (res.ok) {
                const data = await res.json()
                setCards(data)
            }
        } catch (e) {
            console.error("Failed to load cards:", e)
        } finally {
            setLoadingCards(false)
        }
    }

    const fetchSessions = async () => {
        setLoadingSessions(true)
        try {
            const res = await fetch("/api/sessions")
            if (res.ok) {
                const data = await res.json()
                setSessions(data)
            }
        } catch (e) {
            console.error("Failed to load sessions:", e)
        } finally {
            setLoadingSessions(false)
        }
    }

    // Toggle Theme
    const toggleDarkMode = () => {
        const nextMode = !darkMode
        setDarkMode(nextMode)
        if (nextMode) {
            document.documentElement.classList.add("dark")
            localStorage.setItem("theme", "dark")
        } else {
            document.documentElement.classList.remove("dark")
            localStorage.setItem("theme", "light")
        }
    }

    // Camera control when changing tab
    useEffect(() => {
        if (activeTab === "scan") {
            // Start streaming
            videoStream.start()
        } else {
            // Stop streaming
            videoStream.stop()
        }
    }, [activeTab])

    // Speech Recognition initialization
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            const rec = new SpeechRecognition()
            rec.continuous = false
            rec.lang = "en-US"
            rec.interimResults = false

            rec.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                if (listeningTarget) {
                    if (listeningTarget.type === "card") {
                        handleUpdateCardNote(listeningTarget.id, transcript, true)
                    } else if (listeningTarget.type === "session") {
                        handleUpdateSessionNote(listeningTarget.id, transcript, true)
                    }
                }
            }

            rec.onend = () => {
                setIsListening(false)
            }

            recognitionRef.current = rec
        }
    }, [listeningTarget])

    const startSpeechToText = (targetType, targetId) => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.")
            return
        }
        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
            return
        }
        setListeningTarget({ type: targetType, id: targetId })
        setIsListening(true)
        recognitionRef.current.start()
        haptic.light()
    }

    // ── API Mutators ─────────────────────────────────────────────────
    const handleRetryEnrich = async (card) => {
        setCards(prev => prev.map(c => c.id === card.id ? { ...c, loading: true } : c))
        try {
            const res = await fetch("/api/cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ raw_url: card.raw_url, timestamp: card.timestamp })
            })
            if (res.ok) {
                const savedCard = await res.json()
                // Remove the old failed card, and insert the saved card in its place
                setCards(prev => prev.map(c => c.id === card.id ? savedCard : c))
                // Delete the temporary/failed card from DB via API if it was saved
                await fetch(`/api/cards/${card.id}`, { method: "DELETE" })
            } else {
                throw new Error("retry failed")
            }
        } catch (e) {
            setCards(prev => prev.map(c => c.id === card.id ? { ...c, loading: false, enrichFailed: true } : c))
            triggerToast("Re-enrichment failed.")
        }
    }

    const handleUpdateCardStatus = async (id, currentStatus) => {
        const nextStatus = currentStatus === "done" ? "pending" : "done"
        setCards(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c))
        
        try {
            await fetch(`/api/cards/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus })
            })
        } catch (e) {
            console.error("Failed to update status:", e)
        }
    }

    const handleUpdateCardActionNeeded = async (id, currentVal) => {
        const nextVal = !currentVal
        setCards(prev => prev.map(c => c.id === id ? { ...c, action_needed: nextVal } : c))
        
        try {
            await fetch(`/api/cards/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action_needed: nextVal })
            })
        } catch (e) {
            console.error("Failed to update action needed:", e)
        }
    }

    const handleUpdateCardNote = async (id, text, append = false) => {
        setCards(prev => prev.map(c => {
            if (c.id === id) {
                const nextNotes = append ? (c.notes ? `${c.notes} ${text}` : text) : text
                return { ...c, notes: nextNotes }
            }
            return c
        }))

        // Debounced or direct save
        const cardObj = cards.find(c => c.id === id)
        const updatedText = append ? (cardObj.notes ? `${cardObj.notes} ${text}` : text) : text
        
        try {
            await fetch(`/api/cards/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: updatedText })
            })
        } catch (e) {
            console.error("Failed to save note:", e)
        }
    }

    const handleUpdateCardCategory = async (id, nextCategory) => {
        setCards(prev => prev.map(c => c.id === id ? { ...c, category: nextCategory } : c))
        try {
            await fetch(`/api/cards/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: nextCategory })
            })
        } catch (e) {
            console.error("Failed to update category:", e)
        }
    }

    const handleAssociateSession = async (cardId, sessionId) => {
        const normalizedSessionId = sessionId === "None" ? null : sessionId
        setCards(prev => prev.map(c => c.id === cardId ? { ...c, session_id: normalizedSessionId } : c))
        try {
            await fetch(`/api/cards/${cardId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ session_id: normalizedSessionId })
            })
            triggerToast("Linked with session!")
        } catch (e) {
            console.error("Failed to link session:", e)
        }
    }

    const handleDeleteCard = async (id) => {
        if (!confirm("Are you sure you want to delete this card?")) return;
        setCards(prev => prev.filter(c => c.id !== id))
        haptic.light()
        try {
            await fetch(`/api/cards/${id}`, { method: "DELETE" })
        } catch (e) {
            console.error("Failed to delete card:", e)
        }
    }

    // ── Sessions Mutators ────────────────────────────────────────────
    const handleUpdateSessionStatus = async (id, nextStatus) => {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s))
        haptic.light()
        try {
            await fetch(`/api/sessions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus })
            })
        } catch (e) {
            console.error("Failed to update session status:", e)
        }
    }

    const handleUpdateSessionNote = async (id, text, append = false) => {
        setSessions(prev => prev.map(s => {
            if (s.id === id) {
                const nextNotes = append ? (s.notes ? `${s.notes} ${text}` : text) : text
                return { ...s, notes: nextNotes }
            }
            return s
        }))

        const sessionObj = sessions.find(s => s.id === id)
        const updatedText = append ? (sessionObj.notes ? `${sessionObj.notes} ${text}` : text) : text

        try {
            await fetch(`/api/sessions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes: updatedText })
            })
        } catch (e) {
            console.error("Failed to save session note:", e)
        }
    }

    const handleAddSession = async (e) => {
        e.preventDefault()
        if (!newSessionData.title) return

        try {
            const res = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSessionData)
            })
            if (res.ok) {
                const saved = await res.json()
                setSessions(prev => [...prev, saved])
                setShowAddSessionModal(false)
                setNewSessionData({
                    time: "",
                    title: "",
                    speaker: "",
                    location: "",
                    status: "Planned",
                    notes: ""
                })
                triggerToast("Session added!")
            }
        } catch (e) {
            console.error("Failed to add session:", e)
        }
    }

    const handleDeleteSession = async (id) => {
        if (!confirm("Are you sure you want to delete this session?")) return;
        setSessions(prev => prev.filter(s => s.id !== id))
        haptic.light()
        try {
            await fetch(`/api/sessions/${id}`, { method: "DELETE" })
        } catch (e) {
            console.error("Failed to delete session:", e)
        }
    }

    const handleImportSessions = async () => {
        if (!importText.trim()) return
        
        // Lenient Parsing logic
        const lines = importText.split(/\r?\n/)
        const parsed = []
        for (let line of lines) {
            line = line.trim()
            if (!line) continue
            
            // CSV splitting
            const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            if (parts.length >= 2) {
                const cleanParts = parts.map(p => p.trim().replace(/^"|"$/g, ''))
                parsed.push({
                    time: cleanParts[0] || "TBD",
                    title: cleanParts[1] || "Untitled Session",
                    speaker: cleanParts[2] || "Google Speakers",
                    location: cleanParts[3] || "TBD",
                    status: "Planned",
                    notes: ""
                })
            } else {
                // Split by tab or dash
                const subParts = line.split(/\t|\|| - /)
                if (subParts.length >= 2) {
                    parsed.push({
                        time: subParts[0].trim(),
                        title: subParts[1].trim(),
                        speaker: subParts[2]?.trim() || "Google Speakers",
                        location: subParts[3]?.trim() || "TBD",
                        status: "Planned",
                        notes: ""
                    })
                } else {
                    parsed.push({
                        time: "TBD",
                        title: line,
                        speaker: "Google Speakers",
                        location: "TBD",
                        status: "Planned",
                        notes: ""
                    })
                }
            }
        }

        // Save imported sessions to API
        try {
            const added = []
            for (const item of parsed) {
                const res = await fetch("/api/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item)
                })
                if (res.ok) {
                    const saved = await res.json()
                    added.push(saved)
                }
            }
            setSessions(prev => [...prev, ...added])
            setShowImporter(false)
            setImportText("")
            triggerToast(`Successfully imported ${added.length} sessions!`)
        } catch (e) {
            console.error("Failed to import sessions:", e)
        }
    }

    // ── Export Features ──────────────────────────────────────────────
    const exportAsMarkdown = () => {
        let md = `# IO Pocket - Google I/O Event Export\n\n`
        md += `Exported on: ${new Date().toLocaleString()}\n\n`
        
        md += `## Captured Cards\n\n`
        cards.forEach((c, i) => {
            md += `### ${i+1}. ${c.title || c.raw_url}\n`
            md += `- **Type**: ${c.type}\n`
            md += `- **Category**: ${c.category}\n`
            md += `- **Scanned**: ${new Date(c.timestamp).toLocaleString()}\n`
            md += `- **URL**: ${c.resolved_url || c.raw_url}\n`
            if (c.description) md += `- **Description**: ${c.description}\n`
            if (c.notes) md += `- **My Notes**: ${c.notes}\n`
            md += `\n`
        })

        md += `## Schedule Sessions\n\n`
        sessions.forEach((s, i) => {
            md += `### [${s.status}] ${s.title}\n`
            md += `- **Time**: ${s.time}\n`
            md += `- **Speaker**: ${s.speaker}\n`
            md += `- **Location**: ${s.location}\n`
            if (s.notes) md += `- **Notes**: ${s.notes}\n`
            md += `\n`
        })

        const blob = new Blob([md], { type: "text/markdown;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `io-pocket-export-${Date.now()}.md`
        a.click()
        triggerToast("Markdown export downloaded!")
    }

    const exportAsJSON = () => {
        const payload = {
            cards,
            sessions,
            exportedAt: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `io-pocket-export-${Date.now()}.json`
        a.click()
        triggerToast("JSON export downloaded!")
    }

    // ── Time helper to auto-associate cards to sessions ─────────────────
    const autoLinkCardsToSession = (cardTimestamp, sessionTimeStr) => {
        if (!cardTimestamp || !sessionTimeStr) return false
        try {
            const cardDate = new Date(cardTimestamp)
            const cardMins = cardDate.getHours() * 60 + cardDate.getMinutes()
            
            const match = sessionTimeStr.match(/(\d{1,2})[.:](\d{2})\s*(?:-|to)\s*(\d{1,2})[.:](\d{2})/i)
            if (match) {
                const sh = parseInt(match[1])
                const sm = parseInt(match[2])
                const eh = parseInt(match[3])
                const em = parseInt(match[4])
                
                const startMins = sh * 60 + sm
                const endMins = eh * 60 + em
                
                return cardMins >= startMins && cardMins <= endMins
            }
        } catch (e) {
            // ignore
        }
        return false
    }

    // ── Card filter application ──────────────────────────────────────
    const filteredCards = cards.filter(card => {
        // Search query (across title, URL, notes)
        const searchTarget = `${card.title || ""} ${card.raw_url || ""} ${card.resolved_url || ""} ${card.notes || ""}`.toLowerCase()
        if (searchQuery && !searchTarget.includes(searchQuery.toLowerCase())) return false

        // Type filter
        if (selectedTypeFilter !== "All" && card.type !== selectedTypeFilter) return false

        // Category filter
        if (selectedCategoryFilter !== "All" && card.category !== selectedCategoryFilter) return false

        // Session filter
        if (selectedSessionFilter !== "All") {
            if (selectedSessionFilter === "None" && card.session_id !== null) return false
            if (selectedSessionFilter !== "None" && card.session_id !== selectedSessionFilter) return false
        }

        // Action needed filter
        if (actionNeededOnly && !card.action_needed) return false

        return true
    })

    // Stats calculations
    const totalScans = cards.length
    const pendingForms = cards.filter(c => c.type === "Form" && c.action_needed).length
    const unwatchedVideos = cards.filter(c => c.type === "Video" && c.status !== "done").length
    const doneCards = cards.filter(c => c.status === "done").length

    const plannedCount = sessions.filter(s => s.status === "Planned").length
    const attendedCount = sessions.filter(s => s.status === "Attended").length
    const skippedCount = sessions.filter(s => s.status === "Skipped").length
    const watchLaterCount = sessions.filter(s => s.status === "Watch-later").length

    // Global quick note adder
    const handleAddQuickNote = async () => {
        const text = prompt("Enter your quick note:")
        if (!text) return
        
        // Save as a plain URL card
        const quickCard = {
            raw_url: `note://${Date.now()}`,
            timestamp: new Date().toISOString()
        }

        try {
            const res = await fetch("/api/cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quickCard)
            })
            if (res.ok) {
                const saved = await res.json()
                // Update note and title
                const finalRes = await fetch(`/api/cards/${saved.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: "Quick Note",
                        notes: text,
                        category: "Other",
                        action_needed: false
                    })
                })
                const final = await finalRes.json()
                setCards(prev => [final, ...prev])
                triggerToast("Quick Note saved!")
            }
        } catch (e) {
            console.error("Failed to save quick note:", e)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3 px-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-blue-500 text-white shadow-md animate-bounce">
                        <QrCode className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        IO <span className="text-blue-500">P</span>
                        <span className="text-red-500">o</span>
                        <span className="text-yellow-500">c</span>
                        <span className="text-green-500">k</span>e
                        <span className="text-blue-500">t</span>
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    <button 
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-200 text-slate-600 dark:text-slate-300"
                        aria-label="Toggle theme"
                    >
                        {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
                    </button>
                </div>
            </header>

            {/* Main viewports */}
            <main className="flex-grow pb-24 max-w-lg mx-auto w-full px-4 pt-4">
                
                {/* Global Scan Result Toast */}
                {scanResultToast && (
                    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-slate-800/95 text-white dark:text-slate-100 px-4 py-2.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm flex items-center space-x-2 border border-slate-700/50 animate-slideUp">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                        <span>{scanResultToast}</span>
                    </div>
                )}

                {/* ── TABS RENDERING ────────────────────────────────────────── */}
                
                {/* 1. LIBRARY TAB */}
                {activeTab === "library" && (
                    <div className="space-y-4">
                        {/* Stats Summary */}
                        <div className="grid grid-cols-4 gap-2 bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="text-center border-r border-slate-100 dark:border-slate-900">
                                <div className="text-lg font-extrabold text-blue-500">{totalScans}</div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase">Scans</div>
                            </div>
                            <div className="text-center border-r border-slate-100 dark:border-slate-900">
                                <div className="text-lg font-extrabold text-yellow-500">{pendingForms}</div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase">Forms</div>
                            </div>
                            <div className="text-center border-r border-slate-100 dark:border-slate-900">
                                <div className="text-lg font-extrabold text-red-500">{unwatchedVideos}</div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase">Videos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-extrabold text-green-500">{doneCards}</div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase">Done</div>
                            </div>
                        </div>

                        {/* Search and Quick Actions */}
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search titles, URLs, notes..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                />
                            </div>
                            <button
                                onClick={handleAddQuickNote}
                                className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 shadow-md flex items-center justify-center transition duration-150"
                                title="Add Quick Note"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Filters Drawer / Scroll */}
                        <div className="space-y-2 py-1">
                            {/* Type Chips */}
                            <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                                {TYPES.map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setSelectedTypeFilter(type)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition duration-150 ${
                                            selectedTypeFilter === type
                                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100"
                                                : "bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {/* Category Chips */}
                            <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategoryFilter(cat)}
                                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap border transition duration-150 ${
                                            selectedCategoryFilter === cat
                                                ? "bg-blue-500 text-white border-blue-500"
                                                : "bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Toggle Filters & Session Link */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-slate-600 dark:text-slate-400">
                                    <input
                                        type="checkbox"
                                        checked={actionNeededOnly}
                                        onChange={(e) => setActionNeededOnly(e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    />
                                    <span>⚠️ Action Needed Only</span>
                                </label>

                                <div className="flex items-center space-x-1 text-xs">
                                    <span className="text-slate-400 font-medium">Session:</span>
                                    <select
                                        value={selectedSessionFilter}
                                        onChange={(e) => setSelectedSessionFilter(e.target.value)}
                                        className="bg-white dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="All">All</option>
                                        <option value="None">Unlinked</option>
                                        {sessions.map(s => (
                                            <option key={s.id} value={s.id}>{s.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Cards Feed */}
                        {loadingCards ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                                <span className="text-sm text-slate-500 font-medium">Loading QR Cards...</span>
                            </div>
                        ) : filteredCards.length === 0 ? (
                            <div className="text-center py-20 bg-white dark:bg-slate-950 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No cards match the filters</h3>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Try clearing search text or resetting type and category chips.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredCards.map(card => (
                                    <div 
                                        key={card.id} 
                                        className={`bg-white dark:bg-slate-950 rounded-2xl border transition duration-200 shadow-sm overflow-hidden flex flex-col ${
                                            card.status === "done" 
                                                ? "opacity-60 border-slate-200 dark:border-slate-800" 
                                                : card.type === "Form" && card.action_needed
                                                    ? "border-yellow-400 dark:border-yellow-500 ring-1 ring-yellow-400 dark:ring-yellow-500/20"
                                                    : "border-slate-200 dark:border-slate-800"
                                        }`}
                                    >
                                        {/* Rich Metadata View */}
                                        {card.og_image && (
                                            <div className="relative w-full h-36 bg-slate-100 dark:bg-slate-900">
                                                <img 
                                                    src={card.og_image} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.style.display = 'none' }} // hide if load error
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="p-4 flex-grow flex flex-col space-y-2">
                                            {/* Top badges */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex space-x-1.5 items-center">
                                                    {card.favicon && (
                                                        <img 
                                                            src={card.favicon} 
                                                            alt="Icon" 
                                                            className="w-4 h-4 rounded-sm"
                                                            onError={(e) => { e.target.style.display = 'none' }}
                                                        />
                                                    )}
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getTypeColor(card.type)}`}>
                                                        {card.type}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold text-slate-100 ${getCategoryColor(card.category)}`}>
                                                        {card.category}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(card.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            {card.enrichFailed ? (
                                                <div 
                                                    onClick={() => handleRetryEnrich(card)}
                                                    className="cursor-pointer group flex items-start space-x-2 text-slate-600 dark:text-slate-400 hover:text-blue-500"
                                                >
                                                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5 group-hover:animate-pulse" />
                                                    <div className="text-xs break-all">
                                                        <span className="font-bold block text-red-500">Failed to load preview details</span>
                                                        {card.raw_url}
                                                    </div>
                                                    {card.loading ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin text-blue-500 ml-auto" />
                                                    ) : (
                                                        <span className="text-[10px] underline ml-auto font-semibold shrink-0">Tap to Retry</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                                                        {card.title || card.raw_url}
                                                    </h4>
                                                    {card.description && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                                            {card.description}
                                                        </p>
                                                    )}
                                                    {card.loading && (
                                                        <div className="flex items-center space-x-1.5 text-blue-500 text-[10px] font-medium mt-1">
                                                            <RefreshCw className="h-3 w-3 animate-spin" />
                                                            <span>Resolving details...</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Link Display */}
                                            {!card.enrichFailed && (
                                                <a 
                                                    href={card.resolved_url || card.raw_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-[11px] text-blue-500 dark:text-blue-400 font-medium hover:underline flex items-center space-x-1 break-all"
                                                >
                                                    <span className="truncate">{card.resolved_url || card.raw_url}</span>
                                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                                </a>
                                            )}

                                            {/* Associate Session Selection */}
                                            <div className="flex items-center space-x-1 pt-1.5 border-t border-slate-100 dark:border-slate-900/60">
                                                <span className="text-[10px] text-slate-400 font-semibold">Live Session:</span>
                                                <select
                                                    value={card.session_id || "None"}
                                                    onChange={(e) => handleAssociateSession(card.id, e.target.value)}
                                                    className="bg-transparent text-[11px] font-medium text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer max-w-[200px]"
                                                >
                                                    <option value="None">None</option>
                                                    {sessions.map(s => (
                                                        <option key={s.id} value={s.id}>
                                                            [{s.time}] {s.title}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Notes Area */}
                                            <div className="mt-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2 border border-slate-100 dark:border-slate-900">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">My Notes</span>
                                                    <button
                                                        onClick={() => startSpeechToText("card", card.id)}
                                                        className={`p-1 rounded-full transition ${
                                                            isListening && listeningTarget?.type === "card" && listeningTarget?.id === card.id
                                                                ? "bg-red-500 text-white animate-pulse"
                                                                : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400"
                                                        }`}
                                                        title="Voice Note"
                                                    >
                                                        {isListening && listeningTarget?.type === "card" && listeningTarget?.id === card.id ? (
                                                            <MicOff className="h-3 w-3" />
                                                        ) : (
                                                            <Mic className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                </div>
                                                <textarea
                                                    placeholder="Type or use mic to dictate notes..."
                                                    value={card.notes || ""}
                                                    onChange={(e) => handleUpdateCardNote(card.id, e.target.value)}
                                                    className="w-full bg-transparent border-0 p-0 text-xs focus:ring-0 focus:outline-none resize-none min-h-[40px] text-slate-700 dark:text-slate-300 leading-normal"
                                                />
                                            </div>

                                            {/* Action bar */}
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-900/60">
                                                <div className="flex space-x-3 text-slate-400">
                                                    {/* Category Selector Dropdown */}
                                                    <select
                                                        value={card.category}
                                                        onChange={(e) => handleUpdateCardCategory(card.id, e.target.value)}
                                                        className="text-[10px] font-semibold bg-transparent hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
                                                    >
                                                        {CATEGORIES.filter(c => c !== "All").map(c => (
                                                            <option key={c} value={c}>{c}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {/* Action Needed Checkbox for Form */}
                                                    {card.type === "Form" && (
                                                        <button
                                                            onClick={() => handleUpdateCardActionNeeded(card.id, card.action_needed)}
                                                            className={`px-2 py-1 rounded text-[10px] font-bold flex items-center space-x-1 border ${
                                                                card.action_needed
                                                                    ? "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400"
                                                                    : "text-slate-400 border-slate-200 dark:border-slate-800"
                                                            }`}
                                                        >
                                                            <span>⚠️ Action</span>
                                                        </button>
                                                    )}

                                                    {/* Mark as Done */}
                                                    <button
                                                        onClick={() => handleUpdateCardStatus(card.id, card.status)}
                                                        className={`p-1.5 rounded-full border transition ${
                                                            card.status === "done"
                                                                ? "bg-green-500 border-green-500 text-white"
                                                                : "border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400"
                                                        }`}
                                                        title={card.status === "done" ? "Mark as Uncompleted" : "Mark as Done"}
                                                    >
                                                        <Check className="h-3.5 w-3.5" />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDeleteCard(card.id)}
                                                        className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 transition duration-150"
                                                        title="Delete Card"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Export Buttons */}
                        <div className="flex justify-between space-x-2 pt-6">
                            <button
                                onClick={exportAsMarkdown}
                                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center space-x-1.5 hover:bg-slate-50 transition"
                            >
                                <FileText className="h-4 w-4" />
                                <span>Export Markdown</span>
                            </button>
                            <button
                                onClick={exportAsJSON}
                                className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center space-x-1.5 hover:bg-slate-50 transition"
                            >
                                <Download className="h-4 w-4" />
                                <span>Export JSON</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. SCANNER TAB */}
                {activeTab === "scan" && (
                    <div className="flex flex-col space-y-4 items-center justify-center animate-fadeIn">
                        
                        {/* Viewfinder block */}
                        <div className="relative w-full aspect-square max-w-sm rounded-3xl bg-slate-900 border-4 border-white dark:border-slate-950 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
                            
                            {/* Scanning Laser HUD lines */}
                            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-laser z-20"></div>
                            
                            {/* QR scanning bracket overlays */}
                            <div className="absolute inset-10 border-2 border-white/20 rounded-2xl pointer-events-none z-10"></div>
                            <div className="absolute top-8 left-8 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl pointer-events-none z-10"></div>
                            <div className="absolute top-8 right-8 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr pointer-events-none z-10"></div>
                            <div className="absolute bottom-8 left-8 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl pointer-events-none z-10"></div>
                            <div className="absolute bottom-8 right-8 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br pointer-events-none z-10"></div>

                            {/* Viewfinder Stream */}
                            {videoStream.webFallbackActive ? (
                                <video
                                    id="web-viewfinder"
                                    ref={(el) => {
                                        if (el && videoStream.mediaStream && el.srcObject !== videoStream.mediaStream) {
                                            el.srcObject = videoStream.mediaStream
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div 
                                    ref={videoStream.viewfinderRef} 
                                    className="w-full h-full bg-black flex items-center justify-center text-white"
                                >
                                    {videoStream.isStreaming ? "Native Camera active" : "Activating Native Camera..."}
                                </div>
                            )}

                            {/* Loading State or error overlays */}
                            {videoStream.error && (
                                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
                                    <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                                    <p className="text-sm font-bold text-red-400">Camera error</p>
                                    <p className="text-xs text-slate-300 mt-1">{videoStream.error.message || "Failed to start camera."}</p>
                                    <button
                                        onClick={() => videoStream.start()}
                                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-full text-xs shadow-md transition"
                                    >
                                        Retry Camera
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Scanner HUD Details */}
                        <div className="w-full max-w-sm text-center">
                            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Rapid-Fire Scan Mode</h3>
                            <p className="text-xs text-slate-400 mt-1">Point camera at a Google I/O QR code. Scanning vibrates, saves instantly, and continues ready for the next QR code.</p>
                        </div>

                        {/* Manual entry URL fallback */}
                        <div className="w-full max-w-sm bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manual URL Input</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="Enter URL e.g. https://forms.gle/..."
                                    value={manualUrlInput || ""}
                                    onChange={(e) => setManualUrlInput(e.target.value)}
                                    className="flex-grow pl-3 pr-2 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <button
                                    onClick={() => {
                                        if (manualUrlInput) {
                                            handleQRScan(manualUrlInput)
                                            setManualUrlInput("")
                                        }
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition shrink-0"
                                >
                                    Add Link
                                </button>
                            </div>
                        </div>

                        {/* Camera Flip / Controls */}
                        {videoStream.webFallbackActive && (
                            <button
                                onClick={() => videoStream.flip()}
                                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-1.5 px-4 rounded-full text-xs font-semibold transition"
                            >
                                Flip Camera
                            </button>
                        )}
                    </div>
                )}

                {/* 3. SCHEDULE TAB */}
                {activeTab === "schedule" && (
                    <div className="space-y-6">
                        {/* Importer Section */}
                        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <button
                                onClick={() => setShowImporter(!showImporter)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/40 transition duration-150"
                            >
                                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
                                    <Download className="h-5 w-5 text-blue-500" />
                                    <span className="text-sm font-bold">Import Schedule</span>
                                </div>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showImporter ? "transform rotate-180" : ""}`} />
                            </button>
                            
                            {showImporter && (
                                <div className="p-4 border-t border-slate-100 dark:border-slate-900/60 flex flex-col space-y-3 bg-slate-50/50 dark:bg-slate-900/10">
                                    <p className="text-[11px] text-slate-400 leading-normal">
                                        Paste CSV or freeform list. Supported formats:<br />
                                        `Time, Title, Speaker, Location`<br />
                                        or `Time - Title - Speaker - Location`
                                    </p>
                                    <textarea
                                        rows={4}
                                        placeholder={`09:00 - 10:30, Keynote: Developer Vision, Sundar Pichai, Amphitheatre&#10;11:00 - 12:00, What's New in Android, Android Team, Stage 1`}
                                        value={importText}
                                        onChange={(e) => setImportText(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-950 p-2.5 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                    />
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => setShowImporter(false)}
                                            className="px-3 py-1.5 text-xs text-slate-500 font-medium hover:underline"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleImportSessions}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-4 rounded-xl text-xs transition"
                                        >
                                            Process Import
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Expected vs Actual dashboard */}
                        <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected vs Actual Attendance</h3>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-2 rounded-xl text-center">
                                    <div className="text-base font-extrabold text-blue-600 dark:text-blue-400">{plannedCount}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Planned</div>
                                </div>
                                <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded-xl text-center">
                                    <div className="text-base font-extrabold text-green-600 dark:text-green-400">{attendedCount}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Attended</div>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded-xl text-center">
                                    <div className="text-base font-extrabold text-yellow-600 dark:text-yellow-400">{watchLaterCount}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Later</div>
                                </div>
                                <div className="bg-gray-100 dark:bg-slate-900 p-2 rounded-xl text-center">
                                    <div className="text-base font-extrabold text-slate-600 dark:text-slate-400">{skippedCount}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Skipped</div>
                                </div>
                            </div>
                            
                            {/* Attendance Meter */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                                    <span>Goal Met Progress</span>
                                    <span>{plannedCount + attendedCount > 0 ? Math.round((attendedCount / (plannedCount + attendedCount)) * 100) : 0}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${plannedCount + attendedCount > 0 ? (attendedCount / (plannedCount + attendedCount)) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Add session manual button */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Google I/O Timeline</h3>
                            <button
                                onClick={() => setShowAddSessionModal(true)}
                                className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-xl flex items-center space-x-1 hover:bg-slate-800 transition"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Session</span>
                            </button>
                        </div>

                        {/* Chronological Timeline list */}
                        {loadingSessions ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-3">
                                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                                <span className="text-sm text-slate-500 font-medium">Loading Schedule...</span>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-16 bg-white dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No sessions scheduled</h3>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">Import your schedule above or add one manually to see the day's timeline.</p>
                            </div>
                        ) : (
                            <div className="space-y-6 relative border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
                                {sessions.map(sess => {
                                    // Filter cards linked to this session
                                    const linkedCards = cards.filter(c => c.session_id === sess.id)
                                    // Auto-associated cards (if not explicitly linked but time matches)
                                    const autoCards = cards.filter(c => c.session_id === null && autoLinkCardsToSession(c.timestamp, sess.time))
                                    const combinedCards = [...linkedCards, ...autoCards]

                                    return (
                                        <div key={sess.id} className="relative group space-y-2">
                                            {/* Accent status dot on timeline */}
                                            <div className={`absolute -left-[24.5px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${
                                                sess.status === "Attended" ? "bg-green-500" : sess.status === "Planned" ? "bg-blue-500" : sess.status === "Watch-later" ? "bg-yellow-500" : "bg-gray-400"
                                            }`}></div>

                                            {/* Session Detail Card */}
                                            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col space-y-2">
                                                
                                                {/* Header Row */}
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span>{sess.time}</span>
                                                        </div>
                                                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                                                            {sess.title}
                                                        </h4>
                                                    </div>

                                                    {/* Status Badge Toggle */}
                                                    <button
                                                        onClick={() => {
                                                            const statuses = ["Planned", "Attended", "Watch-later", "Skipped"]
                                                            const nextIdx = (statuses.indexOf(sess.status) + 1) % statuses.length
                                                            handleUpdateSessionStatus(sess.id, statuses[nextIdx])
                                                        }}
                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(sess.status)} transition`}
                                                    >
                                                        {sess.status}
                                                    </button>
                                                </div>

                                                {/* Speaker + Location info */}
                                                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50 dark:border-slate-900/60">
                                                    <div className="flex items-center space-x-1">
                                                        <User className="h-3.5 w-3.5 text-slate-400" />
                                                        <span className="font-medium truncate max-w-[150px]">{sess.speaker}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 text-slate-400">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span className="font-medium">{sess.location}</span>
                                                    </div>
                                                </div>

                                                {/* Notes block */}
                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl text-xs space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Session Thoughts</span>
                                                        <button
                                                            onClick={() => startSpeechToText("session", sess.id)}
                                                            className={`p-0.5 rounded-full transition ${
                                                                isListening && listeningTarget?.type === "session" && listeningTarget?.id === sess.id
                                                                    ? "bg-red-500 text-white animate-pulse"
                                                                    : "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                                                            }`}
                                                        >
                                                            {isListening && listeningTarget?.type === "session" && listeningTarget?.id === sess.id ? (
                                                                <MicOff className="h-3 w-3" />
                                                            ) : (
                                                                <Mic className="h-3.5 w-3.5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        placeholder="Quick thoughts, speakers insights..."
                                                        value={sess.notes || ""}
                                                        onChange={(e) => handleUpdateSessionNote(sess.id, e.target.value)}
                                                        className="w-full bg-transparent border-0 p-0 text-xs focus:ring-0 focus:outline-none resize-none min-h-[30px] text-slate-700 dark:text-slate-300"
                                                    />
                                                </div>

                                                {/* Delete Button for Custom Session */}
                                                {sess.is_custom && (
                                                    <div className="flex justify-end pt-1">
                                                        <button
                                                            onClick={() => handleDeleteSession(sess.id)}
                                                            className="text-slate-400 hover:text-red-500 text-[10px] font-semibold flex items-center space-x-1 transition"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                            <span>Remove Session</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Nested Scanned QR Cards (Auto & Explicit) */}
                                            {combinedCards.length > 0 && (
                                                <div className="pl-4 space-y-2.5">
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                                                        <Folder className="h-3 w-3" />
                                                        <span>Scanned Cards ({combinedCards.length})</span>
                                                    </div>
                                                    
                                                    {combinedCards.map(c => (
                                                        <div 
                                                            key={c.id} 
                                                            className="bg-white/80 dark:bg-slate-950/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center space-x-2 truncate">
                                                                {c.favicon && (
                                                                    <img src={c.favicon} alt="" className="w-3.5 h-3.5 rounded-sm shrink-0" onError={(e)=>{e.target.style.display='none'}} />
                                                                )}
                                                                <div className="truncate">
                                                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate leading-tight">
                                                                        {c.title || c.raw_url}
                                                                    </span>
                                                                    <span className="text-[9px] text-slate-400 block truncate">
                                                                        {c.resolved_url || c.raw_url}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-1 shrink-0 ml-2">
                                                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${getTypeColor(c.type)}`}>
                                                                    {c.type}
                                                                </span>
                                                                <a 
                                                                    href={c.resolved_url || c.raw_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                                                                >
                                                                    <ExternalLink className="h-3 w-3" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ── ADD CUSTOM SESSION MODAL ───────────────────────────────────── */}
            {showAddSessionModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-scaleUp">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Add Custom Session</h3>
                            <button 
                                onClick={() => setShowAddSessionModal(false)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSession} className="space-y-3.5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Time Slot (e.g. 10:00 - 11:00)</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="10:00 - 11:00"
                                    value={newSessionData.time}
                                    onChange={(e) => setNewSessionData(prev => ({ ...prev, time: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-900 pl-3 pr-2 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Session Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Deep Dive into Gemini Nano"
                                    value={newSessionData.title}
                                    onChange={(e) => setNewSessionData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-900 pl-3 pr-2 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Speaker(s)</label>
                                <input
                                    type="text"
                                    placeholder="AI Engineering Team"
                                    value={newSessionData.speaker}
                                    onChange={(e) => setNewSessionData(prev => ({ ...prev, speaker: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-900 pl-3 pr-2 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Location / Stage</label>
                                <input
                                    type="text"
                                    placeholder="Stage 4"
                                    value={newSessionData.location}
                                    onChange={(e) => setNewSessionData(prev => ({ ...prev, location: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-900 pl-3 pr-2 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition"
                            >
                                Save Session
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2.5 px-6 flex justify-around items-center z-40 max-w-lg mx-auto shadow-lg">
                {/* Library Tab */}
                <button
                    onClick={() => setActiveTab("library")}
                    className={`flex flex-col items-center space-y-1 transition duration-150 ${
                        activeTab === "library" ? "text-blue-500" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                    }`}
                >
                    <BookOpen className="h-5 w-5" />
                    <span className="text-[10px] font-bold">Library</span>
                </button>

                {/* Scan Button (Floating accent) */}
                <button
                    onClick={() => setActiveTab("scan")}
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-full -mt-6 shadow-xl transition-all duration-200 scale-100 hover:scale-105 active:scale-95 z-50 ${
                        activeTab === "scan" 
                            ? "bg-red-500 text-white ring-4 ring-red-100 dark:ring-red-950/30" 
                            : "bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/30"
                    }`}
                    aria-label="Scan QR Code"
                >
                    <QrCode className="h-6 w-6" />
                </button>

                {/* Schedule Tab */}
                <button
                    onClick={() => setActiveTab("schedule")}
                    className={`flex flex-col items-center space-y-1 transition duration-150 ${
                        activeTab === "schedule" ? "text-blue-500" : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
                    }`}
                >
                    <Calendar className="h-5 w-5" />
                    <span className="text-[10px] font-bold">Schedule</span>
                </button>
            </nav>
        </div>
    )
}

export default Home
