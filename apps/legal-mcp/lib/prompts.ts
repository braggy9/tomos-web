import {
  PROMPT_COACH_SKILL,
  CMD_PROMPT_COACH,
  CMD_LEGAL_TEMPLATE,
  CMD_PROMPT_ADAPT,
  REF_TEMPLATES,
  REF_CHEAT_SHEET,
  REF_ANTI_PATTERNS,
  REF_PUBLICIS,
} from "./content/prompt-coach";

import {
  SKILL_CONTRACT_REVIEW,
  SKILL_NDA_TRIAGE,
  SKILL_RISK_ASSESSMENT,
  SKILL_COMPLIANCE,
  SKILL_CANNED_RESPONSES,
  SKILL_MEETING_BRIEFING,
  CMD_REVIEW_CONTRACT,
  CMD_TRIAGE_NDA,
  CMD_VENDOR_CHECK,
  CMD_BRIEF,
  CMD_RESPOND,
  CMD_SIGNATURE_REQUEST,
  CMD_COMPLIANCE_CHECK,
} from "./content/legal";

import {
  LIFE_WEEKLY_PLAN,
  LIFE_DAILY_BRIEFING,
  LIFE_WEEKLY_REVIEW,
  LIFE_SHOPPING,
  LIFE_HABITS,
} from "./content/life";

export interface McpPromptArg {
  name: string;
  description: string;
  required?: boolean;
}

export interface McpPrompt {
  name: string;
  description: string;
  arguments?: McpPromptArg[];
  getMessages: (args: Record<string, string>) => Array<{
    role: "user" | "assistant";
    content: { type: "text"; text: string };
  }>;
}

export const PROMPTS: McpPrompt[] = [
  {
    name: "coach-prompt",
    description:
      "Optimise a rough prompt or task description for legal AI work. Returns a scorecard, enhanced prompt, and explanation of improvements.",
    arguments: [
      {
        name: "draft_prompt",
        description: "Your rough prompt or task description to optimise",
        required: true,
      },
      {
        name: "platform",
        description:
          "Target AI platform: claude (default), copilot, or chatgpt",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are an expert legal prompt coach. Use the following skill guide and instructions to coach and optimise the user's prompt.

## Skill Guide
${PROMPT_COACH_SKILL}

## Reference: Common Anti-Patterns
${REF_ANTI_PATTERNS}

## Reference: Publicis Conventions
${REF_PUBLICIS}

## Instructions
${CMD_PROMPT_COACH}

---

## User's Draft Prompt

${args.draft_prompt || "[No draft provided — ask the user to provide a rough prompt or task description]"}

${args.platform && args.platform !== "claude" ? `\n**Target platform:** ${args.platform}` : ""}

Follow the coaching workflow above. Provide a scorecard, the optimised prompt, and explain what was changed and why.`,
        },
      },
    ],
  },

  {
    name: "enhance-prompt",
    description:
      "Enhance a rough prompt into a polished, production-ready version. No coaching, no scoring — just returns the improved prompt ready to use.",
    arguments: [
      {
        name: "draft_prompt",
        description: "Your rough prompt or task description to enhance",
        required: true,
      },
      {
        name: "context",
        description:
          "Optional context: what the prompt is for, who will use it, target AI platform",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are an expert prompt engineer. Your job is to take a rough prompt and return ONLY the enhanced version — no commentary, no scoring, no explanation of changes. Just the better prompt, ready to copy and use.

## Enhancement Principles
- Add clear structure (role, context, constraints, output format)
- Make instructions specific and unambiguous
- Add edge case handling where obvious
- Use professional tone appropriate to the domain
- Keep the original intent — don't add scope the user didn't ask for
- If it's a legal prompt, apply Publicis Groupe conventions:
${REF_PUBLICIS}

## Anti-Patterns to Fix
${REF_ANTI_PATTERNS}

---

## Rough Prompt to Enhance

${args.draft_prompt || "[No draft provided — ask the user to provide a rough prompt]"}

${args.context ? `\n**Context:** ${args.context}` : ""}

---

Return ONLY the enhanced prompt. No preamble, no explanation, no "here's the improved version". Just the prompt itself, ready to paste and use.`,
        },
      },
    ],
  },

  {
    name: "legal-template",
    description:
      "Get a battle-tested legal prompt template. Specify a task type (e.g. contract-review, risk-matrix, gap-analysis) or leave blank to see all available templates.",
    arguments: [
      {
        name: "task_type",
        description:
          "Type of legal task: contract-review, risk-matrix, gap-analysis, stakeholder-email, summary, clause-drafting, compliance, due-diligence, research-memo, board-paper, incident-response, policy, negotiation",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a legal prompt template librarian. Use the template library and instructions below to provide the right template.

## Template Library
${REF_TEMPLATES}

## Instructions
${CMD_LEGAL_TEMPLATE}

## Quick Reference
${REF_CHEAT_SHEET}

---

The user wants a legal prompt template${args.task_type ? ` for: **${args.task_type}**` : "."}.

Follow the instructions above to present the appropriate template(s).`,
        },
      },
    ],
  },

  {
    name: "adapt-prompt",
    description:
      "Adapt a Claude-optimised legal prompt for Microsoft Copilot or ChatGPT. Provide the target platform and optionally the prompt to adapt.",
    arguments: [
      {
        name: "platform",
        description: "Target platform: copilot or chatgpt",
        required: true,
      },
      {
        name: "prompt",
        description: "The Claude-optimised prompt to adapt (optional — can use the most recent prompt in context)",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a legal prompt adaptation specialist. Use the skill guide and instructions below to adapt the prompt for the target platform.

## Skill Guide (Platform Adaptation Section)
${PROMPT_COACH_SKILL}

## Quick Reference
${REF_CHEAT_SHEET}

## Instructions
${CMD_PROMPT_ADAPT}

---

**Target platform:** ${args.platform || "[not specified — ask the user: copilot or chatgpt?]"}

${args.prompt ? `**Prompt to adapt:**\n\n${args.prompt}` : "No prompt was provided. Ask the user to share the prompt they want to adapt, or use the most recently generated prompt in the conversation."}

Follow the instructions to adapt the prompt for ${args.platform || "the specified platform"}.`,
        },
      },
    ],
  },

  {
    name: "review-contract",
    description:
      "Review a contract against your organisation's negotiation playbook. Flags deviations (GREEN/YELLOW/RED), generates redline suggestions, and provides business impact analysis. Paste or attach the contract.",
    arguments: [
      {
        name: "context",
        description: "Optional context: which side you are on, deal size, focus areas, deadline",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a contract review assistant for an in-house legal team. Use the skill and workflow below.

## Contract Review Skill
${SKILL_CONTRACT_REVIEW}

## Workflow Instructions
${CMD_REVIEW_CONTRACT}

---

${args.context ? `**Context provided:** ${args.context}\n\n` : ""}Please provide the contract for review (paste the text or attach the document), and share any context about which side you are on, the deal, and any focus areas.`,
        },
      },
    ],
  },

  {
    name: "triage-nda",
    description:
      "Rapidly triage an incoming NDA. Classifies as GREEN (standard approval), YELLOW (counsel review needed), or RED (significant issues / full legal review). Paste or attach the NDA.",
    getMessages: () => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are an NDA triage assistant for an in-house legal team. Use the skill and workflow below.

## NDA Triage Skill
${SKILL_NDA_TRIAGE}

## Workflow Instructions
${CMD_TRIAGE_NDA}

---

Please provide the NDA for triage (paste the text or attach the document). I will screen it against standard criteria and classify it as GREEN, YELLOW, or RED.`,
        },
      },
    ],
  },

  {
    name: "vendor-check",
    description:
      "Check the status of existing agreements with a vendor. Provides a consolidated view of what agreements exist, what may be missing, and upcoming actions.",
    arguments: [
      {
        name: "vendor_name",
        description: "Name of the vendor to check",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a vendor agreement status assistant for an in-house legal team. Use the workflow below.

## Workflow Instructions
${CMD_VENDOR_CHECK}

---

${args.vendor_name ? `**Vendor:** ${args.vendor_name}\n\nPlease check the status of all agreements with this vendor.` : "Please tell me which vendor you want to check, and I will compile a status report of all agreements."}`,
        },
      },
    ],
  },

  {
    name: "legal-brief",
    description:
      "Generate a contextual legal briefing. Supports three modes: daily (morning brief of legal-relevant items), topic (research brief on a specific legal question), or incident (rapid brief for developing situations).",
    arguments: [
      {
        name: "mode",
        description: "Brief type: daily, topic, or incident",
        required: false,
      },
      {
        name: "query",
        description: "Topic or incident description (required for topic and incident modes)",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a legal briefing assistant for an in-house legal team. Use the meeting briefing skill and workflow below.

## Meeting Briefing Skill
${SKILL_MEETING_BRIEFING}

## Briefing Workflow Instructions
${CMD_BRIEF}

---

${args.mode ? `**Brief type:** ${args.mode}` : "No brief type specified — ask the user: daily brief, topic brief, or incident brief?"}
${args.query ? `\n**Topic/query:** ${args.query}` : ""}

Follow the workflow above to generate the requested briefing.`,
        },
      },
    ],
  },

  {
    name: "legal-respond",
    description:
      "Generate a response to a common legal inquiry using configured templates. Supports data subject requests, discovery holds, vendor questions, NDA requests, privacy inquiries, subpoenas, and insurance notifications. Includes escalation trigger checks.",
    arguments: [
      {
        name: "inquiry_type",
        description:
          "Type of inquiry: dsr, hold, vendor, nda, privacy, subpoena, insurance, or custom",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a canned responses assistant for an in-house legal team. Use the skill and workflow below.

## Canned Responses Skill
${SKILL_CANNED_RESPONSES}

## Workflow Instructions
${CMD_RESPOND}

---

${args.inquiry_type ? `**Inquiry type:** ${args.inquiry_type}\n\nPlease help generate a response for this type of inquiry.` : "Please tell me what type of legal inquiry you need to respond to, and I will help generate an appropriate response (after checking for escalation triggers)."}`,
        },
      },
    ],
  },

  {
    name: "signature-request",
    description:
      "Prepare a document for electronic signature. Runs a pre-signature checklist, configures signing order, and routes for execution.",
    getMessages: () => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a signature routing assistant for an in-house legal team. Use the workflow below.

## Workflow Instructions
${CMD_SIGNATURE_REQUEST}

---

Please provide the document you want to send for signature (paste text, attach, or describe it), and I will run the pre-signature checklist and help you configure the signing workflow.`,
        },
      },
    ],
  },

  {
    name: "compliance-check",
    description:
      "Run a compliance check on a proposed action, product feature, marketing campaign, or business initiative. Identifies applicable regulations, assesses requirements, and recommends actions.",
    arguments: [
      {
        name: "initiative",
        description:
          "Description of what you want to check (e.g. 'we want to launch a referral program with cash rewards')",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a compliance check assistant for an in-house legal team. Use the skill and workflow below.

## Compliance Skill
${SKILL_COMPLIANCE}

## Workflow Instructions
${CMD_COMPLIANCE_CHECK}

---

${args.initiative ? `**Initiative to check:** ${args.initiative}\n\nPlease run a compliance check on this.` : "Please describe the action, product feature, campaign, or initiative you want to check for compliance, and I will assess it."}`,
        },
      },
    ],
  },

  {
    name: "legal-risk-assessment",
    description:
      "Conduct a legal risk assessment for a matter, transaction, or proposed action. Produces a severity × likelihood risk matrix with mitigations.",
    arguments: [
      {
        name: "subject",
        description: "What to assess (e.g. 'proposed acquisition of XYZ', 'new AI product feature')",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are a legal risk assessment specialist. Use the skill guide and template below.

## Legal Risk Assessment Skill
${SKILL_RISK_ASSESSMENT}

## Risk Matrix Template (from prompt template library)
Use the Risk Matrix / Risk Assessment template from the library:

${REF_TEMPLATES.split("## 2. Risk Matrix")[1]?.split("---")[0] || "See the Risk Matrix template in the template library."}

---

${args.subject ? `**Subject for assessment:** ${args.subject}\n\nPlease conduct a legal risk assessment.` : "Please describe the matter, transaction, or initiative you want assessed for legal risk."}`,
        },
      },
    ],
  },

  // ─── Life Module Prompts ──────────────────────────────────────────────────────

  {
    name: "weekly-plan",
    description:
      "Generate a prioritised weekly personal plan based on goals, habits, tasks, energy, and kid-week status. Calls TomOS tools to gather live data.",
    getMessages: () => [
      {
        role: "user",
        content: {
          type: "text",
          text: LIFE_WEEKLY_PLAN,
        },
      },
    ],
  },
  {
    name: "daily-briefing",
    description:
      "Daily focus briefing — synthesises today's habits, tasks, training, mood, and weekly priorities into a 30-second morning read.",
    getMessages: () => [
      {
        role: "user",
        content: {
          type: "text",
          text: LIFE_DAILY_BRIEFING,
        },
      },
    ],
  },
  {
    name: "weekly-review",
    description:
      "End-of-week personal reflection. Reviews completed priorities, habit consistency, energy arc, and goal progress. Offers to save reflection.",
    getMessages: () => [
      {
        role: "user",
        content: {
          type: "text",
          text: LIFE_WEEKLY_REVIEW,
        },
      },
    ],
  },
  {
    name: "shopping-list",
    description:
      "Manage shopping list conversationally — add items via natural language, view by category, check off, or clear. Uses NLP parsing.",
    arguments: [
      {
        name: "action",
        description: "What to do: add, view, check, clear (default: view)",
        required: false,
      },
      {
        name: "items",
        description: "Items to add (natural language, e.g. '2kg chicken, spinach, oats')",
        required: false,
      },
    ],
    getMessages: (args) => [
      {
        role: "user",
        content: {
          type: "text",
          text: `${LIFE_SHOPPING}

---

${args.action === "add" && args.items ? `**Action:** Add items\n**Items:** ${args.items}` : args.action ? `**Action:** ${args.action}` : "Show me my current shopping list."}`,
        },
      },
    ],
  },
  {
    name: "habit-checkin",
    description:
      "Daily habit check-in — shows today's due habits with streaks, logs completions, and celebrates milestones.",
    getMessages: () => [
      {
        role: "user",
        content: {
          type: "text",
          text: LIFE_HABITS,
        },
      },
    ],
  },
];
