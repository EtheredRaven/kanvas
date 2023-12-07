export default {
  install(app) {
    app.config.globalProperties.$animateTransition = function (el) {
      // Make a table with each corresponding reverse animation
      let reversedAnimations = {
        animate__bounceIn: "animate__bounceOut",
        animate__bounceOut: "animate__bounceIn",
        animate__bounceInDown: "animate__bounceOutUp",
        animate__bounceOutUp: "animate__bounceInDown",
        animate__bounceInRight: "animate__bounceOutRight",
        animate__bounceOutRight: "animate__bounceInRight",
        animate__slideInRight: "animate__slideOutRight",
        animate__slideOutRight: "animate__slideInRight",
      };

      const regex = /animate__(?:\w+-?)+(?:In|Out)(\S)*/g;
      const classesFrom = el.className.match(regex);
      if (!classesFrom || !classesFrom.length) return;
      const classFrom = classesFrom[0];
      const classTo = reversedAnimations[classFrom];
      el.classList.remove(classFrom);
      el.classList.add(classTo);

      // Wait for the animation to end = 300ms and return a Promise
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 300);
      });
    };
  },
};
