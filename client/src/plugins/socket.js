export default {
  install(app) {
    // This plugin avoid having a duplicate of socketio events, deleting the previous one
    // Avoid disconnections when leaving the page with the parameters of the socket

    app.config.globalProperties.$socket = window.io.connect();
    let socket = app.config.globalProperties.$socket;
    var baseSocketOn = socket.on;
    socket.on = function () {
      if (
        socket._callbacks !== undefined &&
        typeof socket._callbacks["$" + arguments[0]] !== "undefined"
      ) {
        socket.off(arguments[0]);
      }
      return baseSocketOn.apply(this, arguments);
    };

    window.addEventListener("beforeunload", function () {
      app.config.globalProperties.$socket.emit("disconnect");
    });
  },
};
