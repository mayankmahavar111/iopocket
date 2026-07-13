const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const apiRouter = require("./api")

// Server middlewares are added here.

export function addMiddlewares(app) {
    // Static assets
    app.use("/favicon.ico", express.static(path.join(__dirname, "../public/favicon.ico")))
    app.use(express.static(path.join(__dirname, "../public")))

    // Body parsing
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Load configs
    let sessionSecret = process.env.SESSION_SECRET
    let disableLogin = process.env.DISABLE_LOGIN
    if (!sessionSecret || disableLogin === undefined) {
        try {
            const config = require("../config/config.json")
            sessionSecret = sessionSecret || config.SESSION_SECRET
            disableLogin = disableLogin === undefined ? config.DISABLE_LOGIN : disableLogin
        } catch (e) {
            // fallback
        }
    }
    sessionSecret = sessionSecret || "7f55b11a5806c9febe78b9b4f981dd4e"
    disableLogin = disableLogin === undefined ? "true" : disableLogin

    // Cookies and Session
    app.use(cookieParser())
    app.use(
        session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            },
        })
    )

    // Auth Bypass middleware
    if (disableLogin === "true" || disableLogin === true) {
        app.use((req, res, next) => {
            if (req.session) {
                req.session.user = {
                    id: "local-dev-user-id",
                    email: "dev@example.com",
                    authenticated: true,
                }
            }
            next()
        })
    }

    // Mount API routes
    app.use("/api", apiRouter)
}

