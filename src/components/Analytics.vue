<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { LineChart, BarChart } from 'vue-chart-3'
import { Title, Tooltip, Legend, CategoryScale, LinearScale, Chart as ChartJS } from 'chart.js'
import {
  getRevenueHistory,
  getMoneyHistory,
  getMarketTrendData,
  formatYen,
} from '../game'

// Chart.js コンポーネントの登録
ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale)

const props = defineProps<{}>()

const emit = defineEmits<{
  back: []
}>()

const chartColors = {
  primary: '#c6f04b',
  secondary: '#aa3bff',
  gain: '#2f8f5b',
  alert: '#ff4f2b',
  ink: '#08060d',
  inkSoft: '#6b6375',
}

const revenueChartData = ref<any>(null)
const moneyChartData = ref<any>(null)
const marketChartData = ref<any>(null)

const revenueChartOptions = ref<any>({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1200,
    easing: 'easeOutQuart',
  },
  plugins: {
    title: {
      display: true,
      text: '週別売上推移',
      color: '#08060d',
      font: { family: "'IBM Plex Mono', monospace", size: 14, weight: 600 },
    },
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: '売上（円）',
        color: '#08060d',
        font: { family: "'IBM Plex Mono', monospace", size: 12 },
      },
      ticks: {
        color: '#6b6375',
        font: { family: "'IBM Plex Mono', monospace", size: 11 },
        callback: (value: number) => `¥${value}`,
      },
      grid: {
        color: '#e5e4e7',
      },
    },
    x: {
      title: {
        display: true,
        text: '週',
        color: '#08060d',
        font: { family: "'IBM Plex Mono', monospace", size: 12 },
      },
      ticks: {
        color: '#6b6375',
        font: { family: "'IBM Plex Mono', monospace", size: 11 },
      },
      grid: {
        display: false,
      },
    },
  },
})

const moneyChartOptions = ref<any>({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1200,
    easing: 'easeOutQuart',
  },
  plugins: {
    title: {
      display: true,
      text: '資金推移',
      color: '#08060d',
      font: { family: "'IBM Plex Mono', monospace", size: 14, weight: 600 },
    },
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: '資金（円）',
        color: '#08060d',
        font: { family: "'IBM Plex Mono', monospace", size: 12 },
      },
      ticks: {
        color: '#6b6375',
        font: { family: "'IBM Plex Mono', monospace", size: 11 },
        callback: (value: number) => `¥${value}`,
      },
      grid: {
        color: '#e5e4e7',
      },
    },
    x: {
      title: {
        display: true,
        text: '週',
        color: '#08060d',
        font: { family: "'IBM Plex Mono', monospace", size: 12 },
      },
      ticks: {
        color: '#6b6375',
        font: { family: "'IBM Plex Mono', monospace", size: 11 },
      },
      grid: {
        display: false,
      },
    },
  },
})

const marketChartOptions = ref<any>({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1200,
    easing: 'easeOutQuart',
  },
  plugins: {
    title: {
      display: true,
      text: '市場トレンド（人気度 / 飽和度）',
      color: '#08060d',
      font: { family: "'IBM Plex Mono', monospace", size: 14, weight: 600 },
    },
    legend: {
      display: true,
      position: 'bottom',
      labels: {
        color: '#6b6375',
        font: { family: "'IBM Plex Mono', monospace", size: 11 },
      },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      title: {
        display: true,
        text: '0〜100',
        color: '#08060d',
        font: { family: "'IBM Plex Mono', monospace", size: 12 },
      },
      ticks: {
        color: '#6b6375',
        font: { family: "'IBM Plex Mono', monospace", size: 11 },
      },
      grid: {
        color: '#e5e4e7',
      },
    },
    x: {
      ticks: {
        color: '#6b6375',
        font: { family: "'IBM Plex Mono', monospace", size: 11 },
      },
      grid: {
        display: false,
      },
    },
  },
})

onMounted(() => {
  const revenue = getRevenueHistory()
  const money = getMoneyHistory()
  const market = getMarketTrendData()

  revenueChartData.value = {
    labels: revenue.labels,
    datasets: [
      {
        label: '売上（円）',
        data: revenue.data,
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(198, 240, 75, 0.15)',
        borderWidth: 3,
        pointBackgroundColor: chartColors.primary,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  moneyChartData.value = {
    labels: money.labels,
    datasets: [
      {
        label: '資金（円）',
        data: money.data,
        borderColor: chartColors.secondary,
        backgroundColor: 'rgba(170, 59, 255, 0.15)',
        borderWidth: 3,
        pointBackgroundColor: chartColors.secondary,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4,
      },
    ],
  }

  marketChartData.value = {
    labels: market.labels,
    datasets: [
      {
        label: '人気度',
        data: market.popularity,
        backgroundColor: 'rgba(198, 240, 75, 0.7)',
        borderColor: chartColors.primary,
        borderWidth: 1,
      },
      {
        label: '飽和度',
        data: market.saturation,
        backgroundColor: 'rgba(255, 79, 43, 0.7)',
        borderColor: chartColors.alert,
        borderWidth: 1,
      },
    ],
  }
})

onUnmounted(() => {
  revenueChartData.value = null
  moneyChartData.value = null
  marketChartData.value = null
})
</script>

<template>
  <div class="analytics">
    <div class="topline">
      <button type="button" class="back" @click="emit('back')">← ダッシュボード</button>
      <span class="topline-meta">データ分析 / Analytics</span>
    </div>

    <section class="panel panel--dark">
      <p class="eyebrow">Analysis / 分析</p>
      <h2 class="title">売上・資金グラフ</h2>

      <div class="chart-grid">
        <div class="chart-card">
          <div class="chart-wrap" style="height: 260px;">
            <LineChart :data="revenueChartData" :options="revenueChartOptions" />
          </div>
          <p class="chart-note">週ごとの発売売上。リリースがない週は 0 です。</p>
        </div>

        <div class="chart-card">
          <div class="chart-wrap" style="height: 260px;">
            <LineChart :data="moneyChartData" :options="moneyChartOptions" />
          </div>
          <p class="chart-note">週ごとの資金残高。赤字になるとゲームオーバー。</p>
        </div>

        <div class="chart-card">
          <div class="chart-wrap" style="height: 260px;">
            <BarChart :data="marketChartData" :options="marketChartOptions" />
          </div>
          <p class="chart-note">人気度（緑）が高いほど売上ボーナス、飽和度（赤）が高いほど低下。</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.analytics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.back {
  padding: 0;
  border: none;
  background: none;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-soft);
  cursor: pointer;
}

.back:hover {
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.back:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.topline-meta {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.panel {
  padding: clamp(22px, 3.5vw, 36px);
  border: 1px solid var(--rule);
  background: var(--paper);
}

.panel--dark {
  display: flex;
  flex-direction: column;
  gap: 22px;
  background: var(--panel);
  border-color: var(--panel-rule);
  color: var(--panel-ink);
  animation: rise 440ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.eyebrow {
  margin: 0;
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.title {
  margin: 12px 0 24px;
  font-family: var(--font-body);
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--panel-ink);
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.chart-card {
  padding: 20px;
  border: 1px solid var(--panel-rule);
  background: rgba(255, 255, 255, 0.03);
}

.chart-wrap {
  width: 100%;
  height: 260px;
  margin-bottom: 12px;
}

.chart-note {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--panel-soft);
}

@media (max-width: 900px) {
  .chart-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>