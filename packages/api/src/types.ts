// ─── Task Types ───────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskTag {
  tag: { id: string; name: string; color?: string | null };
}

export interface TaskProject {
  id: string;
  title: string;
  color?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  completedAt?: string | null;
  project?: TaskProject | null;
  tags: TaskTag[];
  createdAt: string;
  updatedAt: string;
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
  tags?: string[];
  description?: string;
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
export type MatterType =
  | "contract"
  | "dispute"
  | "compliance"
  | "advisory"
  | "employment"
  | "ip"
  | "regulatory";
export type Jurisdiction = "NSW" | "VIC" | "Commonwealth" | "International";
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

// ─── Fitness Types ───────────────────────────────

export type FitnessWeekType = "kid" | "non-kid";
export type FitnessLoadFactor = "low" | "moderate" | "high";

export interface FitnessExercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
  primaryMuscles: string[];
  movementPattern: string | null;
  cues: string | null;
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
  exerciseId: string;
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
  sessionExercises?: FitnessSessionExercise[];
  createdAt: string;
}

export interface FitnessExerciseSuggestion {
  name: string;
  exerciseId: string;
  suggestedWeight: number;
  suggestedSets?: number;
  suggestedReps?: number;
  confidence?: "low" | "medium" | "high";
  lastWeight: number | null;
  rationale: string;
}

export interface FitnessSessionSuggestion {
  recommendedSession: string;
  rationale: string;
  weekType: FitnessWeekType;
  runningLoadLast7Days: number;
  runningContext?: {
    acwr: number;
    trend: "increasing" | "decreasing" | "stable";
    weeklyLoad: number;
    recommendation: string;
  };
  frequency?: { thisWeek: number; thisMonth: number };
  lastSession: { type: string; date: string; daysAgo: number } | null;
  suggestedExercises: FitnessExerciseSuggestion[];
  wod?: {
    name: string;
    format: string;
    duration: number | null;
    description: string;
  };
}

export interface FitnessRunningLoadContext {
  weeklyLoad: number;
  acwr: number;
  acuteLoad: number;
  chronicLoad: number;
  trend: "increasing" | "decreasing" | "stable";
  loadFactor: FitnessLoadFactor;
  recommendation: string;
}

export interface FitnessRecoveryCheckIn {
  id: string;
  date: string;
  sleepQuality: number;
  soreness: number;
  energy: number;
  motivation: number;
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

export interface FitnessDailyPlan {
  headline: string;
  shouldTrain: boolean;
  suggestion: FitnessSessionSuggestion | null;
  recoveryScore: number | null;
  nutritionNudge: string | null;
  runningContext: FitnessRunningLoadContext;
  context: string;
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

export interface FitnessQuickLogRequest {
  sessionType: string;
  weekType?: FitnessWeekType;
  notes?: string;
  overallRPE?: number;
  exercises: Array<{
    name: string;
    weight?: number;
    sets: number;
    reps?: number;
    time?: number;
    distance?: number;
    rpe?: number;
  }>;
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
