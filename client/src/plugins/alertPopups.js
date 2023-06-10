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
        }
      );
  },
};
