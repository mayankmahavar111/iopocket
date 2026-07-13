/**
 * Server-only Supabase client.
 *
 * CRITICAL: This file must NEVER be imported from src/ or client/ directories.
 *
 * Uses the service-role key which bypasses RLS.
 */
const { createClient } = require("@supabase/supabase-js")
const WebSocket = require("ws")
const path = require("path")

let supabase = null

function getSupabaseClient() {
    if (!supabase) {
        let url = process.env.SUPABASE_URL
        let key = process.env.SUPABASE_SERVICE_ROLE_KEY

        // Fallback to config.json
        if (!url || !key) {
            try {
                const config = require("../config/config.json")
                url = url || config.SUPABASE_URL
                key = key || config.SUPABASE_SERVICE_ROLE_KEY
            } catch (e) {
                console.error("Failed to load config.json fallback:", e.message)
            }
        }

        if (!url || !key) {
            throw new Error(
                "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables/config keys. " +
                "Set them in config/config.json or platform env vars (Railway)."
            )
        }

        supabase = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
            realtime: {
                transport: WebSocket,
            },
        })
    }
    return supabase
}

module.exports = { getSupabaseClient }
