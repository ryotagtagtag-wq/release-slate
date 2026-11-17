<script setup lang="ts">
import { computed } from 'vue'
import {
  WEEKLY_STAFF_COST,
  formatYen,
  isDevelopmentComplete,
  weeksRemaining,
  type Project,
} from '../game'

const props = defineProps<{
  project: Project
  week: number
  money: number
}>()

const emit = defineEmits<{
  advance: []
  release: []
  back: []
}>()

const isComplete = computed(() => isDevelopmentComplete(props.project))
const remaining = computed(() => weeksRemaining(props.project))
const elapsedWeeks = computed(() => Math.max(0, props.week - props.project.startWeek))
</script>

<template>
  <div class="development">
    <div class="topline">
      <button type="button" class="back" @click="emit('back')">← ダッシュボード</button>
      <span class="topline-meta">Week {{ String(week).padStart(2, '0') }} 時点</span>
    </div>

    <div class="grid">
      <section class="panel panel--dark">
        <p class="eyebrow">{{ project.genre }} / {{ isComplete ? '開発完了' : '開発中' }}</p>
        <h2 class="title">{{ project.name }}</h2>

        <div class="big-bar" :class="{ 'big-bar--done': isComplete }">
          <span :style="{ width: `${project.progress}%` }" />
        </div>

        <div class="progress-row">
          <strong class="percent">
            {{ Math.round(project.progress) }}<span>%</span>
          </strong>
          <p class="progress-note">
            <template v-if="isComplete">品質 {{ project.quality }} で確定。リリースできる。</template>
            <template v-else>完成まで残り {{ remaining }} 週</template>
          </p>
        </div>

        <p class="quote">
          <template v-if="isComplete">
            「ビルドは通った。あとは値段を決めるだけだ。」
          </template>
          <template v-else>
            「まだ荒い。バグが {{ project.bugs }} 件積まれている。」
          </template>
        </p>
      </section>

      <aside class="panel specs">
        <header class="panel-head">
          <h2>開発状況</h2>
          <span class="panel-count">{{ project.estimatedWeeks }} 週計画</span>
        </header>

        <dl class="spec-list">
          <div>
            <dt>ジャンル</dt>
            <dd>{{ project.genre }}</dd>
          </div>
          <div>
            <dt>開始週</dt>
            <dd>W{{ String(project.startWeek).padStart(2, '0') }}</dd>
          </div>
          <div>
            <dt>経過週</dt>
            <dd>{{ elapsedWeeks }} 週</dd>
          </div>
          <div>
            <dt>残り週</dt>
            <dd>{{ remaining }} 週</dd>
          </div>
          <div>
            <dt>バグ</dt>
            <dd>{{ project.bugs }} 件</dd>
          </div>
          <div>
            <dt>週次給与</dt>
            <dd>{{ formatYen(WEEKLY_STAFF_COST) }}</dd>
          </div>
          <div class="spec-quality">
            <dt>品質</dt>
            <dd :class="{ 'is-locked': !isComplete }">
              {{ isComplete ? project.quality : '未確定' }}
            </dd>
          </div>
        </dl>

        <div class="actions">
          <button
            type="button"
            class="btn btn--primary"
            :disabled="isComplete || money <= 0"
            @click="emit('advance')"
          >
            1週間進める
          </button>
          <button
            type="button"
            class="btn btn--signal"
            :disabled="!isComplete"
            @click="emit('release')"
          >
            リリースへ
          </button>
        </div>

        <p class="hint">
          <template v-if="money <= 0">資金が尽きている。週を進められない。</template>
          <template v-else-if="isComplete">発売価格を決めてリリースしよう。</template>
          <template v-else>品質は開発完了時に確定し、バグが多いほど下がる。</template>
        </p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.development {
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
  grid-template-columns: minmax(0, 1.5fr) minmax(250px, 0.9fr);
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
  justify-content: space-between;
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
  margin: 12px 0 28px;
  font-family: var(--font-body);
  font-size: clamp(26px, 4vw, 40px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--panel-ink);
}

.big-bar {
  height: 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid var(--panel-rule);
  overflow: hidden;
}

.big-bar span {
  display: block;
  height: 100%;
  background: var(--panel-ink);
  transition: width 620ms cubic-bezier(0.22, 1, 0.36, 1);
}

.big-bar--done span {
  background: var(--signal);
}

.progress-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-top: 14px;
}

.percent {
  font-family: var(--font-display);
  font-size: clamp(34px, 6vw, 56px);
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: -0.06em;
  color: var(--panel-ink);
  font-variant-numeric: tabular-nums;
}

.percent span {
  font-size: 0.42em;
  letter-spacing: 0;
  color: var(--panel-soft);
}

.progress-note {
  margin: 0;
  font-size: 13px;
  text-align: right;
  color: var(--panel-soft);
}

.quote {
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid var(--panel-rule);
  font-size: 13px;
  line-height: 1.6;
  color: var(--panel-soft);
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 4px;
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
  font-size: 10px;
  color: var(--ink-soft);
}

.spec-list {
  margin: 0;
}

.spec-list > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px dashed var(--rule);
}

.spec-list > div:last-child {
  border-bottom: none;
}

.spec-list dt {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.spec-list dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: -0.01em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.spec-list dd.is-locked {
  color: var(--ink-soft);
}

.spec-quality dd {
  font-size: 22px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 14px 22px;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
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

.btn--primary {
  background: var(--ink);
  color: var(--paper);
}

.btn--primary:hover:not(:disabled) {
  box-shadow: 4px 4px 0 var(--accent);
}

.btn--signal {
  background: var(--signal);
  border-color: var(--signal);
  color: #101016;
}

.btn--signal:hover:not(:disabled) {
  box-shadow: 4px 4px 0 var(--ink);
}

.btn:disabled {
  opacity: 0.32;
  cursor: not-allowed;
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

  .progress-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .progress-note {
    text-align: left;
  }
}
</style>
