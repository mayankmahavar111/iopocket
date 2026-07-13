import Module from "module";

// Override Object.keys and Object.getOwnPropertyNames on require.cache to hide node_modules.
// This prevents catalyst-core's clearServerCache() from deleting react/react-dom/etc.
// from cache, avoiding duplicate React instances and invalid hook calls during hot reloads.
const originalKeys = Object.keys;
Object.keys = function(obj) {
    const cacheObject = Module._cache || (typeof require !== "undefined" ? require.cache : null);
    if (obj && cacheObject && obj === cacheObject) {
        return originalKeys(obj).filter(key => !key.includes("node_modules"));
    }
    return originalKeys(obj);
};

const originalNames = Object.getOwnPropertyNames;
Object.getOwnPropertyNames = function(obj) {
    const cacheObject = Module._cache || (typeof require !== "undefined" ? require.cache : null);
    if (obj && cacheObject && obj === cacheObject) {
        return originalNames(obj).filter(key => !key.includes("node_modules"));
    }
    return originalNames(obj);
};

export const preServerInit = () => {
    // Register unhandled rejection listener to print full stack traces in local development
    process.on("unhandledRejection", (reason) => {
        console.error("[Unhandled Rejection Trace]:", reason)
    })

    // Dynamic port & hostname override for cloud deployment environments (like Railway/Render/Heroku)
    if (process.env.PORT) {
        process.env.NODE_SERVER_PORT = process.env.PORT
        process.env.NODE_SERVER_HOSTNAME = "0.0.0.0"
    }
}
