<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  PRICE_MULTIPLIERS,
  WEEKLY_STAFF_COST,
  calculateRevenue,
  formatYen,
  reputationDeltaForQuality,
  type PriceMultiplier,
  type Project,
} from '../game'

const props = defineProps<{
  project: Project
}>()

const emit = defineEmits<{
  sell: [price: PriceMultiplier]
  back: []
}>()

const priceNotes: Record<PriceMultiplier, string> = {
  1: '低価格・幅広く',
  1.5: '標準',
  2: '強気・コア向け',
}

const selectedPrice = ref<PriceMultiplier>(1)

const reputationDelta = computed(() => reputationDeltaForQuality(props.project.quality))
const developmentCost = computed(() => props.project.estimatedWeeks * WEEKLY_STAFF_COST)
const selectedRevenue = computed(() => calculateRevenue(props.project.quality, selectedPrice.value))
const selectedProfit = computed(() => selectedRevenue.value - developmentCost.value)
</script>

<template>
  <div class="release">
    <div class="topline">
      <button type="button" class="back" @click="emit('back')">← 開発画面</button>
      <span class="topline-meta">発売価格の設定</span>
    </div>

    <div class="grid">
      <section class="panel panel--dark">
        <p class="eyebrow">Ready to ship</p>
        <h2 class="title">{{ project.name }}</h2>
        <p class="genre">{{ project.genre }}</p>

        <dl class="quality-block">
          <div>
            <dt>品質</dt>
            <dd class="quality-value">{{ project.quality }}</dd>
          </div>
          <div>
            <dt>バグ</dt>
            <dd>{{ project.bugs }} 件</dd>
          </div>
          <div>
            <dt>開発費</dt>
            <dd>{{ formatYen(developmentCost) }}</dd>
          </div>
        </dl>

        <p class="reputation-note">
          評判 {{ reputationDelta >= 0 ? '+' : '' }}{{ reputationDelta }} の見込み
        </p>
      </section>

      <section class="panel">
        <header class="panel-head">
          <h2>価格設定</h2>
          <span class="panel-count">品質 × 1,000 × 倍率</span>
        </header>

        <div class="price-options">
          <button
            v-for="price in PRICE_MULTIPLIERS"
            :key="price"
            type="button"
            class="price-card"
            :class="{ 'is-selected': price === selectedPrice }"
            :aria-pressed="price === selectedPrice"
            @click="selectedPrice = price"
          >
            <span class="price-label">{{ price.toFixed(1) }}x</span>
            <span class="price-note">{{ priceNotes[price] }}</span>
            <span class="price-revenue">{{ formatYen(calculateRevenue(project.quality, price)) }}</span>
          </button>
        </div>

        <dl class="summary">
          <div>
            <dt>売上</dt>
            <dd>{{ formatYen(selectedRevenue) }}</dd>
          </div>
          <div>
            <dt>開発費控除後</dt>
            <dd :class="{ 'is-negative': selectedProfit < 0 }">{{ formatYen(selectedProfit) }}</dd>
          </div>
        </dl>

        <button type="button" class="btn btn--signal" @click="emit('sell', selectedPrice)">
          発売する
        </button>
        <p class="hint">発売すると取り消せない。売上は即座に資金へ加算される。</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.release {
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

.grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 1.15fr);
  gap: 20px;
  align-items: stretch;
}

.panel {
  padding: clamp(22px, 3.5vw, 36px);
  border: 1px solid var(--rule);
  background: var(--paper);
}

.panel--dark {
  display: flex;
  flex-direction: column;
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
  color: var(--signal);
}

.title {
  margin: 12px 0 6px;
  font-family: var(--font-body);
  font-size: clamp(26px, 3.6vw, 38px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--panel-ink);
}

.genre {
  margin: 0 0 24px;
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.quality-block {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 32px;
  margin: auto 0 0;
  padding-top: 18px;
  border-top: 1px solid var(--panel-rule);
}

.quality-block dt {
  font-family: var(--font-display);
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.quality-block dd {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: -0.02em;
  color: var(--panel-ink);
  font-variant-numeric: tabular-nums;
}

.quality-block .quality-value {
  font-size: clamp(38px, 6vw, 58px);
  line-height: 0.9;
  letter-spacing: -0.06em;
  color: var(--signal);
}

.reputation-note {
  margin: 16px 0 0;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--panel-soft);
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--rule);
}

.panel-head h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink);
}

.panel-count {
  font-family: var(--font-display);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--ink-soft);
}

.price-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.price-card {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid var(--rule);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    transform 160ms ease,
    box-shadow 160ms ease;
}

.price-card:hover {
  border-color: var(--ink);
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 var(--accent);
}

.price-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.price-card.is-selected {
  border-color: var(--ink);
  box-shadow: inset 0 0 0 1px var(--ink);
}

.price-label {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 500;
  letter-spacing: -0.03em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.price-note {
  font-size: 12px;
  color: var(--ink-soft);
}

.price-revenue {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 22px 0;
  padding: 16px 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

.summary dt {
  font-family: var(--font-display);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.summary dd {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: 18px;
  letter-spacing: -0.02em;
  color: var(--gain);
  font-variant-numeric: tabular-nums;
}

.summary dd.is-negative {
  color: var(--alert);
}

.btn {
  width: 100%;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 16px 24px;
  border: 1px solid var(--signal);
  background: var(--signal);
  color: #101016;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
}

.btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 var(--ink);
}

.btn:active {
  transform: none;
  box-shadow: none;
}

.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.hint {
  margin: 14px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ink-soft);
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
