const express = require("express")
const { getSupabaseClient } = require("./supabase")

const router = express.Router()

// Helper to classify URL type
function classifyUrlType(url) {
    const lowerUrl = url.toLowerCase()
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
        return "Video"
    } else if (lowerUrl.includes("github.com")) {
        return "Repo"
    } else if (lowerUrl.includes("codelabs.developers.google.com")) {
        return "Codelab"
    } else if (lowerUrl.includes("developers.google.com") || lowerUrl.includes("docs") || lowerUrl.includes("developer.android.com")) {
        return "Documentation"
    } else if (lowerUrl.includes("forms.gle") || lowerUrl.includes("feedback") || lowerUrl.includes("docs.google.com/forms")) {
        return "Form"
    }
    return "Link"
}

// Helper to classify Category by URL and Title
function classifyCategory(url, title = "") {
    const combined = `${url} ${title}`.toLowerCase()
    if (combined.includes("gemini") || combined.includes("ai") || combined.includes("ml") || combined.includes("artificial") || combined.includes("gemma") || combined.includes("vertex")) {
        return "AI/Gemini"
    } else if (combined.includes("android") || combined.includes("kotlin") || combined.includes("compose") || combined.includes("wearos")) {
        return "Android"
    } else if (combined.includes("web") || combined.includes("pwa") || combined.includes("chrome") || combined.includes("html") || combined.includes("css") || combined.includes("javascript") || combined.includes("v8") || combined.includes("lighthouse")) {
        return "Web"
    } else if (combined.includes("firebase") || combined.includes("firestore")) {
        return "Firebase" // Check Firebase before general Cloud
    } else if (combined.includes("cloud") || combined.includes("gcp") || combined.includes("kubernetes")) {
        return "Cloud"
    } else if (combined.includes("flutter") || combined.includes("dart")) {
        return "Flutter"
    } else if (combined.includes("ar") || combined.includes("vr") || combined.includes("xr") || combined.includes("cardboard") || combined.includes("lens") || combined.includes("spatial")) {
        return "AR/XR"
    }
    return "Other"
}

// Seeding logic function
async function ensureSeedData(supabase) {
    try {
        const { count, error: countErr } = await supabase
            .from("io_sessions")
            .select("*", { count: "exact", head: true })

        if (countErr) {
            console.error("[Seeding] Check sessions error:", countErr.message)
            return
        }

        if (count === 0) {
            console.log("[Seeding] Database is empty, seeding sessions and cards...")
            
            const seedSessions = [
                {
                    id: "keynote",
                    time: "09:00 - 10:30",
                    title: "Keynote: Developer Vision",
                    speaker: "Google Leadership",
                    location: "Hall 4 Main Stage",
                    status: "Planned",
                    notes: "Opening keynote for Google I/O Connect India 2026. Setting the vision for AI, Web, Cloud and Android.",
                    is_custom: false
                },
                {
                    id: "gemini-agents",
                    time: "11:00 - 11:45",
                    title: "Building Agentic Workflows with Gemini 1.5",
                    speaker: "Gemini Engineering Team",
                    location: "Hall 4 Stage A",
                    status: "Planned",
                    notes: "How to use Gemini Pro & Flash to build autonomous developer agents.",
                    is_custom: false
                },
                {
                    id: "android-multidevice",
                    time: "11:00 - 11:45",
                    title: "Android Multi-Device: Designing for Foldables & Wearables",
                    speaker: "Android Dev Relations",
                    location: "Hall 5 Stage B",
                    status: "Watch-later",
                    notes: "Adapting UI and layouts across smartphones, tablets, foldables, and watches.",
                    is_custom: false
                },
                {
                    id: "web-performance",
                    time: "12:00 - 12:45",
                    title: "Architecting Modern Web Apps with WebAssembly & PWAs",
                    speaker: "Chrome Team",
                    location: "Hall 5 Stage B",
                    status: "Attended",
                    notes: "Optimizing loading times, caching strategies, and offline-first functionalities.",
                    is_custom: false
                },
                {
                    id: "cloud-llms",
                    time: "12:00 - 12:45",
                    title: "Deploying Scalable LLMs on Google Cloud with GKE",
                    speaker: "Google Cloud Architects",
                    location: "Hall 4 Stage A",
                    status: "Planned",
                    notes: "Infrastructure setup for hosting open weights models like Gemma on GKE.",
                    is_custom: false
                },
                {
                    id: "firebase-genkit",
                    time: "14:00 - 14:45",
                    title: "Firebase Genkit: Building AI Features for Mobile & Web",
                    speaker: "Firebase Product Team",
                    location: "Hall 4 Stage A",
                    status: "Planned",
                    notes: "Using Genkit integration to quickly bring AI features into JavaScript/TypeScript backends.",
                    is_custom: false
                },
                {
                    id: "gemma-tuning",
                    time: "14:00 - 15:30",
                    title: "Workshop: Fine-Tuning Gemma Models on Local Devices",
                    speaker: "Google ML Researchers",
                    location: "Workshop Room 1",
                    status: "Planned",
                    notes: "Hands-on guide to Quantization, LoRA, and running fine-tuned models locally.",
                    is_custom: false
                },
                {
                    id: "closing-panel",
                    time: "16:30 - 17:30",
                    title: "Closing Panel: Innovations in the Indian Developer Ecosystem",
                    speaker: "Indian Founders & Google Leadership",
                    location: "Hall 4 Main Stage",
                    status: "Planned",
                    notes: "Discussing AI startups, scale challenges, and developer tools in India.",
                    is_custom: false
                }
            ]

            const { error: sessErr } = await supabase.from("io_sessions").insert(seedSessions)
            if (sessErr) {
                console.error("[Seeding] Failed to insert sessions:", sessErr.message)
                return
            }

            const seedCards = [
                {
                    raw_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    resolved_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                    title: "Google I/O Keynote Stream",
                    description: "Watch the main keynote livestream here.",
                    type: "Video",
                    category: "AI/Gemini",
                    session_id: "keynote",
                    og_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
                    favicon: "https://www.youtube.com/favicon.ico",
                    status: "pending",
                    notes: "Rewatch the AI announcements section.",
                    action_needed: false,
                    timestamp: "2026-07-14T09:30:00Z"
                },
                {
                    raw_url: "https://github.com/google/gemini-cookbook",
                    resolved_url: "https://github.com/google/gemini-cookbook",
                    title: "Gemini Cookbook",
                    description: "Examples and recipes for using Gemini APIs.",
                    type: "Repo",
                    category: "AI/Gemini",
                    session_id: "keynote",
                    og_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
                    favicon: "https://github.com/favicon.ico",
                    status: "pending",
                    notes: "Try the Node.js quickstart tonight.",
                    action_needed: false,
                    timestamp: "2026-07-14T10:00:00Z"
                },
                {
                    raw_url: "https://codelabs.developers.google.com/codelabs/web-pwa",
                    resolved_url: "https://codelabs.developers.google.com/codelabs/web-pwa",
                    title: "Build your first PWA",
                    description: "Learn to build a modern Progressive Web App.",
                    type: "Codelab",
                    category: "Web",
                    session_id: "web-performance",
                    og_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
                    favicon: "https://developers.google.com/favicon.ico",
                    status: "pending",
                    notes: "Catalyst framework builds clean PWAs.",
                    action_needed: false,
                    timestamp: "2026-07-14T13:15:00Z"
                },
                {
                    raw_url: "https://developers.google.com/web/docs",
                    resolved_url: "https://developers.google.com/web/docs",
                    title: "Web Platform Documentation",
                    description: "Developer guides and references for the Web.",
                    type: "Documentation",
                    category: "Web",
                    session_id: "web-performance",
                    og_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
                    favicon: "https://developers.google.com/favicon.ico",
                    status: "pending",
                    notes: "Bookmark for offline PWA API details.",
                    action_needed: false,
                    timestamp: "2026-07-14T13:30:00Z"
                },
                {
                    raw_url: "https://forms.gle/io26feedback",
                    resolved_url: "https://docs.google.com/forms/d/e/1FAIpQLSfB2-io26feedback/viewform",
                    title: "Google I/O Web Session Feedback",
                    description: "Let us know your thoughts about the session.",
                    type: "Form",
                    category: "Other",
                    session_id: "web-performance",
                    og_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
                    favicon: "https://ssl.gstatic.com/docs/spreadsheets/forms.ico",
                    status: "pending",
                    notes: "Fill this feedback form for the swags!",
                    action_needed: true,
                    timestamp: "2026-07-14T13:55:00Z"
                },
                {
                    raw_url: "https://goo.gle/gemini-api",
                    resolved_url: "https://ai.google.dev/gemini-api/docs",
                    title: "goo.gle api link",
                    description: "Gemini Developer API portal.",
                    type: "Link",
                    category: "AI/Gemini",
                    session_id: "gemini-agents",
                    og_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500",
                    favicon: "https://ai.google.dev/favicon.ico",
                    status: "pending",
                    notes: "Short link resolved and reclassified.",
                    action_needed: false,
                    timestamp: "2026-07-14T14:10:00Z"
                }
            ]
            const { error: cardsErr } = await supabase.from("io_cards").insert(seedCards)
            if (cardsErr) {
                console.error("[Seeding] Failed to insert cards:", cardsErr.message)
            } else {
                console.log("[Seeding] Seed data injected successfully!")
            }
        }
    } catch (e) {
        console.error("[Seeding] Seeding error:", e.message)
    }
}

// ── SESSIONS API ─────────────────────────────────────────────────────

router.get("/sessions", async (req, res) => {
    try {
        const supabase = getSupabaseClient()
        await ensureSeedData(supabase)
        const { data, error } = await supabase
            .from("io_sessions")
            .select("*")
            .order("time", { ascending: true })

        if (error) throw error
        res.json(data)
    } catch (err) {
        console.error("[API] GET /sessions error:", err.message)
        res.status(500).json({ error: "Failed to fetch sessions" })
    }
})

router.post("/sessions", async (req, res) => {
    try {
        const supabase = getSupabaseClient()
        const { id, time, title, speaker, location, status, notes, is_custom } = req.body

        if (!title) {
            return res.status(400).json({ error: "Session title is required" })
        }

        const newSession = {
            id: id || `custom-${Date.now()}`,
            time: time || "TBD",
            title,
            speaker: speaker || "TBD",
            location: location || "TBD",
            status: status || "Planned",
            notes: notes || "",
            is_custom: is_custom === undefined ? true : is_custom
        }

        const { data, error } = await supabase
            .from("io_sessions")
            .insert(newSession)
            .select()
            .single()

        if (error) throw error
        res.status(201).json(data)
    } catch (err) {
        console.error("[API] POST /sessions error:", err.message)
        res.status(500).json({ error: "Failed to create session" })
    }
})

router.patch("/sessions/:id", async (req, res) => {
    try {
        const supabase = getSupabaseClient()
        const { id } = req.params
        const { status, notes, time, title, speaker, location } = req.body

        const updates = {}
        if (status !== undefined) updates.status = status
        if (notes !== undefined) updates.notes = notes
        if (time !== undefined) updates.time = time
        if (title !== undefined) updates.title = title
        if (speaker !== undefined) updates.speaker = speaker
        if (location !== undefined) updates.location = location

        const { data, error } = await supabase
            .from("io_sessions")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (error) throw error
        res.json(data)
    } catch (err) {
        console.error("[API] PATCH /sessions error:", err.message)
        res.status(500).json({ error: "Failed to update session" })
    }
})

router.delete("/sessions/:id", async (req, res) => {
    try {
        const supabase = getSupabaseClient()
        const { id } = req.params

        const { error } = await supabase
            .from("io_sessions")
            .delete()
            .eq("id", id)

        if (error) throw error
        res.json({ success: true, message: "Session deleted successfully" })
    } catch (err) {
        console.error("[API] DELETE /sessions error:", err.message)
        res.status(500).json({ error: "Failed to delete session" })
    }
})

// ── CARDS API ────────────────────────────────────────────────────────

router.get("/cards", async (req, res) => {
    try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
            .from("io_cards")
            .select("*")
            .order("timestamp", { ascending: false })

        if (error) throw error
        res.json(data)
    } catch (err) {
        console.error("[API] GET /cards error:", err.message)
        res.status(500).json({ error: "Failed to fetch cards" })
    }
})

// Helper to resolve URL redirects and fetch meta information
async function fetchMetadata(targetUrl) {
    try {
        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
            redirect: "follow",
        })

        const resolvedUrl = response.url
        const html = await response.text()

        const getMeta = (regexes) => {
            for (const regex of regexes) {
                const match = html.match(regex)
                if (match && match[1]) {
                    // Quick strip of HTML entities if any
                    return match[1].replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim()
                }
            }
            return null
        }

        const title = getMeta([
            /<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i,
            /<meta\s+name=["']title["']\s+content=["'](.*?)["']/i,
            /<title>(.*?)<\/title>/i,
        ]) || targetUrl

        const description = getMeta([
            /<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i,
            /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i,
        ]) || ""

        let ogImage = getMeta([
            /<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i,
            /<meta\s+name=["']twitter:image["']\s+content=["'](.*?)["']/i,
        ])

        let favicon = getMeta([
            /<link\s+[^>]*?rel=["'](?:shortcut )?icon["'][^>]*?href=["'](.*?)["']/i,
            /<link\s+[^>]*?href=["'](.*?)["'][^>]*?rel=["'](?:shortcut )?icon["']/i,
        ])

        const resolveUrl = (base, relative) => {
            if (!relative) return null
            try {
                return new URL(relative, base).href
            } catch (e) {
                return relative
            }
        }

        const resolvedOgImage = resolveUrl(resolvedUrl, ogImage)
        const resolvedFavicon = resolveUrl(resolvedUrl, favicon) || resolveUrl(resolvedUrl, "/favicon.ico")

        return {
            resolvedUrl,
            title,
            description,
            ogImage: resolvedOgImage,
            favicon: resolvedFavicon,
        }
    } catch (e) {
        console.warn(`[Metadata Fetch] Failed for ${targetUrl}:`, e.message)
        return {
            resolvedUrl: targetUrl,
            title: targetUrl,
            description: "",
            ogImage: null,
            favicon: null,
        }
    }
}

router.post("/cards", async (req, res) => {
    try {
        const supabase = getSupabaseClient()
        const { raw_url, timestamp, session_id } = req.body

        if (!raw_url) {
            return res.status(400).json({ error: "raw_url is required" })
        }

        // 1. Resolve and fetch metadata
        const metadata = await fetchMetadata(raw_url)

        // 2. Classify based on resolved URL and title
        const type = classifyUrlType(metadata.resolvedUrl)
        const category = classifyCategory(metadata.resolvedUrl, metadata.title)
        const actionNeeded = type === "Form"

        const newCard = {
            raw_url,
            resolved_url: metadata.resolvedUrl,
            timestamp: timestamp || new Date().toISOString(),
            type,
            category,
            session_id: session_id || null,
            title: metadata.title,
            description: metadata.description,
            og_image: metadata.ogImage,
            favicon: metadata.favicon,
            status: "pending",
            notes: "",
            action_needed: actionNeeded
        }

        const { data, error } = await supabase
            .from("io_cards")
            .insert(newCard)
            .select()
            .single()

        if (error) throw error
        res.status(201).json(data)
    } catch (err) {
        console.error("[API] POST /cards error:", err.message)
        res.status(500).json({ error: "Failed to create card" })
    }
})

router.patch("/cards/:id", async (req, res) => {
    try {
        const supabase = getSupabaseClient()
        const { id } = req.params
        const { status, notes, category, tags, session_id, action_needed, title } = req.body

        const updates = {}
        if (status !== undefined) updates.status = status
        if (notes !== undefined) updates.notes = notes
        if (category !== undefined) updates.category = category
        if (tags !== undefined) updates.tags = tags
        if (session_id !== undefined) updates.session_id = session_id
        if (action_needed !== undefined) updates.action_needed = action_needed
        if (title !== undefined) updates.title = title

        const { data, error } = await supabase
            .from("io_cards")
            .update(updates)
            .eq("id", id)
            .select()
            .single()

        if (error) throw error
        res.json(data)
    } catch (err) {
        console.error("[API] PATCH /cards error:", err.message)
        res.status(500).json({ error: "Failed to update card" })
    }
})

router.delete("/cards/:id", async (req, res) => {
    try {
        const supabase = getSupabaseClient()
        const { id } = req.params

        const { error } = await supabase
            .from("io_cards")
            .delete()
            .eq("id", id)

        if (error) throw error
        res.json({ success: true, message: "Card deleted successfully" })
    } catch (err) {
        console.error("[API] DELETE /cards error:", err.message)
        res.status(500).json({ error: "Failed to delete card" })
    }
})

module.exports = router
