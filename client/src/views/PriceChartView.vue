<script>
import PriceChart from "../components/PriceChart";

const valuePrecision = 100000;
const priceIntervalInS = 60 * 5;
const dayIntervalInArrayIndex = (3600 * 24) / priceIntervalInS;
const date = new Date();

export default {
  data() {
    return {
      tokenDecimals: 100000000,
      tokenSupply: 3000000,
      depth25: 0,
      priceSeries: {
        data: [],
        type: "area",
        options: {
          name: "price",
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
        priceScaleId: "right",
      },
      volumeSeries: {
        data: [],
        type: "histogram",
        options: {
          name: "volume",
          color: "#26a69a",
          priceFormat: {
            type: "custom",
            formatter: (number) => "$ " + Math.round(number),
            minMove: 1,
          },
          priceScaleId: "left",
        },
      },
      valuePrecision: valuePrecision,
      chartOptions: {
        localization: {},
        grid: {
          horzLines: {
            color: "#eee",
          },
          vertLines: {
            color: "#FAFAFA",
          },
        },
        timeScale: {
          borderVisible: false,
          timeVisible: true,
        },
        layout: {
          background: { type: "solid", color: "transparent" },
          textColor: "#333",
          fontFamily: "'Poppins', sans-serif",
        },
        rightPriceScale: {
          scaleMargins: {
            top: 0.2,
          },
          borderVisible: false,
          ticksVisible: true,
          visible: true,
        },
        leftPriceScale: {
          scaleMargins: {
            top: 0.8,
          },
          borderVisible: false,
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
      let priceSeriesData = [];
      let volumeSeriesData = [];
      for (let i = 0; i < priceHistory.length; i++) {
        let row = priceHistory[i];
        let formattedRow = this.formatPriceAndVolume(row);
        priceSeriesData.push(formattedRow.price);
        volumeSeriesData.push(formattedRow.volume);
      }

      this.priceSeries.data = priceSeriesData;
      this.volumeSeries.data = volumeSeriesData;
      this.depth25 =
        priceHistory[priceHistory.length - 1].depth_dollars_twenty_five_percent;
    });

    this.$socket.on("new_price", (newRow) => {
      let formattedNewRow = this.formatPriceAndVolume(newRow);
      this.priceSeries.data = [...this.priceSeries.data, formattedNewRow.price];
      this.volumeSeries.data = [
        ...this.volumeSeries.data,
        formattedNewRow.volume,
      ];
      this.depth25 = newRow.depth_dollars_twenty_five_percent;
    });
  },
  computed: {
    volume24h() {
      if (!this.volumeSeries.data.length) return null;
      let volume24h = 0;
      for (
        let i = Math.max(
          0,
          this.volumeSeries.data.length - 1 - dayIntervalInArrayIndex
        );
        i < this.volumeSeries.data.length - 1;
        i++
      ) {
        let volumeData = this.volumeSeries.data[i].value;
        volume24h += volumeData;
      }

      return volume24h;
    },
    tokenPrice() {
      if (!this.priceSeries.data.length) return null;
      return (
        Math.round(
          this.priceSeries.data[this.priceSeries.data.length - 1].value *
            valuePrecision
        ) / valuePrecision
      );
    },
    tokenPriceEvolution() {
      if (!this.tokenPrice) return null;
      let lastDayPrice =
        this.priceSeries.data[
          Math.max(
            0,
            this.priceSeries.data.length - 1 - dayIntervalInArrayIndex
          )
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
    formatPriceAndVolume(row) {
      let time = row.timestamp - date.getTimezoneOffset() * 60;

      return {
        price: {
          time: time,
          value: row.kan_price_in_koin * row.koin_price_in_dollars,
        },
        volume: {
          time: time,
          value:
            (row.volume_in_kan / this.tokenDecimals) *
            row.kan_price_in_koin *
            row.koin_price_in_dollars,
        },
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
        <span class="tokenLabel" style="margin-left: 1.5rem">Volume (24h)</span>
        <span class="tokenValue" v-if="tokenPrice">
          {{ "$" + Math.round(volume24h).toLocaleString() }}</span
        >
        <span class="tokenLabel" style="margin-left: 1.5rem"
          >Liquidity (-25% depth)</span
        >
        <span class="tokenValue" v-if="tokenPrice">
          {{ "$" + Math.round(depth25).toLocaleString() }}</span
        >
      </div>
      <div class="marketCap" v-if="tokenPrice"></div>
    </div>
    <PriceChart
      v-bind:priceSeriesData="priceSeries.data"
      v-bind:priceSeriesType="priceSeries.type"
      v-bind:priceSeriesOptions="priceSeries.options"
      v-bind:volumeSeriesData="volumeSeries.data"
      v-bind:volumeSeriesType="volumeSeries.type"
      v-bind:volumeSeriesOptions="volumeSeries.options"
      v-bind:chartOptions="chartOptions"
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
  margin-bottom: 0.8rem;
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
  width: max-content;
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
