<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Dashboard from './components/Dashboard.vue'
import Development from './components/Development.vue'
import NewProject from './components/NewProject.vue'
import Release from './components/Release.vue'
import Staff from './components/Staff.vue'
import Skills from './components/Skills.vue'
import Market from './components/Market.vue'
import Analytics from './components/Analytics.vue'
import History from './components/History.vue'
import SaveLoad from './components/SaveLoad.vue'
import SalePopup from './components/SalePopup.vue'
import {
  advanceWeek,
  beginDevelopment,
  fireStaff,
  game,
  hireStaff,
  isGameOver,
  releaseProject,
  resetGame,
  startNewProject,
  trainSkill,
  type Genre,
  type PriceMultiplier,
} from './game'

type Screen =
  | 'dashboard'
  | 'new-project'
  | 'development'
  | 'release'
  | 'gameover'
  | 'staff'
  | 'skills'
  | 'market'
  | 'analytics'
  | 'history'
  | 'save-load'

const screen = ref<Screen>('dashboard')
const selectedProjectId = ref<string | null>(null)
const showSalePopup = ref(false)

const selectedProject = computed(
  () => game.projects.find((project) => project.id === selectedProjectId.value) ?? null,
)
const activeProjects = computed(() =>
  game.projects.filter((project) => project.status !== 'released'),
)
const releasedProjects = computed(() =>
  game.projects.filter((project) => project.status === 'released'),
)
const releasedCount = computed(() => releasedProjects.value.length)

watch(isGameOver, (gameIsOver) => {
  if (gameIsOver) screen.value = 'gameover'
})

watch(selectedProject, (project) => {
  const needsProject = screen.value === 'development' || screen.value === 'release'
  if (!project && needsProject) screen.value = 'dashboard'
})

function handleAdvance(): void {
  if (isGameOver()) return
  advanceWeek()
}

function handleCreateProject(payload: { name: string; genre: Genre }): void {
  const project = startNewProject(payload.name, payload.genre)
  beginDevelopment(project.id)
  selectedProjectId.value = project.id
  screen.value = 'development'
}

function handleStartProject(projectId: string): void {
  beginDevelopment(projectId)
  selectedProjectId.value = projectId
  screen.value = 'development'
}

function handleOpenProject(projectId: string): void {
  selectedProjectId.value = projectId
  screen.value = 'development'
}

function handleSell(price: PriceMultiplier): void {
  if (!selectedProject.value) return
  releaseProject(selectedProject.value.id, price)
  selectedProjectId.value = null
  showSalePopup.value = true
  screen.value = 'dashboard'
}

function handleRestart(): void {
  resetGame()
  selectedProjectId.value = null
  showSalePopup.value = false
  screen.value = 'dashboard'
}

function closeSalePopup(): void {
  showSalePopup.value = false
}
</script>

<template>
  <div class="slate">
    <header class="masthead">
      <div class="masthead-title">
        <p class="eyebrow">Game Dev &amp; Monetization Simulator</p>
        <h1>Release<span class="wordmark-accent">Slate</span></h1>
      </div>
      <p class="issue">
        <span class="issue-label">Week</span>
        <strong>{{ String(game.week).padStart(2, '0') }}</strong>
      </p>
    </header>

    <main :key="screen" class="screen">
      <section v-if="screen === 'gameover'" class="gameover">
        <p class="eyebrow eyebrow--signal">Studio closed</p>
        <h2>ゲームオーバー</h2>
        <p class="gameover-lead">資金が尽き、スタジオを畳むことになった。</p>
        <dl class="gameover-stats">
          <div>
            <dt>到達週</dt>
            <dd>{{ game.week }} 週</dd>
          </div>
          <div>
            <dt>発売本数</dt>
            <dd>{{ releasedCount }} 本</dd>
          </div>
          <div>
            <dt>スタッフ数</dt>
            <dd>{{ game.staff.programmer + game.staff.designer }} 名</dd>
          </div>
          <div>
            <dt>累計売上</dt>
            <dd>{{ game.totalRevenue.toLocaleString('ja-JP') }} 円</dd>
          </div>
          <div>
            <dt>最終資金</dt>
            <dd>{{ game.money.toLocaleString('ja-JP') }} 円</dd>
          </div>
        </dl>
        <button type="button" class="btn btn--signal" @click="handleRestart">
          最初からやり直す
        </button>
      </section>

      <SalePopup
        v-if="showSalePopup && game.lastSaleDetail"
        :amount="game.lastSaleAmount"
        :detail="game.lastSaleDetail"
        @close="closeSalePopup"
      />

      <NewProject
        v-else-if="screen === 'new-project'"
        @create="handleCreateProject"
        @cancel="screen = 'dashboard'"
      />

      <Development
        v-else-if="screen === 'development' && selectedProject"
        :project="selectedProject"
        :week="game.week"
        :money="game.money"
        @advance="handleAdvance"
        @release="screen = 'release'"
        @back="screen = 'dashboard'"
      />

      <Release
        v-else-if="screen === 'release' && selectedProject"
        :project="selectedProject"
        @sell="handleSell"
        @back="screen = 'development'"
      />

      <Staff
        v-else-if="screen === 'staff'"
        :money="game.money"
        :staff="game.staff"
        @hire="handleHire"
        @fire="handleFire"
        @back="screen = 'dashboard'"
      />

      <Skills
        v-else-if="screen === 'skills'"
        :money="game.money"
        :skills="game.skills"
        @train="handleTrain"
        @back="screen = 'dashboard'"
      />

      <Market
        v-else-if="screen === 'market'"
        :trends="game.marketTrends"
        @back="screen = 'dashboard'"
      />

      <Analytics
        v-else-if="screen === 'analytics'"
        @back="screen = 'dashboard'"
      />

      <History
        v-else-if="screen === 'history'"
        @back="screen = 'dashboard'"
      />

      <SaveLoad
        v-else-if="screen === 'save-load'"
        @back="screen = 'dashboard'"
      />

      <Dashboard
        v-else
        :money="game.money"
        :week="game.week"
        :reputation="game.reputation"
        :staff="game.staff"
        :skills="game.skills"
        :projects="activeProjects"
        :released-projects="releasedProjects"
        :log="game.log"
        @advance="handleAdvance"
        @new-project="screen = 'new-project'"
        @open-project="handleOpenProject"
        @start-project="handleStartProject"
        @goto-staff="screen = 'staff'"
        @goto-skills="screen = 'skills'"
        @goto-market="screen = 'market'"
        @goto-analytics="screen = 'analytics'"
        @goto-history="screen = 'history'"
      />
    </main>
  </div>
</template>

<style scoped>
.slate {
  --font-display: 'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  --font-body: 'Zen Kaku Gothic New', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif;

  --ink: var(--text-h);
  --ink-soft: var(--text);
  --paper: var(--bg);
  --rule: var(--border);
  --panel: #101016;
  --panel-rule: rgba(255, 255, 255, 0.16);
  --panel-ink: #f3f2e9;
  --panel-soft: rgba(243, 242, 233, 0.62);
  --signal: #c6f04b;
  --alert: #ff4f2b;
  --gain: #2f8f5b;

  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px 52px 64px;
  box-sizing: border-box;
  text-align: left;
  font-family: var(--font-body);
  background-image:
    radial-gradient(circle at 6% -14%, rgba(170, 59, 255, 0.14), transparent 46%),
    radial-gradient(circle at 98% 2%, rgba(198, 240, 75, 0.24), transparent 38%);
  background-repeat: no-repeat;
  min-height: 100vh;
}

@media (prefers-color-scheme: dark) {
  .slate {
    --panel: #1b1c25;
    --gain: #7de08f;
    background-image:
      radial-gradient(circle at 6% -14%, rgba(192, 132, 252, 0.18), transparent 46%),
      radial-gradient(circle at 98% 2%, rgba(198, 240, 75, 0.12), transparent 38%);
  }
}

.masthead {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 18px;
  border-bottom: 2px solid var(--ink);
}

.eyebrow {
  margin: 0;
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.eyebrow--signal {
  color: var(--signal);
}

.masthead h1 {
  margin: 10px 0 0;
  font-family: var(--font-display);
  font-size: clamp(34px, 6vw, 64px);
  font-weight: 600;
  line-height: 0.88;
  letter-spacing: -0.055em;
  text-transform: uppercase;
  color: var(--ink);
}

.wordmark-accent {
  color: var(--accent);
}

.issue {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0;
  font-family: var(--font-display);
  white-space: nowrap;
}

.issue-label {
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.issue strong {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 500;
  letter-spacing: -0.05em;
  line-height: 1;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.screen {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 26px;
  animation: screen-in 450ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes screen-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gameover {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 18px;
  padding: clamp(32px, 6vw, 64px);
  background: var(--panel);
  color: var(--panel-ink);
  border: 1px solid var(--panel-rule);
  box-shadow: 14px 14px 0 rgba(170, 59, 255, 0.22);
}

.gameover h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(30px, 5vw, 52px);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--panel-ink);
}

.gameover-lead {
  margin: 0;
  color: var(--panel-soft);
  font-size: 15px;
}

.gameover-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 40px;
  margin: 6px 0 4px;
  padding: 16px 0;
  border-top: 1px solid var(--panel-rule);
  border-bottom: 1px solid var(--panel-rule);
  width: 100%;
}

.gameover-stats dt {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.gameover-stats dd {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: 24px;
  letter-spacing: -0.03em;
  color: var(--panel-ink);
  font-variant-numeric: tabular-nums;
}

.btn {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 14px 24px;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    background 160ms ease;
}

.btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--ink);
}

.btn:active {
  transform: none;
  box-shadow: none;
}

.btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.btn--signal {
  border-color: var(--signal);
  background: var(--signal);
  color: #101016;
}

.btn--signal:hover {
  box-shadow: 4px 4px 0 var(--panel-ink);
}

@media (max-width: 900px) {
  .slate {
    padding: 26px 20px 44px;
  }

  .masthead {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .slate :deep(*) {
    animation: none !important;
    transition: none !important;
  }
}
</style>