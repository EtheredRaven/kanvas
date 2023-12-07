export default {
  install(app) {
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

    // Create a variable that stores if the pointer is down (mouse or touch)
    window.Client.pointerDown = false;
    document.body.addEventListener(
      "pointerdown",
      () => (window.Client.pointerDown = true)
    );
    document.body.addEventListener(
      "pointerup",
      () => (window.Client.pointerDown = false)
    );
    document.body.addEventListener(
      "touchstart",
      () => (window.Client.pointerDown = true)
    );
    document.body.addEventListener(
      "touchend",
      () => (window.Client.pointerDown = false)
    );

    window.Client.preventCanvasClick = function () {
      // Make timeout duration 2000 if touch device detected
      let isTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints ||
        navigator.msMaxTouchPoints;
      const timeoutDuration = isTouch ? 1000 : 500;

      window.Client.preventCanvasClickTimeout &&
        clearTimeout(window.Client.preventCanvasClickTimeout);

      window.Client.preventCanvasClickTimeout = setTimeout(() => {
        window.Client.preventCanvasClickTimeout = undefined;
      }, timeoutDuration);
    };

    app.config.globalProperties.Client = window.Client;
  },
};
