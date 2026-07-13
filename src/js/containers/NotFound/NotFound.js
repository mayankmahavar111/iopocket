import React from "react"
import { Link } from "@tata1mg/router"
import { FileQuestion } from "lucide-react"

export function NotFound() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#0f172a",
            color: "#f8fafc",
            fontFamily: "'Outfit', 'Inter', sans-serif",
            padding: "24px",
            textAlign: "center"
        }}>
            <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
                marginBottom: "24px"
            }}>
                <FileQuestion size={48} />
            </div>
            
            <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "8px" }}>404</h1>
            <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#94a3b8", marginBottom: "16px" }}>Page Not Found</h2>
            <p style={{ fontSize: "14px", color: "#64748b", maxWidth: "380px", lineHeight: "1.6", marginBottom: "32px" }}>
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            
            <Link
                to="/"
                style={{
                    display: "inline-block",
                    backgroundColor: "#2563eb",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "600",
                    transition: "background-color 0.2s"
                }}
            >
                Back to Home
            </Link>
        </div>
    )
}

// Meta tags for SEO & Server rendering
NotFound.setMetaData = () => {
    return [
        <title key="title">Page Not Found — IO Pocket</title>,
        <meta key="description" name="description" content="404 — Page Not Found on IO Pocket" />,
    ]
}

export default NotFound
