// ─── Task Types ───────────────────────────────────

export type TaskStatus = "Inbox" | "In Progress" | "Done";
export type TaskPriority = "Urgent" | "Important" | "Someday";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority | null;
  context: string[];
  dueDate: string | null;
  energy: string | null;
  time: string | null;
  parentId?: string | null;
  subtaskCount?: number;
  subtasks?: Task[];
}

export interface CreateTaskRequest {
  task: string;
  source?: string;
  tags?: string[];
  context?: string;
  suggest_tags?: boolean;
}

export interface CreateTaskResponse {
  success: boolean;
  taskId: string;
  parsedTask: {
    title: string;
    priority: string;
    context?: string;
    energy?: string;
    time?: string;
    dueDate?: string | null;
    subtasks: string[];
    tags: string[];
  };
  message: string;
  source: string;
}

export interface UpdateTaskRequest {
  title?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  context?: string[];
}

export interface AllTasksResponse {
  success: boolean;
  count: number;
  tasks: Task[];
  source: string;
}

// ─── Note Types ───────────────────────────────────

export type NoteStatus = "draft" | "active" | "archived";
export type NotePriority = "low" | "medium" | "high" | "urgent";

export interface NoteLinks {
  tasks: { id: string; title: string }[];
  matters: { id: string; title: string; matterNumber?: string }[];
  projects: { id: string; title: string }[];
  notes: { id: string; title: string }[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  excerpt?: string | null;
  tags: string[];
  isPinned: boolean;
  priority: NotePriority;
  status: NoteStatus;
  reviewDate?: string | null;
  confidential: boolean;
  links?: NoteLinks | null;
  task?: { id: string; title: string } | null;
  matter?: { id: string; title: string } | null;
  project?: { id: string; title: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  isPinned?: boolean;
  priority?: NotePriority;
  status?: NoteStatus;
  reviewDate?: string;
  confidential?: boolean;
  taskId?: string;
  matterId?: string;
  projectId?: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
  priority?: NotePriority;
  status?: NoteStatus;
  reviewDate?: string | null;
  confidential?: boolean;
}

export interface NoteActionRequest {
  action: "duplicate" | "archive" | "unarchive" | "convert-to-task" | "set-review-date";
  context?: string;
  days?: number;
}

export interface NoteTemplate {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ─── Matter Types ─────────────────────────────────

export type MatterStatus = "active" | "on_hold" | "completed" | "archived";
export type MatterPriority = "low" | "medium" | "high" | "urgent";
export type MatterType = string; // Free text — DB accepts any value
export type Jurisdiction = string; // Free text — DB accepts any value; common: NSW, VIC, QLD, WA, SA, ACT, NT, TAS, Commonwealth, Federal Court, International
export type BillingStatus = "billable" | "non_billable" | "fixed_fee" | "time_and_materials";

export interface MatterCounts {
  documents: number;
  events: number;
  notes: number;
  tasks: number;
}

export interface MatterTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
}

export interface Matter {
  id: string;
  title: string;
  description?: string | null;
  client: string;
  matterNumber?: string | null;
  type: MatterType;
  status: MatterStatus;
  priority: MatterPriority;
  createdAt: string;
  updatedAt: string;
  dueDate?: string | null;
  completedAt?: string | null;
  lastActivityAt: string;
  budget?: string | null;
  actualSpend?: string | null;
  billingStatus?: BillingStatus | null;
  clientContact?: string | null;
  leadCounsel?: string | null;
  teamMembers: string[];
  externalCounsel: string[];
  practiceArea?: string | null;
  jurisdiction?: Jurisdiction | null;
  tags: string[];
  counterparty?: string | null;
  counterpartyContact?: string | null;
  tasks?: MatterTask[];
  _count?: MatterCounts;
}

export interface CreateMatterRequest {
  title: string;
  client: string;
  type: MatterType;
  description?: string;
  matterNumber?: string;
  status?: MatterStatus;
  priority?: MatterPriority;
  dueDate?: string;
  budget?: string;
  billingStatus?: BillingStatus;
  clientContact?: string;
  leadCounsel?: string;
  teamMembers?: string[];
  externalCounsel?: string[];
  practiceArea?: string;
  jurisdiction?: Jurisdiction;
  tags?: string[];
  counterparty?: string;
  counterpartyContact?: string;
  createdBy?: string;
}

export interface UpdateMatterRequest {
  title?: string;
  description?: string;
  client?: string;
  type?: MatterType;
  status?: MatterStatus;
  priority?: MatterPriority;
  dueDate?: string | null;
  budget?: string;
  actualSpend?: string;
  billingStatus?: BillingStatus;
  clientContact?: string;
  leadCounsel?: string;
  teamMembers?: string[];
  externalCounsel?: string[];
  practiceArea?: string;
  jurisdiction?: Jurisdiction;
  tags?: string[];
  counterparty?: string;
  counterpartyContact?: string;
  updatedBy?: string;
}

// ─── Matter Document Types ────────────────────────

export type DocumentType =
  | "contract"
  | "email"
  | "memo"
  | "correspondence"
  | "court_filing"
  | "research";
export type DocumentStatus = "draft" | "final" | "executed" | "superseded";

export interface MatterDocument {
  id: string;
  matterId: string;
  title: string;
  type: DocumentType;
  description?: string | null;
  fileUrl?: string | null;
  localPath?: string | null;
  version?: string | null;
  status?: DocumentStatus | null;
  author?: string | null;
  reviewedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  signedAt?: string | null;
  expiresAt?: string | null;
}

export interface CreateDocumentRequest {
  title: string;
  type: DocumentType;
  description?: string;
  fileUrl?: string;
  localPath?: string;
  version?: string;
  status?: DocumentStatus;
  author?: string;
  reviewedBy?: string;
  signedAt?: string;
  expiresAt?: string;
}

// ─── Matter Event Types ───────────────────────────

export type EventType =
  | "status_change"
  | "document_added"
  | "task_completed"
  | "note_added"
  | "meeting"
  | "deadline";

export interface MatterEvent {
  id: string;
  matterId: string;
  type: EventType;
  title: string;
  description?: string | null;
  actor?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreateEventRequest {
  type: EventType;
  title: string;
  description?: string;
  actor?: string;
  metadata?: Record<string, unknown>;
}

// ─── Matter Note Types ────────────────────────────

export type MatterNoteType = "general" | "decision" | "analysis" | "research" | "meeting_notes";

export interface MatterNote {
  id: string;
  matterId: string;
  title?: string | null;
  content: string;
  type: MatterNoteType;
  author?: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMatterNoteRequest {
  title?: string;
  content: string;
  type?: MatterNoteType;
  author?: string;
  tags?: string[];
}

// ─── Smart Surface Types ──────────────────────────

export interface SmartSurfaceRecommendation {
  taskId?: string;
  title: string;
  reason: string;
  score: number;
  priority: TaskPriority;
  source: string;
}

// ─── Journal Types ───────────────────────────────

export type JournalMood = "great" | "good" | "okay" | "low" | "rough";
export type JournalEnergy = "high" | "medium" | "low";

export interface JournalEntry {
  id: string;
  content: string;
  title?: string | null;
  excerpt?: string | null;
  wordCount: number;
  mood?: JournalMood | null;
  energy?: JournalEnergy | null;
  reflection?: string | null;
  themes: string[];
  tags: string[];
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  conversations?: { id: string; title?: string | null; createdAt: string }[];
}

export interface CreateJournalEntryRequest {
  content: string;
  title?: string;
  mood?: JournalMood;
  energy?: JournalEnergy;
  themes?: string[];
  tags?: string[];
  entryDate?: string;
}

export interface UpdateJournalEntryRequest {
  content?: string;
  title?: string;
  mood?: JournalMood;
  energy?: JournalEnergy;
  themes?: string[];
  tags?: string[];
  reflection?: string;
  entryDate?: string;
}

export interface JournalConversation {
  id: string;
  entryId?: string | null;
  title?: string | null;
  mode: string;
  createdAt: string;
  updatedAt: string;
  entry?: { id: string; title?: string | null; content: string; mood?: string | null; entryDate: string } | null;
  messages?: JournalMessage[];
}

export interface JournalMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface JournalInsights {
  period: { days: number; from: string; to: string };
  stats: {
    totalEntries: number;
    periodEntries: number;
    currentStreak: number;
    entriesPerWeek: number;
    totalWords: number;
    avgWordsPerEntry: number;
    conversationsThisPeriod: number;
  };
  moods: Record<string, number>;
  energy: Record<string, number>;
  topThemes: { theme: string; count: number }[];
  moodTimeline: { date: string; mood: string; energy?: string | null }[];
}

export interface JournalSummary {
  id: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  content: string;
  themes: string[];
  moodPattern?: string | null;
  insights?: Record<string, unknown> | null;
  createdAt: string;
}

// ─── Fitness Types ───────────────────────────────

export type WeekType = "kid" | "non-kid";
export type SleepQuality = "bad" | "ok" | "great";
export type RecoveryEnergy = "low" | "medium" | "high";
export type Soreness = "none" | "mild" | "sore";

export interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  primaryMuscles: string[];
  movementPattern: string | null;
  cues: string | null;
  spineNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  time: number | null;
  distance: number | null;
  rpe: number | null;
  notes: string | null;
}

export interface SessionExercise {
  id: string;
  order: number;
  exercise: Exercise;
  sets: ExerciseSet[];
}

export interface GymSession {
  id: string;
  date: string;
  sessionType: string;
  duration: number | null;
  notes: string | null;
  overallRPE: number | null;
  weekType: string | null;
  completedAt: string | null;
  taskId: string | null;
  createdAt: string;
  updatedAt: string;
  sessionExercises: SessionExercise[];
}

export interface ExerciseSuggestion {
  name: string;
  exerciseId: string;
  suggestedWeight: number;
  suggestedSets?: number;
  suggestedReps?: number;
  confidence?: "low" | "medium" | "high";
  lastWeight: number | null;
  rationale: string;
}

export interface WodInfo {
  name: string;
  format: string;
  duration: number | null;
  description: string;
}

export interface SessionSuggestion {
  recommendedSession: string;
  rationale: string;
  weekType: WeekType;
  runningLoadLast7Days: number;
  runningContext?: {
    acwr: number;
    trend: "increasing" | "decreasing" | "stable";
    weeklyLoad: number;
    recommendation: string;
  };
  frequency?: {
    thisWeek: number;
    thisMonth: number;
  };
  lastSession: {
    type: string;
    date: string;
    daysAgo: number;
  } | null;
  suggestedExercises: ExerciseSuggestion[];
  wod?: WodInfo;
}

export interface RunningStats {
  last7Days: {
    totalDistance: number;
    totalDuration: number;
    trainingLoad: number;
    sessions: number;
  };
  last30Days: {
    totalDistance: number;
    totalDuration: number;
    trainingLoad: number;
    sessions: number;
  };
  loadTrend: "increasing" | "decreasing" | "stable";
}

export interface RecoveryCheckin {
  id: string;
  date: string;
  sleepQuality: SleepQuality;
  energy: RecoveryEnergy;
  soreness: Soreness;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuickLogExercise {
  name: string;
  weight?: number;
  sets: number;
  reps?: number;
  time?: number;
  distance?: number;
  rpe?: number;
}

export interface QuickLogRequest {
  sessionType: string;
  weekType?: WeekType;
  notes?: string;
  overallRPE?: number;
  moodPost?: number;
  exercises: QuickLogExercise[];
}

export interface CreateRecoveryRequest {
  sleepQuality: SleepQuality;
  energy: RecoveryEnergy;
  soreness: Soreness;
  notes?: string;
}

// ─── Running Activity Types ─────────────────────

export interface UserSettings {
  id: string;
  maxHeartRate: number;
  restingHR: number | null;
  defaultWeekType: string;
}

export interface HRZone {
  zone: number;
  min: number;
  max: number;
  name: string;
}

export interface ZoneTime {
  zone: number;
  name: string;
  minutes: number;
  percentage: number;
}

export interface RunSplit {
  km: number;
  timeSec: number;
  avgHR: number | null;
  avgPace: number | null;
  elevation: number;
}

export interface RunSession {
  id: string;
  runningSyncId: string;
  rpe: number | null;
  moodPost: number | null;
  sessionTypeOverride: string | null;
  notes: string | null;
  recoveryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RunningActivity {
  id: string;
  externalId: string;
  source: string;
  date: string;
  type: string;
  distance: number;
  duration: number;
  avgPace: number | null;
  avgHeartRate: number | null;
  elevationGain: number | null;
  trainingLoad: number | null;
  maxHeartRate: number | null;
  avgCadence: number | null;
  calories: number | null;
  activityName: string | null;
  description: string | null;
  splits: RunSplit[] | null;
  sufferScore: number | null;
  runSession: RunSession | null;
  createdAt: string;
  updatedAt: string;
}

export interface RunningActivityDetail extends RunningActivity {
  hrZones: HRZone[] | null;
  zoneTime: ZoneTime[] | null;
}

export interface ActivityStreams {
  heartrate: number[] | null;
  distance: number[] | null;
  altitude: number[] | null;
  latlng: [number, number][] | null;
  time: number[] | null;
  velocity_smooth: number[] | null;
  cadence: number[] | null;
}

export interface CreateRunSessionRequest {
  runningSyncId: string;
  rpe?: number;
  moodPost?: number;
  sessionTypeOverride?: string;
  notes?: string;
}

export interface TodayRunStatus {
  hasRun: boolean;
  run: RunningActivity | null;
}

export interface WeeklyDashboard {
  period: { start: string; end: string };
  running: {
    totalKm: number;
    sessions: number;
    avgPace: number;
    longestRun: number;
    totalDuration: number;
  };
  gym: {
    sessions: number;
    avgRPE: number | null;
    totalSets: number;
  };
  trainingLoad: {
    acwr: number;
    acwrStatus: "green" | "amber" | "red";
    dailyLoads: Array<{
      day: string;
      date: string;
      runningLoad: number;
      gymSessions: number;
      hasActivity: boolean;
    }>;
  };
  recovery: {
    avgReadiness: number | null;
    checkins: number;
  };
  planCompliance: {
    planned: number;
    completed: number;
    percentage: number;
  } | null;
}

// ─── Fitness Types (Fitness* prefix for clarity) ──────────────────────────────

export interface FitnessExercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  primaryMuscles: string[];
  movementPattern: string | null;
  cues: string | null;
  spineNotes: string | null;
}

export interface FitnessExerciseSet {
  id: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  time: number | null;
  distance: number | null;
  rpe: number | null;
  notes: string | null;
}

export interface FitnessSessionExercise {
  id: string;
  order: number;
  exercise: FitnessExercise;
  sets: FitnessExerciseSet[];
}

export interface FitnessSession {
  id: string;
  date: string;
  sessionType: string;
  duration: number | null;
  notes: string | null;
  overallRPE: number | null;
  weekType: string | null;
  completedAt: string | null;
  createdAt: string;
  sessionExercises: FitnessSessionExercise[];
}

export interface FitnessRecoveryCheckIn {
  id: string;
  date: string;
  sleepQuality: number;   // 1-5
  soreness: number;       // 1-5 (1=very sore, 5=fresh)
  energy: number;         // 1-5
  motivation: number;     // 1-5
  hoursSlept: number | null;
  notes: string | null;
  readinessScore: number | null;
  createdAt: string;
}

export interface CreateRecoveryCheckInRequest {
  sleepQuality: number;
  soreness: number;
  energy: number;
  motivation: number;
  hoursSlept?: number;
  notes?: string;
}

export interface FitnessNutritionLog {
  id: string;
  date: string;
  proteinRating: number | null;
  hydrationRating: number | null;
  vegetableRating: number | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateNutritionLogRequest {
  proteinRating?: number;
  hydrationRating?: number;
  vegetableRating?: number;
  notes?: string;
}

export interface FitnessProgressData {
  exerciseId: string;
  exerciseName: string;
  dataPoints: Array<{
    date: string;
    weight: number;
    reps: number | null;
    rpe: number | null;
  }>;
}

export interface FitnessProgressSummary {
  totalSessions: number;
  weeklyRate: number;
  currentStreak: number;
  personalRecords: Array<{
    exerciseName: string;
    weight: number;
    date: string;
  }>;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
}

export interface FitnessRunningLoadContext {
  weeklyLoad: number;
  acwr: number;
  acuteLoad: number;
  chronicLoad: number;
  trend: "increasing" | "decreasing" | "stable";
  loadFactor: "low" | "moderate" | "high";
  recommendation: string;
}

export interface FitnessRunningStats {
  last7Days: {
    totalDistance: number;
    totalDuration: number;
    trainingLoad: number;
    sessions: number;
  };
  last30Days: {
    totalDistance: number;
    totalDuration: number;
    trainingLoad: number;
    sessions: number;
  };
  loadTrend: "increasing" | "decreasing" | "stable";
}

export interface FitnessSessionSuggestion {
  recommendedSession: string;
  rationale: string;
  weekType: WeekType;
  runningLoadLast7Days: number;
  runningContext?: {
    acwr: number;
    trend: "increasing" | "decreasing" | "stable";
    weeklyLoad: number;
    recommendation: string;
  };
  frequency?: {
    thisWeek: number;
    thisMonth: number;
  };
  lastSession: {
    type: string;
    date: string;
    daysAgo: number;
  } | null;
  suggestedExercises: ExerciseSuggestion[];
  wod?: WodInfo;
}

export interface FitnessDailyPlan {
  headline: string;
  shouldTrain: boolean;
  suggestion: FitnessSessionSuggestion | null;
  recoveryScore: number | null;
  nutritionNudge: string | null;
  runningContext: FitnessRunningLoadContext;
  context: string;
}

// Alias for backwards compatibility
export type FitnessQuickLogRequest = QuickLogRequest;

// ─── Training Plan Types ───────────────────────────

export interface TrainingBlock {
  id: string;
  name: string;
  phase: string;
  startDate: string;
  endDate: string;
  targetWeeklyKm: number | null;
  notes: string | null;
  status: string;
  weeks?: TrainingWeekSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingWeekSummary {
  id: string;
  weekNumber: number;
  startDate: string;
  targetKm: number | null;
  actualKm: number | null;
  status: string;
  weekType: string | null;
}

export interface PlannedSession {
  id: string;
  weekId: string;
  dayOfWeek: number;
  sessionType: string;
  targetDistanceKm: number | null;
  targetPaceZone: string | null;
  sessionName: string | null;
  notes: string | null;
  isOptional: boolean;
  isKidWeekOnly: boolean;
  isNonKidOnly: boolean;
  linkedRunId: string | null;
  linkedGymSessionId: string | null;
  status: string;
  linkedRun?: { id: string; date: string; distance: number; type: string; duration?: number } | null;
  linkedGymSession?: { id: string; date: string; sessionType: string; duration?: number } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingWeek extends TrainingWeekSummary {
  blockId: string;
  keyFocus: string | null;
  notes: string | null;
  block?: { name: string; phase: string };
  sessions?: PlannedSession[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingWeekWithProgress extends TrainingWeek {
  weekProgress: {
    planned: number;
    completed: number;
    skipped?: number;
    targetKm: number | null;
    actualKm: number | null;
  };
}

export interface TodayTrainingPlan {
  hasActivePlan: boolean;
  message?: string;
  block?: { name: string; phase: string };
  week?: {
    id: string;
    weekNumber: number;
    weekType: string | null;
    keyFocus: string | null;
    targetKm: number | null;
    actualKm: number | null;
  };
  todaysSessions?: {
    id: string;
    sessionType: string;
    sessionName: string | null;
    targetDistanceKm: number | null;
    targetPaceZone: string | null;
    notes: string | null;
    isOptional: boolean;
    status: string;
  }[];
  weekProgress?: {
    planned: number;
    completed: number;
    targetKm: number | null;
    actualKm: number | null;
  };
}

// ─── Coach Types ─────────────────────────────────

export interface CoachPrescription {
  sessionType: string;
  targetDistanceKm: number | null;
  targetHRZone: string | null;
  targetPace: string | null;
  warmup: string | null;
  mainSet: string | null;
  cooldown: string | null;
  notes: string | null;
}

export interface CoachTodaySnapshot {
  date: string;
  hasRun: boolean;
  run: RunningActivity | null;
  recovery: {
    sleepQuality: number;
    energy: number;
    soreness: number;
    motivation: number;
    readinessScore: number | null;
    notes: string | null;
  } | null;
  prescription: CoachPrescription | null;
  plannedSession: {
    sessionType: string;
    targetDistanceKm: number | null;
    sessionName: string | null;
    targetPaceZone: string | null;
    notes: string | null;
    status: string;
  } | null;
}

// ─── Generic API Response ─────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}
