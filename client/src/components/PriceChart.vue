<template>
  <div class="lw-chart" ref="chartContainer"></div>
</template>

<script>
import { createChart } from "lightweight-charts";

let series = {};
let chart;

// Function to get the correct series constructor name for current series type.
function getChartSeriesConstructorName(type) {
  return `add${type.charAt(0).toUpperCase() + type.slice(1)}Series`;
}

// Creates the chart series and sets the data.
const addSeriesAndData = (type, seriesOptions, data) => {
  const seriesConstructor = getChartSeriesConstructorName(type);
  series[seriesOptions.name] = chart[seriesConstructor](seriesOptions);
  series[seriesOptions.name].setData(data);
};

// Auto resizes the chart when the browser window is resized.
const resizeHandler = (container) => {
  if (!chart || !container) return;
  const dimensions = container.getBoundingClientRect();
  chart.resize(dimensions.width, dimensions.height);
};

export default {
  props: {
    priceSeriesType: {
      type: String,
      default: "line",
    },
    priceSeriesData: {
      type: Array,
      required: true,
    },
    priceSeriesOptions: {
      type: Object,
    },
    volumeSeriesType: {
      type: String,
      default: "histogram",
    },
    volumeSeriesData: {
      type: Array,
    },
    volumeSeriesOptions: {
      type: Object,
    },
    autosize: {
      default: true,
      type: Boolean,
    },
    chartOptions: {
      type: Object,
    },
    timeScaleOptions: {
      type: Object,
    },
    priceScaleOptions: {
      type: Object,
    },
    valuePrecision: {
      type: Number,
      default: 100,
    },
  },
  mounted() {
    // Create the Lightweight Charts Instance using the container ref.
    chart = createChart(this.$refs.chartContainer, this.chartOptions);
    addSeriesAndData(
      this.priceSeriesType,
      this.priceSeriesOptions,
      this.priceSeriesData
    );
    addSeriesAndData(
      this.volumeSeriesType,
      this.volumeSeriesOptions,
      this.volumeSeriesData
    );

    if (this.priceScaleOptions) {
      chart.priceScale().applyOptions(this.priceScaleOptions);
    }

    if (this.timeScaleOptions) {
      chart.timeScale().applyOptions(this.timeScaleOptions);
    }

    chart.timeScale().fitContent();

    if (this.autosize) {
      window.addEventListener("resize", () =>
        resizeHandler(this.$refs.chartContainer)
      );
    }

    this.createTooltip();
  },
  unmounted() {
    if (chart) {
      chart.remove();
      chart = null;
    }
    if (series) {
      series = null;
    }
    window.removeEventListener("resize", resizeHandler);
  },
  /*
   * Watch for changes to any of the component properties.
   *
   * If an options property is changed then we will apply those options
   * on top of any existing options previously set (since we are using the
   * `applyOptions` method).
   *
   * If there is a change to the chart type, then the existing series is removed
   * and the new series is created, and assigned the data.
   *
   */
  watch: {
    autosize(enabled) {
      if (!enabled) {
        window.removeEventListener("resize", () =>
          resizeHandler(this.$refs.chartContainer)
        );
        return;
      }
      window.addEventListener("resize", () =>
        resizeHandler(this.$refs.chartContainer)
      );
    },
    priceSeriesType() {
      if (series.price && chart) {
        chart.removeSeries(series.price);
      }
      addSeriesAndData(
        this.priceSeriesType,
        this.priceSeriesOptions,
        this.priceSeriesData
      );
    },
    priceSeriesData(newData) {
      if (!series.price) return;
      series.price.setData(newData);
      chart.timeScale().fitContent();
    },
    priceSeriesOptions(newOptions) {
      if (!series.price) return;
      series.price.applyOptions(newOptions);
    },
    volumeSeriesType() {
      if (series.volume && chart) {
        chart.removeSeries(series.volume);
      }
      addSeriesAndData(
        this.volumeSeriesType,
        this.volumeSeriesOptions,
        this.volumeSeriesData
      );
    },
    volumeSeriesData(newData) {
      if (!series.volume) return;
      series.volume.setData(newData);
      chart.timeScale().fitContent();
    },
    volumeSeriesOptions(newOptions) {
      if (!series.volume) return;
      series.volume.applyOptions(newOptions);
    },
    chartOptions(newOptions) {
      if (!chart) return;
      chart.applyOptions(newOptions);
    },
    priceScaleOptions(newOptions) {
      if (!chart) return;
      chart.priceScale().applyOptions(newOptions);
    },
    timeScaleOptions(newOptions) {
      if (!chart) return;
      chart.timeScale().applyOptions(newOptions);
    },
  },
  methods: {
    fitContent() {
      if (!chart) return;
      chart.timeScale().fitContent();
    },
    getChart() {
      return chart;
    },
    createTooltip() {
      const toolTipWidth = 300;
      const toolTipHeight = 80;
      const toolTipMargin = 15;

      // Create and style the tooltip html element
      const toolTip = document.createElement("div");
      toolTip.style = `
      background:white;
      color:black;
      width: ${toolTipWidth};
      height: ${toolTipHeight};
      position: absolute;
      display: none;
      padding: 1.2rem 1.5rem;
      box-sizing: border-box;
      font-size: 1.3rem;
      text-align: left;
      z-index: 1000;
      top: 12px;
      left: 12px;
      pointer-events: none;
      border-radius: 2px;
      font-family: Inter, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      box-shadow: 0 0.8rem 1.6rem -0.3rem rgba(140, 148, 159, 0.15);
      border-radius: 0.6rem;`;
      this.$refs.chartContainer.appendChild(toolTip);

      // Update tooltip
      chart.subscribeCrosshairMove((param) => {
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.x > this.$refs.chartContainer.clientWidth ||
          param.point.y < 0 ||
          param.point.y > this.$refs.chartContainer.clientHeight
        ) {
          toolTip.style.display = "none";
        } else {
          const dateStr = param.time;
          const dateObj = new Date();
          const date = new Date(
            (dateStr + 60 * dateObj.getTimezoneOffset()) * 1000
          );
          toolTip.style.display = "block";
          const dataPrice = param.seriesData.get(series.price);
          const price =
            dataPrice.value !== undefined ? dataPrice.value : dataPrice.close;
          const dataVolume = param.seriesData.get(series.volume);
          const volumeValue =
            dataVolume.value !== undefined
              ? dataVolume.value
              : dataVolume.close;

          toolTip.innerHTML = `
            <div style="display:flex;flex-wrap:no-wrap;justify-content:space-between;gap: 2.5rem;">
              <span>${date.toLocaleDateString()}</span>
              <span style="color: #707070;">${date.toLocaleTimeString()}</span>
            </div>
            <div style="margin-top: 1rem;font-weight:bold">
              <span style="color:#707070;">Price: </span>
			        $${Math.round(this.valuePrecision * price) / this.valuePrecision}
			      </div>
            <div style="margin-top: 1rem;font-weight:bold">
              <span style="color:#707070;">Volume: </span>
			        $${Math.round(volumeValue)}
			      </div>`;

          const y = param.point.y;
          let left = param.point.x + toolTipMargin;
          if (left > this.$refs.chartContainer.clientWidth - toolTipWidth) {
            left = param.point.x - toolTipMargin - toolTipWidth;
          }

          let top = y + toolTipMargin;
          if (top > this.$refs.chartContainer.clientHeight - toolTipHeight) {
            top = y - toolTipHeight - toolTipMargin;
          }
          toolTip.style.left = left + "px";
          toolTip.style.top = top + "px";
        }
      });
    },
  },
  expose: ["fitContent", "getChart"],
};
</script>

<style scoped>
.lw-chart {
  height: calc(100% - 12rem);
  width: calc(100% - 2rem);
  padding-bottom: 2rem;
  padding-right: 2rem;
  padding-top: 10rem;
}

.floating-tooltip-2 {
  width: 96px;
  height: 80px;
  position: absolute;
  display: none;
  padding: 8px;
  box-sizing: border-box;
  font-size: 12px;
  color: #131722;
  background-color: rgba(255, 255, 255, 1);
  text-align: left;
  z-index: 1000;
  top: 12px;
  left: 12px;
  pointer-events: none;
  border: 1px solid rgba(255, 70, 70, 1);
  border-radius: 2px;
}
</style>
