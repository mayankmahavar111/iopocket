import React from "react"
import { Link } from "@tata1mg/router"
import { HelpCircle, ChevronRight, BookOpen, Calendar, QrCode, MapPin } from "lucide-react"

export function Faq() {
    const faqs = [
        {
            q: "How do I collect my attendee badge?",
            a: "Bring the confirmation email containing your QR Code (or the digital pass from your Google RSVP dashboard) to the registration desks at Hall 4 entrance. Badge collection starts at 7:30 AM IST on July 14."
        },
        {
            q: "Is there Wi-Fi available at the venue?",
            a: "Yes, free event Wi-Fi is provided. However, due to high developer density, connection speed might be intermittent. We advise using mobile data or keeping your IO Pocket companion open, which functions locally offline!"
        },
        {
            q: "Are food and refreshments provided?",
            a: "Yes! High tea, morning snacks, full buffet lunch, and evening refreshments are provided to all badge-wearing attendees. Vegetarian and vegan food zones will be clearly marked."
        },
        {
            q: "Can I scan QR codes without an active connection?",
            a: "Absolutely! The IO Pocket companion is designed to work offline. Scans are saved instantly to IndexedDB and synchronized with Supabase. Metadata, previews, and categorization are resolved once you are online."
        },
        {
            q: "What is the schedule of the event?",
            a: "Timings are 8:30 AM to 5:30 PM. The Keynote starts at 9:00 AM. After 5:30 PM, you are invited to join the Sandbox experience zones and networking mixer."
        }
    ]

    return (
        <div style={{
            minHeight: "100vh",
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            fontFamily: "'Outfit', 'Inter', sans-serif",
            padding: "24px 16px 80px 16px"
        }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "32px", paddingTop: "12px" }}>
                <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#10b981", margin: "0 0 8px 0" }}>FAQs</h1>
                <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>Google I/O Connect India Help Guide</p>
            </div>

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                {faqs.map((faq, i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: "#1e293b",
                            borderRadius: "12px",
                            padding: "16px",
                            border: "1px solid #334155"
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                            <HelpCircle style={{ color: "#10b981", flexShrink: 0, marginTop: "2px" }} size={18} />
                            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#f8fafc", margin: 0, lineHeight: "1.4" }}>
                                {faq.q}
                            </h3>
                        </div>
                        <p style={{
                            fontSize: "13px",
                            color: "#94a3b8",
                            lineHeight: "1.6",
                            margin: "0 0 0 26px"
                        }}>
                            {faq.a}
                        </p>
                    </div>
                ))}
            </div>

            {/* Bottom Tab Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-4 flex justify-around items-center z-40 max-w-lg mx-auto shadow-lg">
                {/* Library Tab */}
                <Link
                    to="/library"
                    className="flex flex-col items-center space-y-0.5 transition duration-150 text-slate-400 dark:text-slate-500 hover:text-slate-600"
                    style={{ textDecoration: "none" }}
                >
                    <BookOpen className="h-5 w-5" />
                    <span className="text-[9px] font-bold">Library</span>
                </Link>

                {/* Schedule Tab */}
                <Link
                    to="/schedule"
                    className="flex flex-col items-center space-y-0.5 transition duration-150 text-slate-400 dark:text-slate-500 hover:text-slate-600"
                    style={{ textDecoration: "none" }}
                >
                    <Calendar className="h-5 w-5" />
                    <span className="text-[9px] font-bold">Schedule</span>
                </Link>

                {/* Scan Button (Floating accent) */}
                <Link
                    to="/scan"
                    className="flex flex-col items-center justify-center w-12 h-12 rounded-full -mt-5 shadow-xl transition-all duration-200 scale-100 hover:scale-105 active:scale-95 z-50 bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/30"
                    style={{ textDecoration: "none" }}
                    aria-label="Scan QR Code"
                >
                    <QrCode className="h-6 w-6" />
                </Link>

                {/* Venue Tab */}
                <Link
                    to="/venue"
                    className="flex flex-col items-center space-y-0.5 transition duration-150 text-slate-400 dark:text-slate-500 hover:text-slate-600"
                    style={{ textDecoration: "none" }}
                >
                    <MapPin className="h-5 w-5" />
                    <span className="text-[9px] font-bold">Venue</span>
                </Link>

                {/* FAQs Tab */}
                <Link
                    to="/faq"
                    className="flex flex-col items-center space-y-0.5 transition duration-150 text-blue-500"
                    style={{ textDecoration: "none" }}
                >
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-[9px] font-bold">FAQs</span>
                </Link>
            </nav>
        </div>
    )
}

Faq.setMetaData = () => {
    return [
        <title key="title">FAQs — IO Pocket</title>,
        <meta key="description" name="description" content="Frequently Asked Questions for Google I/O Connect India 2026." />,
    ]
}

export default Faq
