import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

// CSS
import "./scss/lib/app.scss";
import "./scss/app.scss";

// Phaser (canvas)
import { defineCustomElements as defineIonPhaser } from "@ion-phaser/core/loader";

// Init app
const app = createApp(App);
app.config.globalProperties._depsLoaded = true;
app.config.productionTip = false;
app.config.compilerOptions.isCustomElement = (tag) => {
  return tag.startsWith("ion-");
};
defineIonPhaser(window);

app.directive("click-outside", {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function (event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener("click", el.clickOutsideEvent);
  },
});

// Popups
import alertPopups from "./plugins/alertPopups";
app.use(alertPopups);

// Init socket connection
import socket from "./plugins/socket";
app.use(socket);

app.use(store).use(router).mount("#app");
