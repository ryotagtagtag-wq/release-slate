<script setup lang="ts">
import { computed } from 'vue'
import {
  SKILL_TRAIN_COST,
  MAX_SKILL_LEVEL,
  formatYen,
  type Skills,
} from '../game'

const props = defineProps<{
  money: number
  skills: Skills
}>()

const emit = defineEmits<{
  train: [skill: 'program' | 'design' | 'sound' | 'plan']
  back: []
}>()

const skillLabels: Record<'program' | 'design' | 'sound' | 'plan', string> = {
  program: 'プログラム',
  design: 'デザイン',
  sound: 'サウンド',
  plan: '企画',
}

const skillDescriptions: Record<'program' | 'design' | 'sound' | 'plan', string> = {
  program: '開発速度と品質に寄与',
  design: '完成度と見た目の品質に寄与',
  sound: '没入感と評価に寄与',
  plan: '企画のまとまりと売上に寄与',
}

function canTrain(skill: 'program' | 'design' | 'sound' | 'plan'): boolean {
  const level = props.skills[skill]
  if (level >= MAX_SKILL_LEVEL) return false
  const cost = SKILL_TRAIN_COST[level]
  return props.money >= cost
}

function trainCost(skill: 'program' | 'design' | 'sound' | 'plan'): number {
  const level = props.skills[skill]
  return SKILL_TRAIN_COST[level]
}
</script>

<template>
  <div class="skills">
    <div class="topline">
      <button type="button" class="back" @click="emit('back')">← ダッシュボード</button>
      <span class="topline-meta">開発スキル / Skills</span>
    </div>

    <section class="panel panel--dark">
      <p class="eyebrow">Growth / 成長</p>
      <h2 class="title">スキル研修</h2>

      <p class=intro>
        スキルを上げると開発品質・速度が上がる。研修には資金が必要。最大レベルは {{ MAX_SKILL_LEVEL }}。
      </p>

      <div class="skill-list">
        <div
          v-for="skill in ['program', 'design', 'sound', 'plan'] as const"
          :key="skill"
          class="skill-card"
          :class="{ 'is-max': skills[skill] >= MAX_SKILL_LEVEL }"
        >
          <div class="skill-header">
            <span class="skill-name">{{ skillLabels[skill] }}</span>
            <span class="skill-level">Lv{{ skills[skill] }}</span>
          </div>
          <p class="skill-desc">{{ skillDescriptions[skill] }}</p>

          <div class="skill-progress">
            <div class="progress-track">
              <span
                class="progress-fill"
                :style="{ width: `${(skills[skill] / MAX_SKILL_LEVEL) * 100}%` }"
              />
            </div>
          </div>

          <div class="skill-actions">
            <button
              type="button"
              class="btn btn--train"
              :disabled="!canTrain(skill)"
              @click="emit('train', skill)"
            >
              <template v-if="skills[skill] >= MAX_SKILL_LEVEL">最大</template>
              <template v-else>研修 {{ formatYen(trainCost(skill)) }}</template>
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.skills {
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

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
}

.skill-card {
  padding: 18px 22px;
  border: 1px solid var(--panel-rule);
  background: rgba(255, 255, 255, 0.03);
}

.skill-card.is-max {
  opacity: 0.55;
}

.skill-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.skill-name {
  font-family: var(--font-body);
  font-size: 17px;
  font-weight: 700;
  color: var(--panel-ink);
}

.skill-level {
  font-family: var(--font-display);
  font-size: 14px;
  letter-spacing: -0.03em;
  color: var(--signal);
  font-variant-numeric: tabular-nums;
}

.skill-desc {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--panel-soft);
}

.skill-progress {
  margin-bottom: 14px;
}

.progress-track {
  height: 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid var(--panel-rule);
  overflow: hidden;
}

.progress-fill {
  display: block;
  height: 100%;
  background: var(--signal);
  transition: width 480ms cubic-bezier(0.22, 1, 0.36, 1);
}

.skill-actions {
  display: flex;
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
  width: 100%;
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

.btn--train {
  background: var(--ink);
  color: var(--paper);
}

.btn--train:hover:not(:disabled) {
  box-shadow: 4px 4px 0 var(--accent);
}
</style>