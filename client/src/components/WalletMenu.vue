<template>
  <div
    class="sp-wallet-menu sp-rounded sp-shadow animate__animated animate__bounceInDown"
    id="walletsListContainer"
    :class="{ 'sp-opened': opened }"
    v-if="!unlocking"
    v-click-outside="
      () => {
        opened = false;
      }
    "
  >
    <div class="sp-wallet-menu-items">
      <template v-if="topWallet">
        <div
          class="sp-wallet-menu-item"
          :class="{
            'sp-wallet-menu-item__locked': topWallet.name != walletName,
          }"
        >
          <!-- If there is a profile picture path (nft owned), then display instead of the avatar with the same size -->
          <div v-if="profilePicturePath" class="sp-wallet-menu-item__avatar">
            <img :src="profilePicturePath" />
          </div>
          <div
            v-else
            class="sp-wallet-menu-item__avatar"
            v-html="getAvatar(topWallet.name)"
          ></div>
          <div
            class="sp-wallet-menu-item__avatar-shadow"
            v-html="getAvatar(topWallet.name)"
          ></div>
          <div class="sp-wallet-menu-item__info">
            <span class="sp-text sp-bold sp-active">{{ topWallet.name }}</span>
            <br />
            <span
              class="sp-text"
              v-if="topWallet.name == walletName && activeAccountAddress"
              :alt="activeAccountAddress"
              :title="activeAccountAddress"
            >
              {{ shortenAddress(activeAccountAddress) }}
            </span>
            <span class="sp-text" v-else>Locked</span>
          </div>
          <div class="sp-wallet-menu-item__status">
            <LockIcon
              :isLocked="topWallet.name != walletName"
              :clickFunction="() => toggleWallet(topWallet.name)"
            />
          </div>
          <div
            class="sp-wallet-menu__toggle downIcon"
            v-on:click="opened = !opened"
          >
            <svg
              width="32px"
              height="32px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              :style="
                (opened ? 'transform: rotate(180deg)' : '') +
                ';transition: 0.3s ease;'
              "
            >
              <path
                d="M7 10L12 15L17 10"
                stroke="currentcolor"
                stroke-width="1"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>
      </template>
      <div id="accountsList">
        <template v-if="topWallet.name == walletName">
          <div class="sp-wallet-menu__accounts">
            <AccountList
              v-on:accountSelected="() => (opened = false)"
              @kondorAccountsChanged="kondorAccountsChanged"
            />
          </div>
        </template>
      </div>
      <div
        class="sp-wallet-menu-item"
        :class="{ 'sp-wallet-menu-item__locked': wallet.name != walletName }"
        v-for="(wallet, index) in restWallets"
        v-bind:key="wallet.name"
      >
        <div
          class="sp-wallet-menu-item__avatar"
          v-html="getAvatar(wallet.name)"
        ></div>
        <div
          class="sp-wallet-menu-item__avatar-shadow"
          v-html="getAvatar(wallet.name)"
        ></div>
        <div class="sp-wallet-menu-item__info">
          <span
            class="sp-text sp-bold"
            :class="{ 'sp-active': !topWallet && index == 0 }"
            >{{ wallet.name }}</span
          >
          <br />
          <span
            class="sp-text"
            v-if="wallet.name == walletName && activeAccountAddress"
          >
            {{ shortenAddress(activeAccountAddress) }}
          </span>
          <span class="sp-text" v-else> Locked </span>
        </div>
        <div class="sp-wallet-menu-item__status">
          <LockIcon
            :isLocked="wallet.name != walletName"
            :clickFunction="() => toggleWallet(wallet.name)"
          />
        </div>
      </div>
      <div class="sp-dash"></div>
      <div class="sp-wallet-menu-action">
        <LinkIcon
          icon="AddNew"
          text="Add New Wallet"
          v-on:click="createNewWallet"
        />
      </div>
    </div>
  </div>
  <div
    class="sp-wallet-menu sp-rounded sp-opened sp-shadow animate__animated animate__slideInRight"
    id="unlockWalletContainer"
    v-else-if="unlocking"
  >
    <div class="sp-wallet-menu__toggle alignRight" v-on:click="close">
      <span
        class="sp-icon"
        :class="{
          'icon-DownCaret': !unlocking,
          'icon-Close': unlocking,
          iconClose: unlocking,
        }"
      />
    </div>
    <div class="sp-wallet-menu-items">
      <div class="sp-wallet-menu-item">
        <div
          class="sp-wallet-menu-item__avatar"
          v-html="getAvatar(walletToUnlock?.name ?? '')"
        ></div>
        <div
          class="sp-wallet-menu-item__avatar-shadow"
          v-html="getAvatar(walletToUnlock?.name ?? '')"
        ></div>
        <div class="sp-wallet-menu-item__info">
          <span class="sp-text sp-bold sp-active">{{
            walletToUnlock?.name
          }}</span>
        </div>
      </div>
    </div>
    <div class="sp-wallet-menu-unlock">
      <div class="sp-wallet-menu-unlock__title sp-header-text">
        Unlock Wallet
      </div>
      <div class="sp-wallet-menu-unlock__text">
        Enter your Wallet password below to unlock and access your addresses.
      </div>
      <div class="sp-wallet-menu-unlock__form">
        <div class="sp-form-group">
          <input
            class="sp-input"
            v-model="password"
            type="password"
            name="password"
            placeholder="Password"
          />
        </div>

        <KanvasButton v-on:click="unlockStoreWallet" type="primary"
          >Unlock Wallet</KanvasButton
        >
      </div>
    </div>
  </div>
</template>

<script>
  import { defineComponent } from "vue";
  import AccountList from "./AccountList";
  import KanvasButton from "./KanvasButton";
  import LockIcon from "./LockIcon";
  import LinkIcon from "./LinkIcon";
  import { createAvatar } from "@dicebear/core";
  import { identicon } from "@dicebear/collection";

  export default defineComponent({
    name: "WalletMenu",
    components: {
      AccountList,
      KanvasButton,
      LinkIcon,
      LockIcon,
    },
    emits: ["createNew"],
    created() {
      if (
        this.$store.state.walletsList.length == 1 &&
        this.$store.state.walletsList[0].name == "Demo"
      ) {
        setTimeout(
          () => this.toggleWallet(this.$store.state.walletsList[0].name),
          100
        );
      }
    },
    data: function () {
      return {
        opened: false,
        unlocking: false,
        toUnlock: null,
        password: "",
      };
    },
    computed: {
      activeAccountAddress: function () {
        return this.$store.state.activeAccount?.address;
      },
      profilePicturePath: function () {
        if (!this.activeAccountAddress) return null;

        let nftList =
          this.$store.state.addressesData[this.activeAccountAddress]
            .kanvasGodsList;
        if (!nftList || !nftList.length) {
          // Koin Crew NFTs
          let koinCrewNft =
            this.$store.state.addressesData[this.activeAccountAddress]
              .koinCrewNFT;
          if (koinCrewNft) {
            return "./img/koincrew_nft/" + koinCrewNft + ".png";
          } else {
            return null;
          }
        }
        // Take the minimum of the nft string list to int because it is the most powerful
        let nft = Math.min(...nftList.map((x) => parseInt(x)));
        return "./img/gods/profile/" + nft + ".png";
      },
      walletList: function () {
        return this.$store.state.walletsList;
      },
      walletToUnlock: function () {
        return this.walletList.find((x) => x.name == this.toUnlock);
      },
      walletName: function () {
        return this.$store.getters.walletName;
      },
      loggedIn: function () {
        return this.$store.getters.loggedIn;
      },
      lastWallet: function () {
        return this.$store.getters.lastWallet;
      },
      topWallet: function () {
        let topWallets = this.walletList.filter(
          (x) => x.name == this.lastWallet
        );
        if (topWallets.length) {
          return topWallets[0];
        } else {
          return this.walletList[0];
        }
      },
      restWallets: function () {
        return this.walletList.filter((x) => x.name != this.topWallet.name);
      },
    },
    methods: {
      kondorAccountsChanged() {
        this.$animateTransition(
          document.getElementById("walletsListContainer")
        ).then(() => {
          this.$animateTransition(
            document.getElementById("walletsListContainer")
          );
        });
      },
      close() {
        this.$animateTransition(
          document.getElementById("unlockWalletContainer")
        ).then(() => {
          this.password = "";
          this.unlocking = false;
          this.toUnlock = null;
        });
      },
      shortenAddress: function (addr) {
        return addr.substr(0, 10) + "..." + addr.slice(-5);
      },
      getAvatar: function (name) {
        const avatar = createAvatar(identicon, {
          seed: name,
          backgroundType: "solid",
          row1: ["ooxoo", "oxoxo", "oxxxo"],
          row5: ["ooxoo", "oxoxo", "oxxxo"],
        });
        const svg = avatar.toString();
        return svg;
      },
      unlockStoreWallet: async function () {
        this.$animateTransition(
          document.getElementById("unlockWalletContainer")
        ).then(async () => {
          try {
            await this.$store.dispatch("unlockWallet", {
              name: this.walletToUnlock?.name,
              password: this.password,
            });
            this.unlocking = false;
            this.password = "";
          } catch (err) {
            this.$error("Your password is wrong !");
            this.unlocking = false;
            this.toUnlock = "";
            this.password = "";
          }
        });
      },
      createNewWallet: function () {
        this.$animateTransition(
          document.getElementById("walletsListContainer")
        ).then(() => {
          this.$emit("createNew");
        });
      },
      toggleWallet: async function (name) {
        await this.$animateTransition(
          document.getElementById("walletsListContainer")
        );
        let isWalletLocked = name != this.walletName;
        if (isWalletLocked) {
          if (name == "Kondor" || name == "WalletConnect" || name == "Demo") {
            await this.$store.dispatch("unlockWallet", {
              name,
              password: null,
            });

            this.$animateTransition(
              document.getElementById("walletsListContainer")
            );
          } else {
            this.toUnlock = name;
            this.unlocking = true;
          }
        } else {
          await this.$store.dispatch("signOut");
          this.toUnlock = "";
          this.unlocking = false;
          this.$animateTransition(
            document.getElementById("walletsListContainer")
          );
        }
      },
    },
  });
</script>

<style>
  .iconClose {
    margin-right: 20px;
    vertical-align: sub;
  }

  .alignRight {
    text-align: right !important;
  }
</style>
