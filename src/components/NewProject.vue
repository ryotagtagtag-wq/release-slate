<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  GENRES,
  GENRE_PROFILES,
  WEEKLY_STAFF_COST,
  calculateRevenue,
  formatYen,
  type Genre,
} from '../game'

const emit = defineEmits<{
  create: [payload: { name: string; genre: Genre }]
  cancel: []
}>()

const name = ref('')
const selectedGenre = ref<Genre>('パズル')
const errorMessage = ref('')

const selectedProfile = computed(() => GENRE_PROFILES[selectedGenre.value])
const estimatedCost = computed(() => selectedProfile.value.estimatedWeeks * WEEKLY_STAFF_COST)

function handleSubmit(): void {
  const trimmedName = name.value.trim()
  if (!trimmedName) {
    errorMessage.value = 'ゲーム名を入力してください'
    return
  }

  errorMessage.value = ''
  emit('create', { name: trimmedName, genre: selectedGenre.value })
}
</script>

<template>
  <form class="new-project" @submit.prevent="handleSubmit">
    <section class="panel">
      <p class="eyebrow">New project / 企画立案</p>
      <h2 class="title">どんなゲームを作る？</h2>

      <label class="field">
        <span class="field-label">ゲーム名</span>
        <input
          v-model="name"
          class="text-input"
          type="text"
          maxlength="32"
          placeholder="例：ネオン・スライド"
          autocomplete="off"
        />
      </label>

      <fieldset class="genres">
        <legend class="field-label">ジャンル</legend>
        <div class="genre-grid">
          <button
            v-for="genre in GENRES"
            :key="genre"
            type="button"
            class="genre-card"
            :class="{ 'is-selected': genre === selectedGenre }"
            :aria-pressed="genre === selectedGenre"
            @click="selectedGenre = genre"
          >
            <span class="genre-name">{{ genre }}</span>
            <span class="genre-meta">予定 {{ GENRE_PROFILES[genre].estimatedWeeks }} 週</span>
            <span class="genre-meta">品質ベース {{ GENRE_PROFILES[genre].qualityBase }}</span>
          </button>
        </div>
      </fieldset>

      <dl class="estimate">
        <div>
          <dt>開発費</dt>
          <dd>{{ formatYen(estimatedCost) }}</dd>
        </div>
        <div>
          <dt>品質の見込み</dt>
          <dd>{{ selectedProfile.qualityBase - 10 }} 〜 {{ selectedProfile.qualityBase + 10 }}</dd>
        </div>
        <div>
          <dt>売上目安（1.0x）</dt>
          <dd>{{ formatYen(calculateRevenue(selectedProfile.qualityBase, 1)) }}</dd>
        </div>
      </dl>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <div class="form-actions">
        <button type="submit" class="btn btn--primary">開発開始</button>
        <button type="button" class="btn" @click="emit('cancel')">キャンセル</button>
      </div>
      <p class="note">
        「開発開始」でプロジェクトを作成し、そのまま開発画面へ移動する。給与は開発中の各プロジェクトに毎週発生する。
      </p>
    </section>
  </form>
</template>

<style scoped>
.new-project {
  display: flex;
  justify-content: center;
}

.panel {
  width: 100%;
  max-width: 760px;
  padding: clamp(24px, 4vw, 40px);
  border: 1px solid var(--rule);
  background: var(--paper);
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
  color: var(--ink-soft);
}

.title {
  margin: 10px 0 28px;
  font-family: var(--font-body);
  font-size: clamp(24px, 3.4vw, 34px);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--ink);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 26px;
}

.field-label {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.text-input {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border: 1px solid var(--ink);
  background: transparent;
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 500;
  color: var(--ink);
  transition: box-shadow 160ms ease;
}

.text-input::placeholder {
  color: var(--ink-soft);
  opacity: 0.6;
}

.text-input:focus {
  outline: none;
  box-shadow: 4px 4px 0 var(--accent);
}

.genres {
  margin: 0 0 26px;
  padding: 0;
  border: none;
}

.genres .field-label {
  padding: 0;
  margin-bottom: 10px;
}

.genre-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.genre-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  padding: 14px 16px;
  border: 1px solid var(--rule);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.genre-card:hover {
  border-color: var(--ink);
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 var(--accent);
}

.genre-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

.genre-card.is-selected {
  border-color: var(--ink);
  background: var(--ink);
  color: var(--paper);
}

.genre-name {
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
}

.genre-meta {
  font-family: var(--font-display);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--ink-soft);
}

.genre-card.is-selected .genre-meta {
  color: inherit;
  opacity: 0.7;
}

.estimate {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 24px;
  padding: 16px 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

.estimate dt {
  font-family: var(--font-display);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.estimate dd {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: -0.02em;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.error {
  margin: 0 0 16px;
  font-family: var(--font-display);
  font-size: 12px;
  color: var(--alert);
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.btn {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 14px 24px;
  border: 1px solid var(--ink);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease;
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

.btn--primary {
  background: var(--ink);
  color: var(--paper);
}

.btn--primary:hover {
  box-shadow: 4px 4px 0 var(--accent);
}

.note {
  margin: 18px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--ink-soft);
}

@media (max-width: 640px) {
  .genre-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .estimate {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
