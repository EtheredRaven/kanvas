import { createRouter, createWebHistory } from "vue-router";
import CanvasView from "../views/CanvasView.vue";
import PriceChartView from "../views/PriceChartView.vue";
import LeaderboardView from "../views/LeaderboardView.vue";

const routes = [
  {
    path: "/",
    component: CanvasView,
  },
  { path: "/pricechart/", component: PriceChartView },
  { path: "/leaderboard/", component: LeaderboardView },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
