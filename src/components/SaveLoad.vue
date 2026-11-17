<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  hasSaveData,
  saveGame,
  loadGame,
  deleteSaveData,
  formatYen,
  game,
} from '../game'

const props = defineProps<{}>()

const emit = defineEmits<{
  back: []
}>()

const hasSave = ref(false)
const saveTimestamp = ref<number | null>(null)
const saving = ref(false)
const loading = ref(false)
const message = ref('')
const messageType = ref<'info' | 'success' | 'error'>('info')

function formatDate(ts: number): string {
  return new Date(ts).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function checkSave(): Promise<void> {
  try {
    const exists = await hasSaveData()
    hasSave.value = exists
    if (exists) {
      // タイムスタンプは取得できないので、現在のゲーム状態から推定（簡易版）
      saveTimestamp.value = null
    }
  } catch {
    hasSave.value = false
  }
}

async function handleSave(): Promise<void> {
  saving.value = true
  message.value = ''
  try {
    await saveGame()
    hasSave.value = true
    message.value = 'セーブしました'
    messageType.value = 'success'
  } catch (e) {
    message.value = `セーブに失敗しました: ${e instanceof Error ? e.message : String(e)}`
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}

async function handleLoad(): Promise<void> {
  loading.value = true
  message.value = ''
  try {
    const ok = await loadGame()
    if (ok) {
      message.value = 'ロードしました'
      messageType.value = 'success'
      emit('back')
    } else {
      message.value = 'セーブデータが見つかりません'
      messageType.value = 'error'
    }
  } catch (e) {
    message.value = `ロードに失敗しました: ${e instanceof Error ? e.message : String(e)}`
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function handleDelete(): Promise<void> {
  if (!confirm('セーブデータを削除します。よろしいですか？')) return
  try {
    await deleteSaveData()
    hasSave.value = false
    message.value = 'セーブデータを削除しました'
    messageType.value = 'success'
  } catch (e) {
    message.value = `削除に失敗しました: ${e instanceof Error ? e.message : String(e)}`
    messageType.value = 'error'
  }
}

onMounted(() => {
  checkSave()
})
</script>

<template>
  <div class="save-load">
    <div class="topline">
      <button type="button" class="back" @click="emit('back')">← ダッシュボード</button>
      <span class="topline-meta">セーブ・ロード / Save &amp; Load</span>
    </div>

    <section class="panel panel--dark">
      <p class="eyebrow">Save Data / セーブデータ</p>
      <h2 class="title">セーブ・ロード</h2>

      <div class="save-status">
        <span class="status-label">セーブデータ</span>
        <span :class="['status-value', { exists: hasSave }]">
          {{ hasSave ? 'あり' : 'なし' }}
        </span>
      </div>

      <div class="actions">
        <button
          type="button"
          class="btn btn--save"
          :disabled="saving"
          @click="handleSave"
        >
          {{ saving ? '保存中...' : 'セーブ' }}
        </button>
        <button
          type="button"
          class="btn btn--load"
          :disabled="!hasSave || loading"
          @click="handleLoad"
        >
          {{ loading ? '読込中...' : 'ロード' }}
        </button>
        <button
          type="button"
          class="btn btn--delete"
          :disabled="!hasSave"
          @click="handleDelete"
        >
          削除
        </button>
      </div>

      <p v-if="message" class="result-message" :class="`result-${messageType}`">
        {{ message }}
      </p>

      <div class="current-state">
        <h3>現在のゲーム状態</h3>
        <dl class="state-list">
          <div>
            <dt>資金</dt>
            <dd>{{ formatYen(game.money) }}</dd>
          </div>
          <div>
            <dt>週</dt>
            <dd>W{{ String(game.week).padStart(2, '0') }}</dd>
          </div>
          <div>
            <dt>評判</dt>
            <dd>{{ game.reputation }} / 100</dd>
          </div>
          <div>
            <dt>スタッフ</dt>
            <dd>プログラマー {{ game.staff.programmer }} 名 / デザイナー {{ game.staff.designer }} 名</dd>
          </div>
          <div>
            <dt>プロジェクト</dt>
            <dd>{{ game.projects.length }} 件</dd>
          </div>
          <div>
            <dt>発売済み</dt>
            <dd>{{ game.projects.filter((p) => p.status === 'released').length }} 件</dd>
          </div>
          <div>
            <dt>累計売上</dt>
            <dd>{{ formatYen(game.totalRevenue) }}</dd>
          </div>
        </dl>
      </div>

      <p class="hint">
        IndexedDB に自動保存されます。ブラウザを閉じてもデータは保持されます。\nセーブボタンで明示的に保存、ロードボタンで復元できます。
      </p>
    </section>
  </div>
</template>

<style scoped>
.save-load {
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

.save-status {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 1px solid var(--panel-rule);
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 24px;
}

.status-label {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.status-value {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--panel-ink);
}

.status-value.exists {
  color: var(--signal);
}

.actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
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
    box-shadow 160ms ease,
    background 160ms ease;
  width: 100%;
  max-width: 180px;
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

.btn--save {
  background: var(--ink);
  color: var(--paper);
}

.btn--save:hover:not(:disabled) {
  box-shadow: 4px 4px 0 var(--accent);
}

.btn--load {
  border-color: var(--signal);
  color: var(--signal);
}

.btn--load:hover:not(:disabled) {
  box-shadow: 4px 4px 0 var(--signal);
}

.btn--delete {
  border-color: var(--alert);
  color: var(--alert);
}

.btn--delete:hover:not(:disabled) {
  box-shadow: 4px 4px 0 var(--alert);
}

.result-message {
  margin: 0 0 20px;
  padding: 12px 16px;
  border-radius: 4px;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.result-success {
  background: rgba(47, 143, 91, 0.15);
  color: var(--gain);
  border: 1px solid var(--gain);
}

.result-error {
  background: rgba(255, 79, 43, 0.15);
  color: var(--alert);
  border: 1px solid var(--alert);
}

.result-info {
  background: rgba(170, 59, 255, 0.15);
  color: var(--accent);
  border: 1px solid var(--accent);
}

.current-state {
  margin-top: 20px;
}

.current-state h3 {
  margin: 0 0 14px;
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.state-list {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.state-list > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--panel-rule);
}

.state-list > div:last-child {
  border-bottom: none;
}

.state-list dt {
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--panel-soft);
}

.state-list dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--panel-ink);
  font-variant-numeric: tabular-nums;
}

.hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--panel-soft);
  white-space: pre-wrap;
}

@media (max-width: 640px) {
  .actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    max-width: none;
  }
}
</style>