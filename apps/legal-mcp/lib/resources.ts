import {
  PROMPT_COACH_SKILL,
  REF_TEMPLATES,
  REF_CHEAT_SHEET,
  REF_ANTI_PATTERNS,
  REF_VALIDATION,
  REF_CHAINING,
  REF_ITERATION,
  REF_PUBLICIS,
} from "./content/prompt-coach";

import {
  SKILL_CONTRACT_REVIEW,
  SKILL_NDA_TRIAGE,
  SKILL_RISK_ASSESSMENT,
  SKILL_COMPLIANCE,
  SKILL_CANNED_RESPONSES,
  SKILL_MEETING_BRIEFING,
} from "./content/legal";

import {
  TOMOS_ARCHITECTURE,
  TOMOS_WEB_APPS,
  TOMOS_TRAINING,
  TOMOS_LIFE,
  TOMOS_CONVENTIONS,
} from "./content/tomos";

export interface McpResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  content: string;
}

export const RESOURCES: McpResource[] = [
  // ─── Legal Prompt Coach: Skills ───────────────────────────────────────────
  {
    uri: "legal://skill/prompt-coach",
    name: "Legal Prompt Coach — Skill Guide",
    description:
      "Complete 6-part prompt architecture framework, complexity scaling guide, platform-specific optimisation for Claude/Copilot/ChatGPT, and coaching workflow with scoring rubric.",
    mimeType: "text/markdown",
    content: PROMPT_COACH_SKILL,
  },

  // ─── Legal Prompt Coach: References ───────────────────────────────────────
  {
    uri: "legal://references/templates",
    name: "Legal Prompt Templates",
    description:
      "15 battle-tested prompt templates for common legal tasks: contract review, risk matrix, gap analysis, stakeholder emails, summary, clause drafting, compliance, due diligence, research memo, board paper, incident response, policy, and negotiation preparation.",
    mimeType: "text/markdown",
    content: REF_TEMPLATES,
  },
  {
    uri: "legal://references/cheat-sheet",
    name: "Legal Prompt Cheat Sheet",
    description:
      "Quick reference guide: 6-part structure one-liners, power verbs for legal tasks, risk classification patterns, output format quick picks, audience calibration phrases, platform comparison, and scoring rubric.",
    mimeType: "text/markdown",
    content: REF_CHEAT_SHEET,
  },
  {
    uri: "legal://references/anti-patterns",
    name: "Legal Prompt Anti-Patterns",
    description:
      "Top 10 common mistakes in legal prompts and how to fix them: Kitchen Sink, Phantom Audience, Generic Lawyer, Comprehensiveness Trap, Missing Framework, Silent Attachment, Ambiguity Pass-Through, False Precision, One-Shot Complex Task, Unanchored Comparison.",
    mimeType: "text/markdown",
    content: REF_ANTI_PATTERNS,
  },
  {
    uri: "legal://references/validation-checklist",
    name: "AI Legal Output Validation Checklist",
    description:
      "15-point checklist for validating AI-generated legal output before relying on or sharing it.",
    mimeType: "text/markdown",
    content: REF_VALIDATION,
  },
  {
    uri: "legal://references/chaining-guide",
    name: "Prompt Chaining Guide",
    description:
      "When and how to decompose complex legal tasks into prompt chains. Includes worked examples for due diligence workstreams and large contract reviews.",
    mimeType: "text/markdown",
    content: REF_CHAINING,
  },
  {
    uri: "legal://references/iteration-guide",
    name: "Prompt Iteration Guide",
    description:
      "How to troubleshoot and iteratively refine legal prompts when output is not right. Covers diagnosis, targeted improvements, and escalation patterns.",
    mimeType: "text/markdown",
    content: REF_ITERATION,
  },
  {
    uri: "legal://references/publicis-conventions",
    name: "Publicis Groupe — Legal Conventions",
    description:
      "Publicis Groupe standard contract positions, terminology, watch-outs, agreement type quick reference, and tone/style conventions for Publicis legal work.",
    mimeType: "text/markdown",
    content: REF_PUBLICIS,
  },

  // ─── Legal Plugin: Skills ─────────────────────────────────────────────────
  {
    uri: "legal://skill/contract-review",
    name: "Contract Review Skill",
    description:
      "Playbook-based contract review methodology: clause-by-clause analysis, GREEN/YELLOW/RED deviation classification, redline generation, and business impact summaries.",
    mimeType: "text/markdown",
    content: SKILL_CONTRACT_REVIEW,
  },
  {
    uri: "legal://skill/nda-triage",
    name: "NDA Triage Skill",
    description:
      "NDA pre-screening methodology: mutual vs unilateral check, term review, carveout verification, prohibited provisions, and GREEN/YELLOW/RED routing classification.",
    mimeType: "text/markdown",
    content: SKILL_NDA_TRIAGE,
  },
  {
    uri: "legal://skill/legal-risk-assessment",
    name: "Legal Risk Assessment Skill",
    description:
      "Risk assessment methodology using severity × likelihood matrix, heat map grouping (Critical/Moderate/Low), and prioritised mitigation recommendations.",
    mimeType: "text/markdown",
    content: SKILL_RISK_ASSESSMENT,
  },
  {
    uri: "legal://skill/compliance",
    name: "Compliance Review Skill",
    description:
      "Compliance assessment methodology: identifying applicable regulations, clause-by-clause requirements mapping, gap identification, and remediation planning.",
    mimeType: "text/markdown",
    content: SKILL_COMPLIANCE,
  },
  {
    uri: "legal://skill/canned-responses",
    name: "Canned Responses Skill",
    description:
      "Template management for common legal inquiries: DSRs, discovery holds, vendor questions, NDA requests, privacy inquiries, subpoenas, and insurance notifications. Includes escalation trigger framework.",
    mimeType: "text/markdown",
    content: SKILL_CANNED_RESPONSES,
  },
  {
    uri: "legal://skill/meeting-briefing",
    name: "Meeting Briefing Skill",
    description:
      "Meeting preparation methodology: gathering context from connected sources, structuring briefings by meeting type (deal review, board, vendor, regulatory), and action item tracking.",
    mimeType: "text/markdown",
    content: SKILL_MEETING_BRIEFING,
  },

  // ─── TomOS Architecture Resources ──────────────────────────────────────────

  {
    uri: "tomos://architecture",
    name: "TomOS System Architecture",
    description:
      "Full system overview — backend stack, database tables, frontend PWAs, API patterns, timezone conventions.",
    mimeType: "text/markdown",
    content: TOMOS_ARCHITECTURE,
  },
  {
    uri: "tomos://web-apps",
    name: "TomOS Web Apps (Monorepo)",
    description:
      "PWA monorepo structure — 8 apps, shared packages, data fetching patterns, styling conventions, deployment process.",
    mimeType: "text/markdown",
    content: TOMOS_WEB_APPS,
  },
  {
    uri: "tomos://training",
    name: "TomOS Training Module",
    description:
      "Training coach API, race operations endpoints, 2026 race season data, training phases, parenting schedule.",
    mimeType: "text/markdown",
    content: TOMOS_TRAINING,
  },
  {
    uri: "tomos://life",
    name: "TomOS Life Module",
    description:
      "Life module API — goals, habits (with streaks), shopping (NLP parse), weekly plans, aggregated today dashboard.",
    mimeType: "text/markdown",
    content: TOMOS_LIFE,
  },
  {
    uri: "tomos://conventions",
    name: "TomOS Development Conventions",
    description:
      "Coding patterns — API response envelopes, Sydney timezone handling, Prisma singleton, Zod validation, fire-and-forget background ops, cron auth, push notifications.",
    mimeType: "text/markdown",
    content: TOMOS_CONVENTIONS,
  },
];
