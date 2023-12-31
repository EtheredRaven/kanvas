<template>
  <div
    class="sp-wallet-create sp-shadow animate__animated animate__slideInRight"
    id="formContainer"
  >
    <div class="sp-wallet-create__close" v-if="!createform && !importform">
      <a class="sp-icon icon-Close" v-on:click="close" />
    </div>
    <div class="sp-wallet-create__back" v-else>
      <a class="sp-icon icon-Lock" v-on:click="goBack" v-if="create.step2" />
      <a
        class="sp-icon icon-LeftArrow"
        v-on:click="goBack"
        v-if="!create.step2"
      />
    </div>
    <template v-if="!createform && !importform">
      <div class="animate__animated animate__bounceIn" id="createWalletStep0">
        <h3>{{ title }}</h3>
        <div class="sp-wallet-create__text">
          <slot></slot>
        </div>
        <div class="sp-wallet-create__cards">
          <KanvasCard
            type="primary"
            icon="Add"
            v-on:click="createform = true"
            additionalStyle="background: rgb(64,42,247);border: none;"
            >Create new wallet</KanvasCard
          >
          <KanvasCard
            type="secondary"
            icon="Upload"
            v-on:click="importform = true"
            additionalStyle="border: none;background: #f7e930;"
            >Import existing wallet</KanvasCard
          >
        </div>
        <div class="sp-wallet-create__keplr" v-if="kondorAvailable">
          <KanvasButton
            type="primary"
            v-on:click="useKondor"
            additionalStyle="color: white;border: none;background: #27272e;"
            >Use Kondor</KanvasButton
          >
          <KanvasButton
            type="primary"
            v-on:click="useWalletConnect"
            additionalStyle="color: white;border: none;background: #27272e;"
            >Use WalletConnect</KanvasButton
          >
        </div>
      </div>
    </template>
    <template v-if="createform && create.step1">
      <div class="animate__animated animate__bounceIn" id="createWalletStep1">
        <h3>Create wallet</h3>
        <div class="sp-wallet-create__text">
          Generate your own unique wallet. Receive a public address (0x...) and
          choose a method for access and recovery.
        </div>
        <div class="sp-wallet-create__form">
          <div class="sp-form-group">
            <input
              class="sp-input"
              :class="{ 'sp-error': !walletNameAvailable && !creating }"
              v-model="create.name"
              type="text"
              name="walletname"
              placeholder="Wallet name"
            />
          </div>
          <div
            class="sp-error-message"
            v-if="!walletNameAvailable && !creating"
          >
            A wallet by this name already exist. Please choose a different one.
          </div>
          <div class="sp-form-group">
            <input
              class="sp-input"
              v-model="create.password"
              name="password"
              type="password"
              placeholder="Password"
            />
            <input
              class="sp-input"
              v-model="create.confirm"
              name="confirm"
              type="password"
              placeholder="Confirm password"
            />
          </div>
          <div
            class="sp-error-message"
            v-if="create.password != '' && create.password != create.confirm"
          >
            Passwords do not match
          </div>
          <KanvasButton v-on:click="createStep2" type="primary"
            >Create</KanvasButton
          >
        </div>
      </div>
    </template>
    <template v-if="createform && create.step2">
      <div id="createWalletStep2" class="animate__animated animate__bounceIn">
        <h3>Here is your<br />recovery phrase</h3>
        <div class="sp-wallet-create__text">
          You can restore your wallet using your recovery phrase.
        </div>
        <div class="sp-wallet-create__text">
          Write it down on paper. Resist temptation to email it to yourself or
          sceenshot it.
        </div>
        <Mnemonic :mnemonic="create.mnemonic" />
        <KanvasButton type="primary" v-on:click="close">Done</KanvasButton>
      </div>
    </template>
    <template v-if="importform && imported.step1">
      <div id="importWalletStep1" class="animate__animated animate__bounceIn">
        <h3>
          Import<br />
          existing wallet
        </h3>
        <div class="sp-wallet-create__text">
          Paste your recovery phrase or private key below to import your wallet.
        </div>
        <textarea
          class="sp-key-area sp-textarea"
          v-model="imported.mnemonicOrKey"
        ></textarea>
        <div
          class="sp-error-message"
          v-if="
            imported.mnemonicOrKey != '' && !validMnemonic && !validPrivateKey
          "
        >
          You have not entered a valid mnemonic or private key.
        </div>
        <KanvasButton
          type="primary"
          v-on:click="importStep2"
          :disabled="
            imported.mnemonicOrKey == '' || (!validMnemonic && !validPrivateKey)
          "
          >Next</KanvasButton
        >
      </div>
    </template>
    <template v-if="importform && imported.step2">
      <div id="importWalletStep2" class="animate__animated animate__bounceIn">
        <h3>Import existing wallet</h3>
        <div class="sp-wallet-create__text">
          Please name your wallet and choose a password
        </div>
        <div class="sp-wallet-create__form">
          <div class="sp-form-group">
            <input
              class="sp-input"
              :class="{ 'sp-error': !walletNameAvailable && !creating }"
              v-model="imported.name"
              type="text"
              name="walletname"
              placeholder="Wallet name"
            />
          </div>
          <div class="sp-form-group">
            <input
              class="sp-input"
              v-model="imported.password"
              name="password"
              type="password"
              placeholder="Password"
            />
            <input
              class="sp-input"
              v-model="imported.confirm"
              name="confirm"
              type="password"
              placeholder="Confirm password"
            />
          </div>
          <KanvasButton
            v-on:click="doneImport"
            :disabled="
              imported.name == '' ||
              imported.password == '' ||
              imported.password != imported.confirm
            "
            >Done</KanvasButton
          >
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import KanvasCard from "./KanvasCard";
import KanvasButton from "./KanvasButton";
import Mnemonic from "./Mnemonic";
import HDKoinos from "../utils/HDKoinos.js";
import { ethers } from "ethers";
import { utils } from "koilib";

export default defineComponent({
  name: "WalletCreate",
  components: {
    KanvasCard,
    KanvasButton,
    Mnemonic,
  },
  props: {
    title: {
      type: String,
    },
  },
  data: function () {
    return this.defaultState();
  },
  emits: ["close"],
  computed: {
    kondorAvailable: function () {
      return true;
    },
    nameToCreate: function () {
      return this.createform ? this.create.name : this.imported.name;
    },
    walletNameAvailable: function () {
      return this.$store.getters.nameAvailable(this.nameToCreate);
    },
    wallet: function () {
      return this.$store.state.activeWallet;
    },
    validMnemonic: function () {
      return ethers.utils.isValidMnemonic(this.imported.mnemonicOrKey);
    },
    validPrivateKey: function () {
      return utils.isChecksumWif(this.imported.mnemonicOrKey);
    },
  },
  methods: {
    close: function () {
      this.$animateTransition(document.getElementById("formContainer")).then(
        () => {
          this.$emit("close");
          this.reset();
        }
      );
    },
    reset: function () {
      Object.assign(this.$data, this.defaultState());
    },
    goBack: function () {
      if (this.createform) {
        if (this.create.step1) {
          this.$animateTransition(
            document.getElementById("createWalletStep1")
          ).then(this.reset);
          return;
        }
        if (this.create.step2) {
          this.$animateTransition(
            document.getElementById("createWalletStep2")
          ).then(() => {
            this.create.step2 = false;
            this.create.step1 = true;
          });
          return;
        }
      }

      if (this.importform) {
        if (this.imported.step1) {
          this.$animateTransition(
            document.getElementById("importWalletStep1")
          ).then(this.reset);
          return;
        }
        if (this.imported.step2) {
          this.$animateTransition(
            document.getElementById("importWalletStep2")
          ).then(() => {
            this.imported.step2 = false;
            this.imported.step1 = true;
          });
          return;
        }
      }
    },
    defaultState: function () {
      return {
        createform: false,
        importform: false,
        creating: false,
        create: {
          step1: true,
          step2: false,
          name: "",
          password: "",
          confirm: "",
          mnemonic: "",
        },
        imported: {
          step1: true,
          step2: false,
          name: "",
          password: "",
          confirm: "",
          mnemonicOrKey: "",
        },
      };
    },
    generateMnemonic: function () {
      const mnemonic = HDKoinos.randomMnemonic();
      this.create.mnemonic = mnemonic;
    },
    createStep2: async function () {
      this.creating = true;
      if (this.nameToCreate == "")
        return this.$error("Error", "The wallet name cannot be blank!");
      if (this.walletNameAvailable) {
        this.$animateTransition(
          document.getElementById("createWalletStep1")
        ).then(async () => {
          this.create.step1 = false;
          this.create.step2 = true;
          this.generateMnemonic();
          await this.createWallet();
          this.creating = false;
        });
      }
    },
    importStep2: function () {
      this.$animateTransition(
        document.getElementById("importWalletStep1")
      ).then(() => {
        this.imported.step1 = false;
        this.imported.step2 = true;
      });
    },
    doneImport: async function () {
      this.creating = true;
      if (this.walletNameAvailable) {
        await this.importWallet();
        this.creating = false;
        this.reset();
        this.close();
      }
    },
    importWallet: async function () {
      await this.$store.dispatch("createWalletWithMnemonic", {
        name: this.imported.name,
        mnemonicOrKey: this.imported.mnemonicOrKey,
        password: this.imported.password,
        isMnemonic: this.validMnemonic,
      });
    },
    useKondor: async function () {
      await this.$store.dispatch("changeKondorAccounts");
      this.close();
    },
    useWalletConnect: async function () {
      await this.$store.dispatch("pairWalletConnectAccounts");
      this.close();
    },
    createWallet: async function () {
      await this.$store.dispatch("createWalletWithMnemonic", {
        name: this.create.name,
        isMnemonic: true,
        mnemonicOrKey: this.create.mnemonic,
        password: this.create.password,
      });
    },
  },
});
</script>

<style>
.animate__animated {
  animation-duration: 0.3s !important;
}
</style>
