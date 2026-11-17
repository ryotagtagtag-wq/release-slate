<script setup lang="ts">
import { trendMultiplier, type Genre, type MarketTrends } from '../game'

const props = defineProps<{
  trends: MarketTrends
}>()

const emit = defineEmits<{
  back: []
}>()

const genres: Genre[] = ['パズル', 'アクション', 'RPG', 'シミュレーション']

function trendMultiplierByGenre(genre: Genre): string {
  return trendMultiplier(genre).toFixed(2)
}

function trendLabel(trend: ReturnType<(typeof props)['trends'][string]>): string {
  const bonus = (trend.popularity - 50) / 200
  const penalty = -(trend.saturation - 50) / 200
  const total = bonus + penalty
  if (total > 0.05) return '追い風'
  if (total < -0.05) return '逆風'
  return '安定'
}

function trendColor(trend: ReturnType<(typeof props)['trends'][string]>): string {
  const bonus = (trend.popularity - 50) / 200
  const penalty = -(trend.saturation - 50) / 200
  const total = bonus + penalty
  if (total > 0.05) return 'var(--signal)'
  if (total < -0.05) return 'var(--alert)'
  return 'var(--ink-soft)'
}
</script>

<template>
  <div class="market">
    <div class="topline">
      <button type="button" class="back" @click="emit('back')">← ダッシュボード</button>
      <span class="topline-meta">市場トレンド / Market</span>
    </div>

    <section class="panel panel--dark">
      <p class="eyebrow">Trend / トレンド</p>
      <h2 class="title">市場分析</h2>

      <p class=intro>
        ジャンルごとの人気度と飽和度が毎週変動する。人気が高いほど売上ボーナス、飽和度が高いほど売上が下がる。
      </p>

      <table class="trend-table">
        <thead>
          <tr>
            <th>ジャンル</th>
            <th>人気度</th>
            <th>飽和度</th>
            <th>売上倍率</th>
            <th>状況</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="genre in genres" :key="genre">
            <td class="genre-name">{{ genre }}</td>
            <td class="metric popularity">{{ trends[genre]?.popularity }}%</td>
            <td class="metric saturation">{{ trends[genre]?.saturation }}%</td>
            <td class="metric multiplier">{{ trendMultiplierByGenre(genre) }}</td>
            <td class="status" :style="{ color: trendColor(trends[genre]) }">
              {{ trendLabel(trends[genre]) }}
            </td>
          </tr>
        </tbody>
      </table>

      <p class="hint">
        倍率 1.00 が基準。1.20 なら +20%、0.80 なら −20% の補正が発売時の売上に適用される。
      </p>
    </section>
  </div>
</template>

<style scoped>
.market {
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

.intro {
  margin: 0 0 24px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--panel-soft);
}

.trend-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.trend-table th {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid var(--panel-rule);
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.trend-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--panel-rule);
  color: var(--panel-ink);
}

.trend-table tr:last-child td {
  border-bottom: none;
}

.genre-name {
  font-family: var(--font-body);
  font-weight: 700;
}

.metric {
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
}

.multiplier {
  font-weight: 600;
}

.status {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--panel-soft);
}
</style>