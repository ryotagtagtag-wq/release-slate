import { reactive } from 'vue'

export const GENRES = ['パズル', 'アクション', 'RPG', 'シミュレーション'] as const
export type Genre = (typeof GENRES)[number]

export const PRICE_MULTIPLIERS = [1, 1.5, 2] as const
export type PriceMultiplier = (typeof PRICE_MULTIPLIERS)[number]

export type ProjectStatus = 'planning' | 'development' | 'released'
export type LogTone = 'info' | 'gain' | 'loss'
export type StaffRole = 'programmer' | 'designer'
export type SkillName = 'program' | 'design' | 'sound' | 'plan'

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
export const REPUTATION_CEILING = 100

/** スタッフ雇用時の初期費用（役職別） */
export const STAFF_HIRE_COST: Record<StaffRole, number> = {
  programmer: 30_000,
  designer: 25_000,
}

/** スタッフ週給（役職別） */
export const STAFF_WEEKLY_SALARY: Record<StaffRole, number> = {
  programmer: 8_000,
  designer: 6_000,
}

/** スタッフ上限 */
export const MAX_STAFF = 6

/** スキル研修費用（レベル別：次のレベルへ上げるコスト） */
export const SKILL_TRAIN_COST: Record<number, number> = {
  1: 10_000,
  2: 20_000,
  3: 35_000,
  4: 50_000,
  5: 70_000,
}

/** スキル最大レベル */
export const MAX_SKILL_LEVEL = 5

const LOG_LIMIT = 8
const BUGS_PER_WEEK_MAX = 1
const QUALITY_FLOOR = 5
const QUALITY_CEILING = 100
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

export interface Staff {
  programmer: number
  designer: number
}

export interface Skills {
  program: number
  design: number
  sound: number
  plan: number
}

export interface MarketTrend {
  /** 人気度 0〜100（高いほど売上ボーナス） */
  popularity: number
  /** 飽和度 0〜100（高いほど売上ペナルティ） */
  saturation: number
}

export interface MarketTrends {
  [key: string]: MarketTrend
}

export interface GameState {
  money: number
  week: number
  reputation: number
  staff: Staff
  skills: Skills
  projects: Project[]
  marketTrends: MarketTrends
  log: LogEntry[]
  /** 直近の売上金額（ポップアップ表示用、release 後にセットされる） */
  lastSaleAmount: number
  /** 直近の売上詳細（ポップアップ表示用） */
  lastSaleDetail: { projectName: string; quality: number; price: PriceMultiplier; trendBonus: number } | null
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
    staff: { programmer: 1, designer: 0 },
    skills: { program: 1, design: 1, sound: 1, plan: 1 },
    projects: [],
    marketTrends: {
      パズル: { popularity: 60, saturation: 30 },
      アクション: { popularity: 50, saturation: 40 },
      RPG: { popularity: 55, saturation: 35 },
      シミュレーション: { popularity: 45, saturation: 25 },
    },
    log: [],
    lastSaleAmount: 0,
    lastSaleDetail: null,
  }
}

export const game = reactive<GameState>(createInitialState())

export function formatYen(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  return `${sign}¥${Math.round(Math.abs(amount)).toLocaleString('ja-JP')}`
}

export function calculateRevenue(
  quality: number,
  price: PriceMultiplier,
  trendBonus: number = 1,
): number {
  return Math.round(quality * REVENUE_PER_QUALITY * price * trendBonus)
}

/** 市場トレンドから売上倍率を算出（人気度高＝ボーナス、飽和度高＝ペナルティ） */
export function trendMultiplier(genre: Genre): number {
  const trend = game.marketTrends[genre]
  if (!trend) return 1
  const popularityBonus = (trend.popularity - 50) / 200 // -0.25 〜 +0.25
  const saturationPenalty = -(trend.saturation - 50) / 200 // -0.25 〜 +0.25
  return clamp(1 + popularityBonus + saturationPenalty, 0.5, 1.5)
}

export function reputationDeltaForQuality(quality: number): number {
  return Math.round((quality - 60) / 10)
}

export function rollQuality(
  input: { qualityBase: number; bugs: number; reputation: number; skills: Skills },
  random: () => number = Math.random,
): number {
  const reputationBonus = input.reputation * 0.2
  const bugPenalty = input.bugs * 1.5
  const skillBonus = (input.skills.program + input.skills.design + input.skills.sound + input.skills.plan) * 0.5
  const noise = randomInt(-QUALITY_NOISE, QUALITY_NOISE, random)
  return clamp(
    Math.round(input.qualityBase + reputationBonus - bugPenalty + skillBonus + noise),
    QUALITY_FLOOR,
    QUALITY_CEILING,
  )
}

export function weeksRemaining(project: Project): number {
  if (project.status !== 'development' || project.progress >= 100) return 0
  const speed = effectiveProgressSpeed(project)
  return Math.ceil((100 - project.progress) / speed)
}

/** スタッフ・スキルを反映した実効進捗速度 */
export function effectiveProgressSpeed(project: Project): number {
  const base = GENRE_PROFILES[project.genre].progressPerWeek
  const staffBonus = (game.staff.programmer + game.staff.designer) * 2 // スタッフ1人につき +2%/週
  const skillBonus = game.skills.program * 1.5 // プログラムスキルが速度に寄与
  return base + staffBonus + skillBonus
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

  const speed = effectiveProgressSpeed(project)
  const nextProgress = project.progress + speed
  project.progress = nextProgress >= COMPLETION_THRESHOLD ? 100 : nextProgress
  project.bugs = Math.min(MAX_BUGS, project.bugs + randomInt(0, BUGS_PER_WEEK_MAX))

  if (project.progress < 100) {
    pushLog(`「${project.name}」の開発が ${Math.round(project.progress)}% に到達`, 'info')
    return
  }

  project.quality = rollQuality({
    qualityBase: GENRE_PROFILES[project.genre].qualityBase,
    bugs: project.bugs,
    reputation: game.reputation,
    skills: game.skills,
  })
  pushLog(`「${project.name}」が完成（品質 ${project.quality}）`, 'gain')
}

export function advanceWeek(): void {
  if (isGameOver()) throw new Error('資金が尽きているため、週を進められません')

  game.week += 1

  const developingProjects = game.projects.filter((project) => project.status === 'development')
  for (const project of developingProjects) advanceProject(project)

  // スタッフ給与支払い
  const payroll = calculateWeeklyPayroll()
  if (payroll > 0) {
    game.money -= payroll
    pushLog(`スタッフ給与 ${formatYen(-payroll)}（スタッフ ${totalStaffCount()} 名）`, 'loss')
  } else {
    pushLog('開発中のプロジェクトもスタッフもいない。今週の給与は発生しない', 'info')
  }

  // 市場トレンド変動
  updateMarketTrends()

  if (isGameOver()) pushLog('資金が尽きた。スタジオは閉鎖された', 'loss')
}

/** スタッフ総数 */
export function totalStaffCount(): number {
  return game.staff.programmer + game.staff.designer
}

/** スタッフ総週給 */
export function calculateWeeklyPayroll(): number {
  return game.staff.programmer * STAFF_WEEKLY_SALARY.programmer + game.staff.designer * STAFF_WEEKLY_SALARY.designer
}

/** スタッフ雇用（初期費用＋週給増加） */
export function hireStaff(role: StaffRole): void {
  const cost = STAFF_HIRE_COST[role]
  if (game.money < cost) throw new Error(`資金が不足しています（必要: ${formatYen(cost)}）`)
  if (totalStaffCount() >= MAX_STAFF) throw new Error(`スタッフ上限（${MAX_STAFF}名）に達しています`)

  game.money -= cost
  game.staff[role] += 1
  pushLog(`${role === 'programmer' ? 'プログラマー' : 'デザイナー'}を雇用した（週給 ${formatYen(STAFF_WEEKLY_SALARY[role])}）`, 'info')
}

/** スタッフ解雇（即時、返金なし） */
export function fireStaff(role: StaffRole): void {
  if (game.staff[role] <= 0) throw new Error(`${role === 'programmer' ? 'プログラマー' : 'デザイナー'}がいない`)
  game.staff[role] -= 1
  pushLog(`${role === 'programmer' ? 'プログラマー' : 'デザイナー'}を解雇した`, 'loss')
}

/** スキル研修（次のレベルへ上げる） */
export function trainSkill(skill: SkillName): void {
  const currentLevel = game.skills[skill]
  if (currentLevel >= MAX_SKILL_LEVEL) throw new Error(`${skillLabel(skill)}は最大レベルです`)
  const cost = SKILL_TRAIN_COST[currentLevel]
  if (game.money < cost) throw new Error(`資金が不足しています（必要: ${formatYen(cost)}）`)

  game.money -= cost
  game.skills[skill] += 1
  pushLog(`${skillLabel(skill)}スキルが Lv${currentLevel} → Lv${currentLevel + 1} に上昇`, 'gain')
}

function skillLabel(skill: SkillName): string {
  const labels: Record<SkillName, string> = {
    program: 'プログラム',
    design: 'デザイン',
    sound: 'サウンド',
    plan: '企画',
  }
  return labels[skill]
}

/** 市場トレンドを週ごとに変動（ランダムウォード＋平均回帰） */
function updateMarketTrends(): void {
  for (const genre of GENRES) {
    const trend = game.marketTrends[genre]
    if (!trend) continue

    // 人気度：±10 のランダム変動＋50 への弱い平均回帰
    trend.popularity = clamp(
      Math.round(trend.popularity + randomInt(-10, 10) + (50 - trend.popularity) * 0.05),
      0,
      100,
    )
    // 飽和度：±8 のランダム変動＋30 への弱い平均回帰
    trend.saturation = clamp(
      Math.round(trend.saturation + randomInt(-8, 8) + (30 - trend.saturation) * 0.05),
      0,
      100,
    )
  }
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

  const bonus = trendMultiplier(project.genre)
  const revenue = calculateRevenue(project.quality, price, bonus)
  const reputationDelta = reputationDeltaForQuality(project.quality)

  project.status = 'released'
  project.revenue = revenue
  game.money += revenue
  game.reputation = clamp(game.reputation + reputationDelta, 0, REPUTATION_CEILING)

  // ゲーム感フィードバック用：直近売上情報を記録
  game.lastSaleAmount = revenue
  game.lastSaleDetail = {
    projectName: project.name,
    quality: project.quality,
    price,
    trendBonus: bonus,
  }

  pushLog(
    `「${project.name}」を ${price}x で発売。売上 +${formatYen(revenue)}${
      bonus !== 1 ? `（市場トレンド ×${bonus.toFixed(2)}）` : ''
    }（評判 ${reputationDelta >= 0 ? '+' : ''}${reputationDelta}）`,
    'gain',
  )

  return revenue
}

export function resetGame(): void {
  Object.assign(game, createInitialState())
  nextProjectId = 1
  nextLogId = 1
}
