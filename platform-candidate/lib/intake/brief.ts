import { findServiceOption } from "../jobs/catalog";
import { SafeRejectError } from "../rejects";

const FallbackReply = "Here is what we will do — does this capture it?";

/**
 * Structured intent brief produced by the studio concierge (design §2):
 * outcome, constraints, tone/style, format, success criteria, and the
 * catalog family/option the work maps to.
 */
export type IntentBrief = {
  service_family: string;
  service_type: string;
  outcome: string;
  constraints: string[];
  tone_style: string | null;
  format: string | null;
  success_criteria: string[];
};

const MAX_OUTCOME_LENGTH = 2000;
const MAX_LIST_ENTRIES = 20;
const MAX_LIST_ENTRY_LENGTH = 500;
const MAX_TONE_LENGTH = 500;
const MAX_FORMAT_LENGTH = 300;

/**
 * Detect and remove any embedded intent-brief JSON object that the concierge
 * model sometimes pastes inside its conversational `reply` text.
 */
export function stripEmbeddedBriefJson(reply: string): string {
  let result = reply;
  let iteration = 0;

  while (iteration < 3) {
    iteration++;
    let found = false;

    for (let i = 0; i < result.length; i++) {
      if (result[i] !== "{") {
        continue;
      }

      let depth = 0;
      let inString = false;
      let escape = false;

      for (let j = i; j < result.length; j++) {
        const ch = result[j];

        if (inString) {
          if (escape) {
            escape = false;
          } else if (ch === "\\") {
            escape = true;
          } else if (ch === '"') {
            inString = false;
          }
          continue;
        }

        if (ch === '"') {
          inString = true;
          continue;
        }

        if (ch === "{") {
          depth++;
        } else if (ch === "}") {
          depth--;
          if (depth === 0) {
            const candidate = result.slice(i, j + 1);

            let parsed: unknown;

            try {
              parsed = JSON.parse(candidate);
            } catch {
              continue;
            }

            if (
              parsed &&
              typeof parsed === "object" &&
              !Array.isArray(parsed) &&
              (Object.hasOwn(parsed, "outcome") || Object.hasOwn(parsed, "service_family"))
            ) {
              const before = result.slice(0, i);
              const afterStart = j + 1;
              const afterTrimmed = result.slice(afterStart).replace(/^[\n\r\s]+/, "");
              result = before + afterTrimmed;
              found = true;
              break;
            }
          }
        }
      }

      if (found) {
        break;
      }
    }

    if (!found) {
      break;
    }
  }

  // Collapse 3+ consecutive newlines to 2
  result = result.replace(/\n{3,}/g, "\n\n");

  // Trim leading/trailing whitespace
  result = result.trim();

  if (result.length === 0) {
    return FallbackReply;
  }

  return result;
}

export function normalizeIntentBrief(value: unknown): IntentBrief {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SafeRejectError("validation_failed");
  }

  const candidate = value as Record<string, unknown>;
  const serviceFamily = requireText(candidate.service_family, 80);
  const serviceType = requireText(candidate.service_type, 120);

  if (!findServiceOption(serviceFamily, serviceType)) {
    throw new SafeRejectError("service_not_in_catalog");
  }

  return {
    service_family: serviceFamily,
    service_type: serviceType,
    outcome: requireText(candidate.outcome, MAX_OUTCOME_LENGTH),
    constraints: normalizeList(candidate.constraints),
    tone_style: optionalText(candidate.tone_style, MAX_TONE_LENGTH),
    format: optionalText(candidate.format, MAX_FORMAT_LENGTH),
    success_criteria: normalizeList(candidate.success_criteria)
  };
}

export function cloneIntentBrief(brief: IntentBrief): IntentBrief {
  return {
    ...brief,
    constraints: [...brief.constraints],
    success_criteria: [...brief.success_criteria]
  };
}

export function synthesizeInstructionsFromBrief(brief: IntentBrief): string {
  const lines: string[] = [`Outcome: ${brief.outcome}`];

  if (brief.format) {
    lines.push(`Format: ${brief.format}`);
  }

  if (brief.tone_style) {
    lines.push(`Tone and style: ${brief.tone_style}`);
  }

  if (brief.constraints.length > 0) {
    lines.push("Constraints:");
    lines.push(...brief.constraints.map((entry) => `- ${entry}`));
  }

  if (brief.success_criteria.length > 0) {
    lines.push("Success criteria:");
    lines.push(...brief.success_criteria.map((entry) => `- ${entry}`));
  }

  lines.push("This request was scoped in a studio intake conversation; the full transcript travels with the job.");

  return lines.join("\n").slice(0, 8000);
}

export function briefTitle(brief: IntentBrief): string {
  const firstSentence = brief.outcome.split(/(?<=[.!?])\s+/)[0] ?? brief.outcome;
  const title = firstSentence.trim().replace(/[.!?]+$/, "");

  return (title.length > 0 ? title : brief.outcome).slice(0, 120);
}

function requireText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    throw new SafeRejectError("validation_failed");
  }

  const normalized = value.trim();

  if (normalized.length < 1 || normalized.length > maxLength) {
    throw new SafeRejectError("validation_failed");
  }

  return normalized;
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return requireText(value, maxLength);
}

function normalizeList(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value) || value.length > MAX_LIST_ENTRIES) {
    throw new SafeRejectError("validation_failed");
  }

  return value.map((entry) => requireText(entry, MAX_LIST_ENTRY_LENGTH));
}
