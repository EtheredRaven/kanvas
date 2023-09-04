<script>
import PriceChart from "../components/PriceChart";

const valuePrecision = 100000;
const priceIntervalInS = 60 * 5;
const dayIntervalInArrayIndex = (3600 * 24) / priceIntervalInS;
const date = new Date();

export default {
  data() {
    return {
      tokenSupply: 3000000, // TODO : retrieve from contract
      priceHistory: [],
      serieType: "area",
      valuePrecision: valuePrecision,
      seriesOptions: {
        topColor: "rgba(89, 86, 233, 0.56)",
        bottomColor: "rgba(89, 86, 233, 0.0)",
        lineColor: "rgba(89, 86, 233, 1)",
        lineWidth: 2,
        lineType: 0,
        symbol: "KAN",
        lastPriceAnimation: 1,
        priceFormat: {
          type: "custom",
          formatter: (number) =>
            "$ " + Math.round(number * valuePrecision) / valuePrecision,
          minMove: 1 / valuePrecision,
        },
      },
      chartOptions: {
        localization: {},
        grid: {
          horzLines: {
            color: "#eee",
          },
          vertLines: {
            color: "#F8F8F8",
          },
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
        },
        layout: {
          background: { type: "solid", color: "transparent" },
          textColor: "#333",
          fontFamily: "'Inter', sans-serif",
        },
        rightPriceScale: {
          scaleMargins: {
            top: 0.2,
            bottom: 0.2,
          },
          borderVisible: false,
          ticksVisible: true,
          visible: true,
        },
        watermark: {
          visible: true,
          fontSize: 24,
          horzAlign: "right",
          vertAlign: "bottom",
          color: "rgba(89, 86, 233, 0.10)",
          text: "Trading chart by Kanvas",
        },
      },
    };
  },
  components: {
    PriceChart,
  },
  mounted() {
    this.$socket.emit("get_price_history");
    this.$socket.on("got_price_history", (priceHistory) => {
      this.priceHistory = priceHistory.map((price) => {
        return this.formatPrice(price);
      });
    });

    this.$socket.on("new_price", (newPrice) => {
      this.priceHistory = [...this.priceHistory, this.formatPrice(newPrice)];
    });
  },
  computed: {
    tokenPrice() {
      if (!this.priceHistory.length) return null;
      return (
        Math.round(
          this.priceHistory[this.priceHistory.length - 1].value * valuePrecision
        ) / valuePrecision
      );
    },
    tokenPriceEvolution() {
      if (!this.tokenPrice) return null;
      let lastDayPrice =
        this.priceHistory[
          Math.max(0, this.priceHistory.length - 1 - dayIntervalInArrayIndex)
        ].value;
      let evolution = !lastDayPrice
        ? 1000000
        : Math.round(
            (100 * (100 * (this.tokenPrice - lastDayPrice))) / lastDayPrice
          ) / 100;

      return evolution;
    },
  },
  methods: {
    formatPrice(price) {
      return {
        time: price.timestamp - date.getTimezoneOffset() * 60,
        value: price.kan_price_in_koin * price.koin_price_in_dollars,
      };
    },
  },
};
</script>

<template>
  <div class="chartContainer">
    <div class="tokenPriceContainer">
      <div class="flexContainer tokenName">
        <img
          src="../../public/img/icon.png"
          alt="icon"
          class="chartKanvasIcon"
        />KAN
        <span
          class="tokenPriceEvolution"
          :style="'color:' + (tokenPriceEvolution >= 0 ? '#48C75B' : '#C7485B')"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            fill="currentColor"
            class="bi bi-caret-down-fill"
            viewBox="0 0 16 16"
            style="margin-right: 3px"
            v-bind:transform="
              'rotate(' + (tokenPriceEvolution >= 0 ? 180 : 0) + ')'
            "
          >
            <path
              d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"
            /></svg
          >{{ Math.abs(tokenPriceEvolution) }}% (1d)</span
        >
      </div>
      <br />
      <div class="flexContainer">
        <span class="tokenLabel">Token price</span>
        <span class="tokenValue" v-if="tokenPrice">{{ "$" + tokenPrice }}</span>
        <span class="tokenLabel" style="margin-left: 1.5rem">Market cap</span>
        <span class="tokenValue" v-if="tokenPrice">
          {{ "$" + (tokenPrice * tokenSupply).toLocaleString() }}</span
        >
      </div>
      <div class="marketCap" v-if="tokenPrice"></div>
    </div>
    <PriceChart
      v-bind:data="priceHistory"
      v-bind:chartOptions="chartOptions"
      v-bind:type="serieType"
      v-bind:seriesOptions="seriesOptions"
      v-bind:valuePrecision="valuePrecision"
    />
  </div>
</template>

<style>
.chartContainer {
  width: 100%;
  height: 100%;
}

.tokenName {
  font-weight: bold;
  font-size: 2.5rem !important;
  align-items: center;
}

.tokenPriceEvolution {
  font-size: 1.4rem;
  font-weight: normal;
}

.tokenPriceContainer {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 2rem;
  text-align: center;
}

.flexContainer {
  display: inline-flex;
  gap: 1rem;
  font-size: 1.4rem;
  margin-top: 0.5rem;
}

.tokenLabel {
  color: #707070;
}

.tokenValue {
  font-weight: bold;
}

.chartKanvasIcon {
  width: 20px;
  vertical-align: middle;
}
</style>
