<script setup lang="ts">
import { computed } from 'vue'
import {
  getGenreRevenue,
  formatYen,
  type Project,
} from '../game'

const props = defineProps<{}>()

const emit = defineEmits<{
  back: []
}>()

const genreRevenue = computed(() => getGenreRevenue())
const totalRevenue = computed(() =>
  genreRevenue.value.reduce((sum, item) => sum + item.revenue, 0),
)
const totalReleased = computed(() =>
  genreRevenue.value.reduce((sum, item) => sum + item.count, 0),
)
const bestGenre = computed(() => {
  if (genreRevenue.value.length === 0) return null
  return [...genreRevenue.value].sort((a, b) => b.revenue - a.revenue)[0]
})
</script>

<template>
  <div class="history">
    <div class="topline">
      <button type="button" class="back" @click="emit('back')">← ダッシュボード</button>
      <span class="topline-meta">実績・履歴 / History</span>
    </div>

    <section class="panel panel--dark">
      <p class="eyebrow">Achievements / 実績</p>
      <h2 class="title">リリース履歴</h2>

      <div class="summary-stats">
        <div class="stat-card">
          <p class="stat-label">累計売上</p>
          <p class="stat-value">{{ formatYen(totalRevenue) }}</p>
        </div>
        <div class="stat-card">
          <p class="stat-label">発売本数</p>
          <p class="stat-value">{{ totalReleased }} 本</p>
        </div>
        <div class="stat-card" v-if="bestGenre">
          <p class="stat-label">最も売れたジャンル</p>
          <p class="stat-value">{{ bestGenre.genre }}</p>
          <p class="stat-note">{{ formatYen(bestGenre.revenue) }}（{{ bestGenre.count }} 本）</p>
        </div>
      </div>

      <table class="history-table">
        <thead>
          <tr>
            <th>ジャンル</th>
            <th>発売本数</th>
            <th>累計売上</th>
            <th>1 本あたり平均</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in genreRevenue" :key="item.genre">
            <td class="genre-name">{{ item.genre }}</td>
            <td class="metric count">{{ item.count }} 本</td>
            <td class="metric revenue">{{ formatYen(item.revenue) }}</td>
            <td class="metric avg">
              {{ item.count > 0 ? formatYen(Math.round(item.revenue / item.count)) : '¥0' }}
            </td>
          </tr>
          <tr v-if="genreRevenue.length === 0">
            <td colspan="4" class="empty">まだ発売済みのゲームはありません。</td>
          </tr>
        </tbody>
      </table>

      <p class="hint">
        ジャンル別の累計売上と発売本数を表示。市場トレンドに合ったジャンルを重点的に開発しよう。
      </p>
    </section>
  </div>
</template>

<style scoped>
.history {
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

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 0 0 24px;
}

.stat-card {
  padding: 20px 24px;
  border: 1px solid var(--panel-rule);
  background: rgba(255, 255, 255, 0.03);
}

.stat-label {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--panel-soft);
  margin: 0 0 8px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--panel-ink);
  font-variant-numeric: tabular-nums;
  margin: 0 0 6px;
}

.stat-note {
  margin: 0;
  font-size: 12px;
  color: var(--panel-soft);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.history-table th {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid var(--panel-rule);
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.history-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--panel-rule);
  color: var(--panel-ink);
}

.history-table tr:last-child td {
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

.revenue {
  color: var(--signal);
}

.empty {
  text-align: center;
  padding: 32px 0;
  color: var(--panel-soft);
}

.hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--panel-soft);
}

@media (max-width: 640px) {
  .summary-stats {
    grid-template-columns: minmax(0, 1fr);
  }

  .history-table {
    font-size: 12px;
  }

  .history-table th,
  .history-table td {
    padding: 10px 12px;
  }
}
</style>