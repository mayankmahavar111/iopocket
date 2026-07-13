import loadable from "@loadable/component"

const Home = loadable(() => import("@containers/Home/Home"))
const NotFound = loadable(() => import("@containers/NotFound/NotFound"))
const Venue = loadable(() => import("@containers/Venue/Venue"))
const Faq = loadable(() => import("@containers/Faq/Faq"))

const routes = [
    {
        path: "/",
        end: true,
        component: Home,
    },
    {
        path: "/library",
        component: Home,
    },
    {
        path: "/scan",
        component: Home,
    },
    {
        path: "/schedule",
        component: Home,
    },
    {
        path: "/venue",
        component: Venue,
    },
    {
        path: "/faq",
        component: Faq,
    },
    {
        path: "*",
        component: NotFound,
    },
]

export default routes
