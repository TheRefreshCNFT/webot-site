export const HANDOFF_KEY = "webot.consultationHandoff.v1";
export const LANES = new Set(["smb", "home"]);

export function consumeConsultationHandoff(storage) {
  let raw = null;
  try {
    raw = storage.getItem(HANDOFF_KEY);
  } catch {}
  try {
    storage.removeItem(HANDOFF_KEY);
  } catch {
    return null;
  }
  if (!raw || raw.length > 5000) return null;
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || typeof value.summary !== "string" || typeof value.requestQuote !== "boolean") return null;
    const summary = value.summary.trim();
    if (!summary || summary.length > 4000) return null;
    const result = { summary, requestQuote: value.requestQuote };
    if (value.lane !== undefined) {
      if (typeof value.lane !== "string" || !LANES.has(value.lane)) return null;
      result.lane = value.lane;
    }
    return result;
  } catch {
    return null;
  }
}
