import React from "react"
import { Outlet } from "@tata1mg/router"
import { ShieldAlert } from "lucide-react"
import { useDeviceInfo } from "catalyst-core/hooks"

const App = () => {
    // useDeviceInfo provides isNative (true when NativeBridge is available in a native webview)
    // and isWeb (true when running in a plain browser).
    // During SSR, isNative is computed from NativeBridge.isAvailable() which returns false server-side,
    // but the hook's internal state starts safe so no gate fires during SSR hydration.
    const { isNative, loading: deviceInfoLoading } = useDeviceInfo()

    // If ONLY_NATIVE env flag is not enabled, always allow web access.
    // This lets you open the PWA in a regular browser for demos/testing.
    if (process.env.ONLY_NATIVE !== "true") {
        return (
            <>
                <Outlet />
            </>
        )
    }

    // While device info is still resolving (SSR/first paint), render the outlet
    // to avoid a flash of the "Access Restricted" screen on native.
    if (deviceInfoLoading) {
        return (
            <>
                <Outlet />
            </>
        )
    }

    // Block access if we're not inside a native Catalyst webview
    if (!isNative) {
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
