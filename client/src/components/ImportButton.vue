<template>
  <div>
    <ActionButton @click="importImage" icon="import.svg"></ActionButton>
  </div>
</template>

<script>
import { nftTiersArrayMaxImportedImageSize } from "../utils/constants";
import ActionButton from "./ActionButton.vue";
export default {
  components: {
    ActionButton,
  },
  computed: {
    bestKanvasGodId() {
      return this.$store.getters.getBestKanvasGodId();
    },
  },
  methods: {
    // Import an image with a hidden file selector
    importImage() {
      const fileSelector = document.createElement("input");
      fileSelector.setAttribute("type", "file");
      fileSelector.setAttribute("accept", "image/*");
      fileSelector.style.display = "none";
      fileSelector.click();

      // Listen for the file to be selected
      fileSelector.addEventListener("change", (event) => {
        const file = event.target.files[0];
        // Verify if the file is an image
        // Verify if the image size is small enough according to nft tiers
        const imageElement = new Image();
        const maxImageSize =
          nftTiersArrayMaxImportedImageSize[this.bestKanvasGodId];

        imageElement.src = URL.createObjectURL(file);
        imageElement.onload = () => {
          if (imageElement.width * imageElement.height > maxImageSize) {
            const squaredImageSize = Math.sqrt(maxImageSize);
            return this.$error(
              `The image is too big. The maximum size is ${maxImageSize} pixels (${squaredImageSize}x${squaredImageSize} if squared).`
            );
          }
          window.Client.game.graphics.importSelectedImageAsPixelsPlaceholder(
            imageElement
          );
        };
      });
    },
  },
};
</script>
