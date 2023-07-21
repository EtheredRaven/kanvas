import "mosha-vue-toastify/dist/style.css";
import { createToast } from "mosha-vue-toastify";

export default {
  install(app) {
    app.config.globalProperties.$error = (title, description) =>
      createToast(
        {
          title: title,
          description: description,
        },
        {
          hideProgressBar: true,
          showIcon: true,
          position: "bottom-right",
          type: "danger",
          timeout: 4000,
          showCloseButton: false,
        }
      );
    app.config.globalProperties.$info = (title, description) =>
      createToast(
        {
          title: title,
          description: description,
        },
        {
          hideProgressBar: true,
          showIcon: true,
          position: "bottom-right",
          type: "success",
          timeout: 4000,
          showCloseButton: false,
        }
      );
  },
};
