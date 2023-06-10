import { createRouter, createWebHistory } from "vue-router";
import CanvasView from "../views/CanvasView.vue";

const routes = [
  {
    path: "/",
    component: CanvasView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
