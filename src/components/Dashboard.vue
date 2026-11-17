<script setup lang="ts">
import { computed } from 'vue'
import {
  WEEKLY_STAFF_COST,
  STAFF_WEEKLY_SALARY,
  formatYen,
  weeksRemaining,
  trendMultiplier,
  type LogEntry,
  type Project,
  type ProjectStatus,
  type Staff,
  type Skills,
} from '../game'

const props = defineProps<{
  money: number
  week: number
  reputation: number
  staff: Staff
  skills: Skills
  projects: Project[]
  releasedProjects: Project[]
  log: LogEntry[]
}>()

const emit = defineEmits<{
  advance: []
  'new-project': []
  'open-project': [projectId: string]
  'start-project': [projectId: string]
  'goto-staff': []
  'goto-skills': []
  'goto-market': []
  'goto-analytics': []
  'goto-history': []
}>()

const statusLabels: Record<ProjectStatus, string> = {
  planning: '企画中',
  development: '開発中',
  released: '発売済み',
}

const developingCount = computed(
  () => props.projects.filter((project) => project.status === 'development').length,
)
const totalStaff = computed(() => props.staff.programmer + props.staff.designer)
const weeklyPayroll = computed(
  () =>
    props.staff.programmer * STAFF_WEEKLY_SALARY.programmer +
    props.staff.designer * STAFF_WEEKLY_SALARY.designer,
)

function progressText(project: Project): string {
  if (project.status === 'planning') return '開発開始待ち'
  if (project.progress >= 100) return `完成 / 品質 ${project.quality}`
  return `${Math.round(project.progress)}% ・ 残り ${weeksRemaining(project)} 週`
}
</script>

<template>
  <div class="dashboard">
    <p v-if="money <= 0" class="alert">資金が尽きました。ゲームオーバーです。</p>

    <section class="stats">
      <article class="stat">
        <p class="stat-label">資金 / Cash</p>
        <p class="stat-value" :class="{ 'is-negative': money < 0 }">{{ formatYen(money) }}</p>
        <p class="stat-note">
          週次コスト {{ formatYen(weeklyPayroll) }}、開発中 {{ developingCount }} 件
        </p>
      </article>

      <article class="stat">
        <p class="stat-label">週 / Week</p>
        <p class="stat-value">{{ String(week).padStart(2, '0') }}</p>
        <p class="stat-note">発売済み {{ releasedProjects.length }} 本</p>
      </article>

      <article class="stat">
        <p class="stat-label">評判 / Reputation</p>
        <p class="stat-value">
          {{ reputation }}<span class="stat-unit">/100</span>
        </p>
        <div class="meter" :aria-label="`評判 ${reputation} / 100`">
          <span :style="{ width: `${reputation}%` }" />
        </div>
      </article>

      <article class="stat stat--staff">
        <p class="stat-label">スタッフ / Staff</p>
        <p class="stat-value">{{ totalStaff }} 名</p>
        <p class="stat-note">週給 {{ formatYen(weeklyPayroll) }}</p>
      </article>

      <article class="stat stat--skills">
        <p class="stat-label">スキル / Skills</p>
        <p class="stat-value">
          P{{ skills.program }} D{{ skills.design }} S{{ skills.sound }} Pl{{ skills.plan }}
        </p>
        <p class="stat-note">研修で成長</p>
      </article>
    </section>

    <section class="actions">
      <button type="button" class="btn btn--primary" :disabled="money <= 0" @click="emit('advance')">
        1週間進める <span class="arrow" aria-hidden="true">→</span>
      </button>
      <button type="button" class="btn" @click="emit('new-project')">新規開発</button>
      <button type="button" class="btn" @click="emit('goto-staff')">スタッフ</button>
      <button type="button" class="btn" @click="emit('goto-skills')">スキル</button>
      <button type="button" class="btn" @click="emit('goto-market')">市場</button>
      <button type="button" class="btn" @click="emit('goto-analytics')">グラフ</button>
      <button type="button" class="btn" @click="emit('goto-history')">履歴</button>
      <p class="actions-note">週を進めると開発が進行し、スタッフ給与が発生し、市場トレンドが変動する。</p>
    </section>

    <div class="columns">
      <section class="panel">
        <header class="panel-head">
          <h2>進行中プロジェクト</h2>
          <span class="panel-count">{{ projects.length }}</span>
        </header>

        <ul v-if="projects.length" class="projects">
          <li v-for="project in projects" :key="project.id" class="project">
            <div class="project-top">
              <span class="genre">{{ project.genre }}</span>
              <span class="status" :data-status="project.status">
                {{ statusLabels[project.status] }}
              </span>
            </div>
            <h3 class="project-name">{{ project.name }}</h3>
            <div class="bar" :class="{ 'bar--done': project.progress >= 100 }">
              <span :style="{ width: `${project.progress}%` }" />
            </div>
            <div class="project-foot">
              <span class="project-progress">{{ progressText(project) }}</span>
              <button
                v-if="project.status === 'planning'"
                type="button"
                class="link-btn"
                @click="emit('start-project', project.id)"
              >
                開発開始 →
              </button>
              <button
                v-else
                type="button"
                class="link-btn"
                @click="emit('open-project', project.id)"
              >
                {{ project.progress >= 100 ? '発売する →' : '開発画面 →' }}
              </button>
            </div>
          </li>
        </ul>

        <p v-else class="empty">
          まだプロジェクトはない。「新規開発」から最初の企画を立ち上げよう。
        </p>
      </section>

      <aside class="panel panel--dark">
        <header class="panel-head">
          <h2>週次ログ</h2>
          <span class="panel-count">{{ log.length }}</span>
        </header>

        <ol v-if="log.length" class="log-list">
          <li v-for="entry in log" :key="entry.id" :data-tone="entry.tone">
            <span class="log-week">W{{ String(entry.week).padStart(2, '0') }}</span>
            <span class="log-message">{{ entry.message }}</span>
          </li>
        </ol>
        <p v-else class="empty empty--dark">
          まだ動きはない。1週間進めるか、新規開発を開始しよう。
        </p>
      </aside>
    </div>

    <section v-if="releasedProjects.length" class="panel panel--released">
      <header class="panel-head">
        <h2>発売済み</h2>
        <span class="panel-count">{{ releasedProjects.length }}</span>
      </header>
      <ul class="released-list">
        <li v-for="project in releasedProjects" :key="project.id">
          <span class="project-name">{{ project.name }}</span>
          <span class="released-meta">{{ project.genre }} / 品質 {{ project.quality }}</span>
          <strong class="released-revenue">{{ formatYen(project.revenue) }}</strong>
        </li>
      </ul>
    </section>

    <section class="panel panel--market">
      <header class="panel-head">
        <h2>市場トレンド（簡易）</h2>
        <button type="button" class="link-btn" @click="emit('goto-market')">詳細 →</button>
      </header>
      <ul class="market-list">
        <li
          v-for="genre in ['パズル', 'アクション', 'RPG', 'シミュレーション']"
          :key="genre"
          class="market-item"
        >
          <span class="market-genre">{{ genre }}</span>
          <span class="market-ratio">{{ trendMultiplier(genre).toFixed(2) }}x</span>
          <span class="market-tag" :class="{ hot: trendMultiplier(genre) > 1.05, cold: trendMultiplier(genre) < 0.95 }">
            {{ trendMultiplier(genre) > 1.05 ? '人気' : trendMultiplier(genre) < 0.95 ? '飽和' : '安定' }}
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alert {
  margin: 0;
  padding: 12px 18px;
  border: 1px solid var(--alert);
  background: rgba(255, 79, 43, 0.1);
  color: var(--alert);
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid var(--rule);
  background: var(--paper);
}

.stat {
  padding: 18px 24px 20px;
  border-right: 1px solid var(--rule);
  animation: rise 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.stat:last-child {
  border-right: none;
}

.stat:nth-child(2) {
  animation-delay: 60ms;
}

.stat:nth-child(3) {
  animation-delay: 120ms;
}

.stat:nth-child(4) {
  animation-delay: 180ms;
}

.stat:nth-child(5) {
  animation-delay: 240ms;
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

.stat-label {
  margin: 0;
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.stat-value {
  margin: 8px 0 6px;
  font-family: var(--font-display);
  font-size: clamp(20px, 3vw, 30px);
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.stat-value.is-negative {
  color: var(--alert);
}

.stat-unit {
  font-size: 14px;
  letter-spacing: 0;
  color: var(--ink-soft);
}

.stat-note {
  margin: 0;
  font-size: 11px;
  color: var(--ink-soft);
}

.meter {
  height: 6px;
  margin-top: 10px;
  background: var(--rule);
  overflow: hidden;
}

.meter span {
  display: block;
  height: 100%;
  background: var(--accent);
  transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.actions-note {
  margin: 0 0 0 auto;
  max-width: 360px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ink-soft);
  text-align: right;
}

.btn {
  font-family: var(--font-display);
  font-size: 11px;
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
}

.btn .arrow {
  display: inline-block;
  margin-left: 6px;
  transition: transform 160ms ease;
}

.btn:hover:not(:disabled) {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--ink);
}

.btn:hover:not(:disabled) .arrow {
  transform: translateX(4px);
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

.btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.columns {
  display: grid;
  grid-template-columns: minmax(0, 1.62fr) minmax(240px, 1fr);
  gap: 20px;
  align-items: start;
}

.panel {
  border: 1px solid var(--rule);
  background: var(--paper);
  padding: 20px 24px 24px;
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
  font-size: 11px;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}

.projects {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

.project {
  padding: 16px 0;
  border-bottom: 1px dashed var(--rule);
}

.project:first-child {
  padding-top: 0;
}

.project:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.project-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.genre {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.status {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 3px 8px;
  border: 1px solid var(--rule);
  color: var(--ink-soft);
}

.status[data-status='development'] {
  border-color: var(--ink);
  color: var(--ink);
}

.project-name {
  margin: 8px 0 12px;
  font-family: var(--font-body);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.bar {
  height: 8px;
  background: var(--rule);
  overflow: hidden;
}

.bar span {
  display: block;
  height: 100%;
  background: var(--ink);
  transition: width 480ms cubic-bezier(0.22, 1, 0.36, 1);
}

.bar--done span {
  background: var(--gain);
}

.project-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.project-progress {
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}

.link-btn {
  padding: 0;
  border: none;
  background: none;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--accent);
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.link-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.panel--dark {
  background: var(--panel);
  border-color: var(--panel-rule);
  color: var(--panel-ink);
}

.panel--dark .panel-head {
  border-bottom-color: var(--panel-rule);
}

.panel--dark .panel-head h2 {
  color: var(--panel-ink);
}

.panel--dark .panel-count {
  color: var(--panel-soft);
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.log-list li {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 10px;
  align-items: baseline;
  font-size: 13px;
  line-height: 1.5;
}

.log-week {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--panel-soft);
  font-variant-numeric: tabular-nums;
}

.log-message {
  color: var(--panel-ink);
}

.log-list li[data-tone='gain'] .log-message {
  color: var(--signal);
}

.log-list li[data-tone='loss'] .log-message {
  color: var(--alert);
}

.panel--released {
  padding-bottom: 16px;
}

.released-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.released-list li {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto;
  gap: 16px;
  align-items: baseline;
  font-size: 13px;
}

.released-list .project-name {
  margin: 0;
  font-size: 15px;
}

.released-meta {
  font-family: var(--font-display);
  font-size: 11px;
  color: var(--ink-soft);
}

.released-revenue {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--gain);
  font-variant-numeric: tabular-nums;
}

.empty {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ink-soft);
}

.empty--dark {
  color: var(--panel-soft);
}

.panel--market {
  border: 1px solid var(--rule);
  background: var(--paper);
  padding: 20px 24px 24px;
}

.market-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.market-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed var(--rule);
  font-size: 13px;
}

.market-item:last-child {
  border-bottom: none;
}

.market-genre {
  font-family: var(--font-body);
  font-weight: 700;
  color: var(--ink);
}

.market-ratio {
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
  color: var(--ink-soft);
}

.market-tag {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 2px 8px;
  border: 1px solid var(--rule);
  color: var(--ink-soft);
}

.market-tag.hot {
  border-color: var(--signal);
  color: var(--signal);
}

.market-tag.cold {
  border-color: var(--alert);
  color: var(--alert);
}

@media (max-width: 900px) {
  .stats {
    grid-template-columns: 1fr;
  }

  .stat {
    border-right: none;
    border-bottom: 1px solid var(--rule);
  }

  .stat:last-child {
    border-bottom: none;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn {
    width: 100%;
  }

  .actions-note {
    margin: 10px 0 0;
    max-width: none;
    text-align: left;
  }

  .columns {
    grid-template-columns: minmax(0, 1fr);
  }

  .released-list li {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .released-meta {
    grid-row: 2;
  }
}
</style>