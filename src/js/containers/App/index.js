import React, { useState, useEffect } from "react"
import { Outlet } from "@tata1mg/router"
import { ShieldAlert } from "lucide-react"

const App = () => {
    const [mounted, setMounted] = useState(false)
    const [isNativeApp, setIsNativeApp] = useState(true) // default to true for SSR/first render

    useEffect(() => {
        setMounted(true)
        const detectNative = () => {
            if (typeof window === "undefined") return false;
            
            // If ONLY_NATIVE is not set to true, allow access on web
            if (process.env.ONLY_NATIVE !== "true") {
                return true;
            }
            
            // Bypass restriction for local dev/testing in browser
            if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
                return true;
            }
            
            // Check for WebBridge and NativeBridge
            const hasWebBridge = !!window.WebBridge;
            const hasNativeBridge = !!(window.NativeBridge || window.webkit?.messageHandlers?.NativeBridge);
            
            return hasWebBridge && hasNativeBridge;
        }
        setIsNativeApp(detectNative())
    }, [])

    // Hydration safety: during SSR and before mounting, render Outlet as normal
    if (mounted && !isNativeApp) {
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
                    <ShieldAlert size={48} />
                </div>
                
                <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "8px" }}>404</h1>
                <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#ef4444", marginBottom: "16px" }}>
                    Access Restricted
                </h2>
                <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "380px", lineHeight: "1.6", marginBottom: "32px" }}>
                    This application is a companion utility designed to be accessed exclusively through the 
                    <strong style={{ color: "#f8fafc" }}> IO Pocket Native Mobile App</strong>.
                </p>
                <div style={{
                    paddingTop: "24px",
                    borderTop: "1px solid #1e293b",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                        Please launch this app inside the Catalyst native webview container.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Outlet />
        </>
    )
}

App.serverSideFunction = () => {
    return new Promise((resolve) => resolve())
}

export default App
