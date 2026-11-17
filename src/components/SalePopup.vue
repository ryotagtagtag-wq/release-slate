<script setup lang="ts">
import { computed } from 'vue'
import { formatYen, type PriceMultiplier } from '../game'

const props = defineProps<{
  amount: number
  detail: {
    projectName: string
    quality: number
    price: PriceMultiplier
    trendBonus: number
  }
}>()

const emit = defineEmits<{
  close: []
}>()

const bonusText = computed(() => {
  const b = props.detail.trendBonus
  if (b > 1.05) return `＋市場トレンドボーナス ×${b.toFixed(2)}`
  if (b < 0.95) return `−市場トレンドペナルティ ×${b.toFixed(2)}`
  return ''
})
</script>

<template>
  <div class="sale-popup-overlay" @click.self="emit('close')">
    <div class="sale-popup" @click.stop>
      <p class="eyebrow">Release / 発売</p>
      <h2 class="title">{{ detail.projectName }}</h2>
      <p class="detail">品質 {{ detail.quality }} / 価格 {{ detail.price.toFixed(1) }}x</p>

      <div class="amount">
        <span class="amount-label">売上</span>
        <span class="amount-value">+{{ formatYen(amount) }}</span>
      </div>

      <p v-if="bonusText" class="bonus">{{ bonusText }}</p>

      <button type="button" class="btn btn--signal" @click="emit('close')">
        OK
      </button>
    </div>
  </div>
</template>

<style scoped>
.sale-popup-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 16, 22, 0.7);
  backdrop-filter: blur(4px);
  z-index: 50;
  padding: 24px;
  box-sizing: border-box;
}

.sale-popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 40px;
  background: var(--panel);
  border: 1px solid var(--panel-rule);
  box-shadow: 14px 14px 0 rgba(170, 59, 255, 0.22);
  text-align: center;
  max-width: 420px;
  width: 100%;
  box-sizing: border-box;
  animation: popup-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes popup-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.eyebrow {
  margin: 0;
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--signal);
}

.title {
  margin: 4px 0 6px;
  font-family: var(--font-display);
  font-size: clamp(28px, 5vw, 40px);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--panel-ink);
}

.detail {
  margin: 0;
  font-size: 13px;
  color: var(--panel-soft);
}

.amount {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 20px 0;
}

.amount-label {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.amount-value {
  font-family: var(--font-display);
  font-size: clamp(32px, 7vw, 56px);
  font-weight: 600;
  letter-spacing: -0.05em;
  color: var(--signal);
  font-variant-numeric: tabular-nums;
}

.bonus {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--gain);
}

.btn {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 16px 32px;
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
</style>