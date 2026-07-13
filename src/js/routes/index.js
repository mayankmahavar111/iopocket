import loadable from "@loadable/component"

const Home = loadable(() => import("@containers/Home/Home"))
const NotFound = loadable(() => import("@containers/NotFound/NotFound"))

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
        path: "*",
        component: NotFound,
    },
]

export default routes
