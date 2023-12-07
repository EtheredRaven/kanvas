<template>
  <div class="sp-mnemonic">
    <ul class="sp-mnemonic__list">
      <li
        class="sp-mnemonic__list__item"
        v-for="(word, index) in firstHalfWords"
        v-bind:key="'word' + index + 1"
      >
        <span>{{ index + 1 }}</span> {{ word }}
      </li>
    </ul>
    <ul class="sp-mnemonic__list">
      <li
        class="sp-mnemonic__list__item"
        v-for="(word, index) in secondHalfWords"
        v-bind:key="'word' + index + 1 + firstHalfWords.length"
      >
        <span>{{ index + 1 + firstHalfWords.length }}</span> {{ word }}
      </li>
    </ul>
    <div class="sp-mnemonic__copy">
      <LinkIcon icon="Copy" text="Copy phrase" v-on:click="copyMnemonic" />
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import LinkIcon from "./LinkIcon.vue";
import { copyToClipboard } from "../utils/helpers";

export default defineComponent({
  name: "Mnemonic",
  props: {
    mnemonic: {
      type: String,
      required: true,
    },
  },
  components: {
    LinkIcon,
  },
  computed: {
    words: function () {
      return this.mnemonic.split(" ");
    },
    firstHalfWords: function () {
      return this.words.slice(0, this.words.length / 2);
    },
    secondHalfWords: function () {
      return this.words.slice(this.words.length / 2);
    },
  },
  methods: {
    copyMnemonic: function () {
      copyToClipboard(this.mnemonic);
      this.$info("Copy successful!", "Mnemonic copied to clipboard");
    },
  },
});
</script>
