import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/wing/:step",
    name: "Wing",
    component: () => import("../views/Wing.vue"),
  },
  {
    path: "/performance/:step",
    name: "Performance",
    component: () => import("../views/Performance.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
