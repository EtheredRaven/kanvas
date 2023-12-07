import Phaser from "phaser";
import create from "./create.js";
import update from "./update.js";
import preload from "./preload.js";
import init from "./init.js";
import pixel from "./pixel.js";
import actions from "./actions";
//import admin from "./admin";

function launch(containerId, vue) {
  return new Phaser.Game({
    width: Math.floor(window.visualViewport.width), //  substract the menu width
    height: Math.floor(window.visualViewport.height),
    backgroundColor: "#F7F7F7",
    type: Phaser.AUTO,
    pixelArt: true,
    parent: containerId,
    input: {
      activePointers: 3,
    },
    scene: {
      init() {
        init({ vue: vue, graphics: this });
      },
      preload() {
        preload({ vue: vue, graphics: this });
      },
      create() {
        create({ vue: vue, graphics: this });
        pixel({ vue: vue, graphics: this });
        actions({ vue: vue, graphics: this });
        //admin({ vue: vue, graphics: this });
      },
      update() {
        update({ vue: vue, graphics: this });
      },
    },
  });
}

export default launch;
export { launch };
