import React from "react"
import { Link } from "@tata1mg/router"
import { MapPin, Navigation, Train, Clock, ShieldCheck, BookOpen, Calendar, QrCode, HelpCircle } from "lucide-react"

export function Venue() {
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
                <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#3b82f6", margin: "0 0 8px 0" }}>Event Venue</h1>
                <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>Google I/O Connect India 2026</p>
            </div>

            {/* Venue Card */}
            <div style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #334155",
                marginBottom: "24px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <MapPin style={{ color: "#ef4444" }} size={28} />
                    <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Location Details</h2>
                </div>
                
                <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#3b82f6", margin: "0 0 8px 0" }}>
                    Bangalore International Exhibition Centre (BIEC)
                </h3>
                <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6", margin: "0 0 16px 0" }}>
                    10th Mile, Tumkur Road, Madavara Post, Bengaluru, Karnataka 562123
                </p>

                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    paddingTop: "16px",
                    borderTop: "1px solid #334155"
                }}>
                    <span style={{ fontSize: "12px", background: "#ef4444", padding: "4px 8px", borderRadius: "6px", fontWeight: "500" }}>Hall 4: Main Stage</span>
                    <span style={{ fontSize: "12px", background: "#3b82f6", padding: "4px 8px", borderRadius: "6px", fontWeight: "500" }}>Hall 5: Workshops</span>
                    <span style={{ fontSize: "12px", background: "#10b981", padding: "4px 8px", borderRadius: "6px", fontWeight: "500" }}>Sandbox Demo Area</span>
                </div>
            </div>

            {/* How to Reach */}
            <div style={{
                backgroundColor: "#1e293b",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #334155",
                marginBottom: "24px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <Navigation style={{ color: "#3b82f6" }} size={28} />
                    <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Getting There</h2>
                </div>

                {/* Metro */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                    <Train style={{ color: "#10b981", flexShrink: 0 }} size={20} />
                    <div>
                        <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 4px 0" }}>Namma Metro (Green Line)</h4>
                        <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5", margin: 0 }}>
                            Take the Green Line and get down at **Madavara Station** (BIEC terminal). The exhibition centre is right outside the station.
                        </p>
                    </div>
                </div>

                {/* Road */}
                <div style={{ display: "flex", gap: "12px" }}>
                    <Clock style={{ color: "#f59e0b", flexShrink: 0 }} size={20} />
                    <div>
                        <h4 style={{ fontSize: "14px", fontWeight: "600", margin: "0 0 4px 0" }}>Timings & Access</h4>
                        <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: "1.5", margin: 0 }}>
                            Doors open at 8:00 AM on July 14. Registration & Badge Pick-Up is at the main gates of Hall 4 from 7:30 AM.
                        </p>
                    </div>
                </div>
            </div>

            {/* Travel Advisory */}
            <div style={{
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "32px"
            }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <ShieldCheck style={{ color: "#f59e0b", flexShrink: 0 }} size={20} />
                    <div>
                        <h4 style={{ fontSize: "13px", fontWeight: "700", color: "#f59e0b", margin: "0 0 4px 0" }}>
                            Important Travel Note
                        </h4>
                        <p style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: "1.5", margin: 0 }}>
                            Traffic on Tumkur Road can get heavy in the morning. Using the Namma Metro is highly recommended to reach the venue on time for the Keynote.
                        </p>
                    </div>
                </div>
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
                    className="flex flex-col items-center space-y-0.5 transition duration-150 text-blue-500"
                    style={{ textDecoration: "none" }}
                >
                    <MapPin className="h-5 w-5" />
                    <span className="text-[9px] font-bold">Venue</span>
                </Link>

                {/* FAQs Tab */}
                <Link
                    to="/faq"
                    className="flex flex-col items-center space-y-0.5 transition duration-150 text-slate-400 dark:text-slate-500 hover:text-slate-600"
                    style={{ textDecoration: "none" }}
                >
                    <HelpCircle className="h-5 w-5" />
                    <span className="text-[9px] font-bold">FAQs</span>
                </Link>
            </nav>
        </div>
    )
}

Venue.setMetaData = () => {
    return [
        <title key="title">Venue Details — IO Pocket</title>,
        <meta key="description" name="description" content="Location and travel guide for Google I/O Connect India 2026 at BIEC Bengaluru." />,
    ]
}

export default Venue
