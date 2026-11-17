import { reactive } from 'vue'

export const GENRES = ['パズル', 'アクション', 'RPG', 'シミュレーション'] as const
export type Genre = (typeof GENRES)[number]

export const PRICE_MULTIPLIERS = [1, 1.5, 2] as const
export type PriceMultiplier = (typeof PRICE_MULTIPLIERS)[number]

export type ProjectStatus = 'planning' | 'development' | 'released'
export type LogTone = 'info' | 'gain' | 'loss'

export interface GenreProfile {
  /** 予定開発週数 */
  estimatedWeeks: number
  /** 1 週間あたりの進捗上昇率（%） */
  progressPerWeek: number
  /** 完成時の品質ベース値 */
  qualityBase: number
}

export const GENRE_PROFILES: Record<Genre, GenreProfile> = {
  パズル: { estimatedWeeks: 4, progressPerWeek: 25, qualityBase: 62 },
  アクション: { estimatedWeeks: 8, progressPerWeek: 12.5, qualityBase: 68 },
  RPG: { estimatedWeeks: 12, progressPerWeek: 100 / 12, qualityBase: 76 },
  シミュレーション: { estimatedWeeks: 10, progressPerWeek: 10, qualityBase: 72 },
}

export const INITIAL_MONEY = 100_000
export const INITIAL_REPUTATION = 10
export const WEEKLY_STAFF_COST = 5_000
export const REVENUE_PER_QUALITY = 1_000
export const MAX_BUGS = 20
export const QUALITY_NOISE = 10

const LOG_LIMIT = 8
const BUGS_PER_WEEK_MAX = 1
const QUALITY_FLOOR = 5
const QUALITY_CEILING = 100
const REPUTATION_CEILING = 100
/** 100 / 12 週のような割り切れない速度でも最終週で必ず完成させるための許容誤差 */
const COMPLETION_THRESHOLD = 100 - 1e-6

export interface Project {
  id: string
  name: string
  genre: Genre
  progress: number
  quality: number
  bugs: number
  startWeek: number
  estimatedWeeks: number
  status: ProjectStatus
  revenue: number
}

export interface LogEntry {
  id: number
  week: number
  message: string
  tone: LogTone
}

export interface GameState {
  money: number
  week: number
  reputation: number
  projects: Project[]
  log: LogEntry[]
}

let nextProjectId = 1
let nextLogId = 1

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function randomInt(min: number, max: number, random: () => number = Math.random): number {
  return Math.floor(random() * (max - min + 1)) + min
}

export function createInitialState(): GameState {
  return {
    money: INITIAL_MONEY,
    week: 1,
    reputation: INITIAL_REPUTATION,
    projects: [],
    log: [],
  }
}

export const game = reactive<GameState>(createInitialState())

export function formatYen(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  return `${sign}¥${Math.round(Math.abs(amount)).toLocaleString('ja-JP')}`
}

export function calculateRevenue(quality: number, price: PriceMultiplier): number {
  return Math.round(quality * REVENUE_PER_QUALITY * price)
}

export function reputationDeltaForQuality(quality: number): number {
  return Math.round((quality - 60) / 10)
}

export function rollQuality(
  input: { qualityBase: number; bugs: number; reputation: number },
  random: () => number = Math.random,
): number {
  const reputationBonus = input.reputation * 0.2
  const bugPenalty = input.bugs * 1.5
  const noise = randomInt(-QUALITY_NOISE, QUALITY_NOISE, random)
  return clamp(Math.round(input.qualityBase + reputationBonus - bugPenalty + noise), QUALITY_FLOOR, QUALITY_CEILING)
}

export function weeksRemaining(project: Project): number {
  if (project.status !== 'development' || project.progress >= 100) return 0
  return Math.ceil((100 - project.progress) / GENRE_PROFILES[project.genre].progressPerWeek)
}

export function isGameOver(): boolean {
  return game.money <= 0
}

export function isDevelopmentComplete(project: Project): boolean {
  return project.status === 'development' && project.progress >= 100
}

function requireProject(projectId: string): Project {
  const project = game.projects.find((candidate) => candidate.id === projectId)
  if (!project) throw new Error(`プロジェクトが見つかりません: ${projectId}`)
  return project
}

function pushLog(message: string, tone: LogTone): void {
  game.log.unshift({ id: nextLogId++, week: game.week, message, tone })
  if (game.log.length > LOG_LIMIT) game.log.length = LOG_LIMIT
}

export function startNewProject(name: string, genre: Genre): Project {
  const trimmedName = name.trim()
  if (!trimmedName) throw new Error('ゲーム名を入力してください')

  const profile = GENRE_PROFILES[genre]
  if (!profile) throw new Error(`未知のジャンルです: ${genre}`)

  const project: Project = {
    id: `project-${nextProjectId++}`,
    name: trimmedName,
    genre,
    progress: 0,
    quality: 0,
    bugs: 0,
    startWeek: 0,
    estimatedWeeks: profile.estimatedWeeks,
    status: 'planning',
    revenue: 0,
  }

  game.projects.push(project)
  pushLog(`企画「${project.name}」（${project.genre}）を立ち上げた`, 'info')
  return project
}

export function beginDevelopment(projectId: string): void {
  const project = requireProject(projectId)
  if (project.status !== 'planning') {
    throw new Error(`企画中のプロジェクトのみ開発を開始できます: ${project.name}`)
  }

  project.status = 'development'
  project.startWeek = game.week
  pushLog(`「${project.name}」の開発を開始（予定 ${project.estimatedWeeks} 週）`, 'info')
}

function advanceProject(project: Project): void {
  if (project.status !== 'development') return
  if (project.progress >= 100) return

  const profile = GENRE_PROFILES[project.genre]
  const nextProgress = project.progress + profile.progressPerWeek
  project.progress = nextProgress >= COMPLETION_THRESHOLD ? 100 : nextProgress
  project.bugs = Math.min(MAX_BUGS, project.bugs + randomInt(0, BUGS_PER_WEEK_MAX))

  if (project.progress < 100) {
    pushLog(`「${project.name}」の開発が ${Math.round(project.progress)}% に到達`, 'info')
    return
  }

  project.quality = rollQuality({
    qualityBase: profile.qualityBase,
    bugs: project.bugs,
    reputation: game.reputation,
  })
  pushLog(`「${project.name}」が完成（品質 ${project.quality}）`, 'gain')
}

export function advanceWeek(): void {
  if (isGameOver()) throw new Error('資金が尽きているため、週を進められません')

  game.week += 1

  const developingProjects = game.projects.filter((project) => project.status === 'development')
  for (const project of developingProjects) advanceProject(project)

  const payroll = WEEKLY_STAFF_COST * developingProjects.length
  if (payroll === 0) {
    pushLog('開発中のプロジェクトはない。今週の給与は発生しない', 'info')
    return
  }

  game.money -= payroll
  pushLog(`スタッフ給与 ${formatYen(-payroll)}（開発中 ${developingProjects.length} 件）`, 'loss')

  if (isGameOver()) pushLog('資金が尽きた。スタジオは閉鎖された', 'loss')
}

export function releaseProject(projectId: string, price: PriceMultiplier): number {
  const project = requireProject(projectId)

  if (project.status !== 'development') {
    throw new Error(`開発中のプロジェクトのみ発売できます: ${project.name}`)
  }
  if (project.progress < 100) {
    throw new Error(`開発が完了していません: ${project.name}`)
  }
  if (!(PRICE_MULTIPLIERS as readonly number[]).includes(price)) {
    throw new Error(`価格倍率が不正です: ${price}`)
  }

  const revenue = calculateRevenue(project.quality, price)
  const reputationDelta = reputationDeltaForQuality(project.quality)

  project.status = 'released'
  project.revenue = revenue
  game.money += revenue
  game.reputation = clamp(game.reputation + reputationDelta, 0, REPUTATION_CEILING)

  pushLog(
    `「${project.name}」を ${price}x で発売。売上 +${formatYen(revenue)}（評判 ${reputationDelta >= 0 ? '+' : ''}${reputationDelta}）`,
    'gain',
  )

  return revenue
}

export function resetGame(): void {
  Object.assign(game, createInitialState())
  nextProjectId = 1
  nextLogId = 1
}
