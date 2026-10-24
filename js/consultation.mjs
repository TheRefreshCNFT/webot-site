import { consumeConsultationHandoff } from "./consultation-handoff.mjs";

const API = "https://book.webot.agency";
const elements = Object.fromEntries(["bookingForm", "consultationForm", "bookName", "bookEmail", "bookSummary", "quoteRequested", "quoteGuidance", "slotPicker", "bookBtn", "formError", "successScreen", "successTime", "meetLink"].map((id) => [id, document.getElementById(id)]));
let allSlots = {};
let dateKeys = [];
let currentDateIndex = 0;
let selectedSlot = null;
let loading = false;

const handoff = consumeConsultationHandoff(window.sessionStorage);
if (handoff) {
  elements.bookSummary.value = handoff.summary;
  elements.quoteRequested.checked = handoff.requestQuote;
  elements.quoteGuidance.hidden = !handoff.requestQuote;
}

function updateSubmit() {
  elements.bookBtn.disabled = loading || !selectedSlot || !elements.bookName.value.trim() || !elements.bookEmail.validity.valid || !elements.bookSummary.value.trim();
}
function showError(message) {
  elements.formError.textContent = message;
  elements.formError.hidden = !message;
}
function button(label, className = "") {
  const node = document.createElement("button");
  node.type = "button";
  node.className = className;
  node.textContent = label;
  return node;
}
function renderDate() {
  const key = dateKeys[currentDateIndex];
  elements.slotPicker.replaceChildren();
  const nav = document.createElement("div");
  nav.className = "date-nav";
  const previous = button("Previous day", "button button-secondary button-small");
  previous.textContent = "‹";
  previous.setAttribute("aria-label", "Previous available day");
  previous.disabled = currentDateIndex === 0;
  previous.addEventListener("click", () => { currentDateIndex -= 1; renderDate(); });
  const label = document.createElement("div");
  label.className = "date-label";
  label.textContent = key;
  const next = button("Next day", "button button-secondary button-small");
  next.textContent = "›";
  next.setAttribute("aria-label", "Next available day");
  next.disabled = currentDateIndex === dateKeys.length - 1;
  next.addEventListener("click", () => { currentDateIndex += 1; renderDate(); });
  nav.append(previous, label, next);
  const grid = document.createElement("div");
  grid.className = "slots-grid";
  for (const slot of allSlots[key]) {
    const choice = button(slot.label, `slot-btn${selectedSlot === slot.time ? " selected" : ""}`);
    choice.dataset.time = slot.time;
    choice.setAttribute("aria-pressed", String(selectedSlot === slot.time));
    choice.addEventListener("click", () => { selectedSlot = slot.time; showError(""); renderDate(); updateSubmit(); });
    grid.append(choice);
  }
  elements.slotPicker.append(nav, grid);
}
async function loadSlots() {
  elements.slotPicker.innerHTML = '<p class="loading">Loading available times…</p>';
  try {
    const response = await fetch(`${API}/api/slots`);
    const data = await response.json();
    if (!response.ok || !data.success || typeof data.slots !== "object") throw new Error("Slots unavailable");
    allSlots = data.slots;
    dateKeys = Object.keys(allSlots);
    selectedSlot = null;
    if (!dateKeys.length) {
      const message = document.createElement("p");
      message.textContent = "No available times in the next 14 days. Please email hello@webot.agency or call +1 754 210 1827.";
      elements.slotPicker.replaceChildren(message);
    } else {
      currentDateIndex = 0;
      renderDate();
    }
  } catch {
    const message = document.createElement("p");
    message.textContent = "Could not load available times. Please email hello@webot.agency, call +1 754 210 1827, or try again later.";
    elements.slotPicker.replaceChildren(message);
  }
  updateSubmit();
}

elements.quoteRequested.addEventListener("change", () => { elements.quoteGuidance.hidden = !elements.quoteRequested.checked; });
for (const input of [elements.bookName, elements.bookEmail, elements.bookSummary]) input.addEventListener("input", updateSubmit);
elements.consultationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (elements.bookBtn.disabled) return;
  loading = true;
  elements.bookBtn.textContent = "Booking…";
  updateSubmit();
  showError("");
  const summary = `${elements.bookSummary.value.trim()}${elements.quoteRequested.checked ? "\n\nProject quote requested: Yes" : ""}`;
  try {
    const response = await fetch(`${API}/api/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: elements.bookName.value.trim(), email: elements.bookEmail.value.trim(), summary, slotTime: selectedSlot })
    });
    const data = await response.json();
    if (!response.ok || !data.success || !data.event?.time) throw new Error(data.error || "Booking failed. Please try again or contact us directly.");
    elements.bookingForm.hidden = true;
    elements.successScreen.hidden = false;
    elements.successTime.textContent = data.event.time;
    if (data.event.meetLink) {
      const link = document.createElement("a");
      link.className = "button button-secondary";
      link.href = data.event.meetLink;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Join via Google Meet";
      elements.meetLink.replaceChildren(link);
    }
    elements.successScreen.focus?.();
  } catch (error) {
    showError(error.message || "Booking failed. Please try again or contact us directly.");
    if (error.message.includes("no longer available")) await loadSlots();
  } finally {
    loading = false;
    elements.bookBtn.textContent = "Book free 30-minute consultation";
    updateSubmit();
  }
});

loadSlots();
