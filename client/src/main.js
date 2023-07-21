import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createStore } from "./store";

// CSS
import "./scss/lib/app.scss";
import "./scss/app.scss";

// Init app
const app = createApp(App);
app.config.productionTip = false;

// Directives
import clickOutside from "./plugins/clickOutside";
app.use(clickOutside);

// Popups
import alertPopups from "./plugins/alertPopups";
app.use(alertPopups);

// Init socket connection
import socket from "./plugins/socket";
app.use(socket);

// Store
const store = createStore(app);
app.use(store);

app.use(router).mount("#app");
