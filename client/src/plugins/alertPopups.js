import "mosha-vue-toastify/dist/style.css";
import { createToast } from "mosha-vue-toastify";

export default {
  install(app) {
    app.config.globalProperties.$error = (title) =>
      createToast(
        {
          title: title,
          description:
            "More info in the <a href='../docs/playing/troubleshooting.html' target='_blank' style='color: white'>troubleshooting docs</a>",
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
