export function classifyUrlType(url) {
    if (!url) return "Link";
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

export function classifyCategory(url, title = "") {
    const combined = `${url || ""} ${title || ""}`.toLowerCase()
    if (combined.includes("gemini") || combined.includes("ai") || combined.includes("ml") || combined.includes("artificial") || combined.includes("gemma") || combined.includes("vertex")) {
        return "AI/Gemini"
    } else if (combined.includes("android") || combined.includes("kotlin") || combined.includes("compose") || combined.includes("wearos")) {
        return "Android"
    } else if (combined.includes("web") || combined.includes("pwa") || combined.includes("chrome") || combined.includes("html") || combined.includes("css") || combined.includes("javascript") || combined.includes("v8") || combined.includes("lighthouse")) {
        return "Web"
    } else if (combined.includes("firebase") || combined.includes("firestore")) {
        return "Firebase"
    } else if (combined.includes("cloud") || combined.includes("gcp") || combined.includes("kubernetes")) {
        return "Cloud"
    } else if (combined.includes("flutter") || combined.includes("dart")) {
        return "Flutter"
    } else if (combined.includes("ar") || combined.includes("vr") || combined.includes("xr") || combined.includes("cardboard") || combined.includes("lens") || combined.includes("spatial")) {
        return "AR/XR"
    }
    return "Other"
}
