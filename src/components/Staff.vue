<script setup lang="ts">
import { computed } from 'vue'
import {
  STAFF_HIRE_COST,
  STAFF_WEEKLY_SALARY,
  MAX_STAFF,
  formatYen,
  type Staff,
} from '../game'

const props = defineProps<{
  money: number
  staff: Staff
}>()

const emit = defineEmits<{
  hire: [role: 'programmer' | 'designer']
  fire: [role: 'programmer' | 'designer']
  back: []
}>()

const totalStaff = computed(() => props.staff.programmer + props.staff.designer)
const weeklyPayroll = computed(
  () =>
    props.staff.programmer * STAFF_WEEKLY_SALARY.programmer +
    props.staff.designer * STAFF_WEEKLY_SALARY.designer,
)

function roleLabel(role: 'programmer' | 'designer'): string {
  return role === 'programmer' ? 'プログラマー' : 'デザイナー'
}

function canHire(role: 'programmer' | 'designer'): boolean {
  return totalStaff.value < MAX_STAFF && props.money >= STAFF_HIRE_COST[role]
}

function canFire(role: 'programmer' | 'designer'): boolean {
  return props.staff[role] > 0
}
</script>

<template>
  <div class="staff">
    <div class="topline">
      <button type="button" class="back" @click="emit('back')">← ダッシュボード</button>
      <span class="topline-meta">スタッフ管理 / Staff</span>
    </div>

    <section class="panel panel--dark">
      <p class="eyebrow">Team / チーム</p>
      <h2 class="title">スタッフ</h2>

      <dl class="staff-summary">
        <div>
          <dt>スタッフ数</dt>
          <dd class="staff-count">{{ totalStaff }} / {{ MAX_STAFF }} 名</dd>
        </div>
        <div>
          <dt>週給合計</dt>
          <dd class="payroll">{{ formatYen(weeklyPayroll) }} / 週</dd>
        </div>
      </dl>

      <div class="staff-list">
        <div class="staff-row" v-for="(role, key) in ['programmer', 'designer'] as const" :key="key">
          <div class="staff-info">
            <span class="staff-role">{{ roleLabel(role) }}</span>
            <span class="staff-qty">{{ props.staff[role] }} 名</span>
          </div>
          <div class="staff-actions">
            <button
              type="button"
              class="btn btn--hire"
              :disabled="!canHire(role)"
              @click="emit('hire', role)"
            >
              雇用 {{ formatYen(STAFF_HIRE_COST[role]) }}
            </button>
            <button
              type="button"
              class="btn btn--fire"
              :disabled="!canFire(role)"
              @click="emit('fire', role)"
            >
              解雇
            </button>
          </div>
        </div>
      </div>

      <p class="hint">
        スタッフを雇うと毎週給与が発生する。スタッフが多いほど開発速度が上がる。\n上限は {{ MAX_STAFF }} 名まで。
      </p>
    </section>
  </div>
</template>

<style scoped>
.staff {
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

.staff-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0 0 24px;
  padding: 16px 0;
  border-top: 1px solid var(--panel-rule);
  border-bottom: 1px solid var(--panel-rule);
}

.staff-summary dt {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.staff-summary dd {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: -0.02em;
  color: var(--panel-ink);
  font-variant-numeric: tabular-nums;
}

.staff-count {
  color: var(--signal);
}

.payroll {
  color: var(--alert);
}

.staff-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 24px;
}

.staff-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border: 1px solid var(--panel-rule);
  background: rgba(255, 255, 255, 0.03);
}

.staff-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.staff-role {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  color: var(--panel-ink);
}

.staff-qty {
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--panel-soft);
}

.staff-actions {
  display: flex;
  gap: 10px;
}

.btn {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 12px 18px;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--ink);
}

.btn:active:not(:disabled) {
  transform: none;
  box-shadow: none;
}

.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn--hire {
  background: var(--ink);
  color: var(--paper);
}

.btn--hire:hover:not(:disabled) {
  box-shadow: 4px 4px 0 var(--accent);
}

.btn--fire {
  border-color: var(--alert);
  color: var(--alert);
}

.btn--fire:hover:not(:disabled) {
  box-shadow: 4px 4px 0 var(--alert);
}

.hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--panel-soft);
  white-space: pre-wrap;
}

@media (max-width: 900px) {
  .staff-summary {
    grid-template-columns: minmax(0, 1fr);
  }

  .staff-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .staff-actions {
    justify-content: stretch;
  }

  .btn {
    width: 100%;
  }
}
</style>