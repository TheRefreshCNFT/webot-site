import { consumeConsultationHandoff, LANES } from "./consultation-handoff.mjs";

const API = "https://book.webot.agency";
const elements = Object.fromEntries([
  "bookingForm", "consultationForm", "bookName", "bookEmail", "bookSummary",
  "quoteRequested", "quoteGuidance", "slotPicker", "bookBtn", "formError",
  "successScreen", "successTime", "meetLink",
  "laneSmb", "laneHome", "smbFields", "homeFields", "summaryLabel", "summaryHelp",
  "bookSkill", "bookOs", "bookCpu", "bookRam", "bookStorage", "bookGraphics", "bookFormFactor",
  "quoteRequestedHome", "quoteGuidanceHome"
].map((id) => [id, document.getElementById(id)]));
let allSlots = {};
let dateKeys = [];
let currentDateIndex = 0;
let selectedSlot = null;
let loading = false;
let lane = "smb";

const SMB_SUMMARY_LABEL = "What do you want to automate?";
const SMB_SUMMARY_HELP = "<p>A sentence or two is enough to start. Do not include passwords or confidential records.</p>";
const HOME_SUMMARY_LABEL = "What do you want to set up, and what should it do for you?";
const homeSummaryHelpTemplate = document.getElementById("homeSummaryHelpTemplate");

function setLane(next) {
  if (!LANES.has(next)) return;
  lane = next;
  const isSmb = lane === "smb";
  elements.laneSmb.setAttribute("aria-selected", String(isSmb));
  elements.laneHome.setAttribute("aria-selected", String(!isSmb));
  elements.laneSmb.classList.toggle("selected", isSmb);
  elements.laneHome.classList.toggle("selected", !isSmb);
  elements.smbFields.hidden = !isSmb;
  elements.homeFields.hidden = isSmb;
  elements.summaryLabel.textContent = isSmb ? SMB_SUMMARY_LABEL : HOME_SUMMARY_LABEL;
  if (isSmb) {
    elements.summaryHelp.innerHTML = SMB_SUMMARY_HELP;
  } else if (homeSummaryHelpTemplate) {
    elements.summaryHelp.innerHTML = "";
    elements.summaryHelp.append(homeSummaryHelpTemplate.content.cloneNode(true));
  }
  updateSubmit();
}

const handoff = consumeConsultationHandoff(window.sessionStorage);
if (handoff) {
  elements.bookSummary.value = handoff.summary;
  setLane(handoff.lane || "smb");
  const quoteBox = lane === "home" ? elements.quoteRequestedHome : elements.quoteRequested;
  quoteBox.checked = handoff.requestQuote;
  const guidance = lane === "home" ? elements.quoteGuidanceHome : elements.quoteGuidance;
  guidance.hidden = !handoff.requestQuote;
}

function activeQuoteCheckbox() {
  return lane === "home" ? elements.quoteRequestedHome : elements.quoteRequested;
}
function activeQuoteGuidance() {
  return lane === "home" ? elements.quoteGuidanceHome : elements.quoteGuidance;
}
function hasValue(node) {
  return node && node.value.trim().length > 0;
}
function homeFieldsValid() {
  return (
    hasValue(elements.bookSkill) &&
    hasValue(elements.bookOs) &&
    hasValue(elements.bookCpu) &&
    hasValue(elements.bookRam) &&
    hasValue(elements.bookStorage) &&
    hasValue(elements.bookGraphics) &&
    hasValue(elements.bookFormFactor)
  );
}
function updateSubmit() {
  const base = elements.bookName.value.trim() && elements.bookEmail.validity.valid && elements.bookSummary.value.trim();
  const laneOk = lane === "smb" || homeFieldsValid();
  elements.bookBtn.disabled = loading || !selectedSlot || !base || !laneOk;
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
    const email = document.createElement("a");
    email.href = "mailto:hello@webot.agency";
    email.textContent = "email hello@webot.agency";
    const call = document.createElement("a");
    call.href = "tel:+17542101827";
    call.textContent = "call +1 754 210 1827";
    message.append("Could not load available times. Please ", email, ", ", call, ", or try again later.");
    elements.slotPicker.replaceChildren(message);
  }
  updateSubmit();
}

function buildSummary() {
  let summary = elements.bookSummary.value.trim();
  if (lane === "home") {
    const skillText = elements.bookSkill.options[elements.bookSkill.selectedIndex].text;
    const formText = elements.bookFormFactor.options[elements.bookFormFactor.selectedIndex].text;
    summary += `\n\nSkill level: ${skillText}\nMachine: ${elements.bookOs.value.trim()} / ${elements.bookCpu.value.trim()} / ${elements.bookRam.value.trim()} RAM / ${elements.bookStorage.value.trim()} free / ${elements.bookGraphics.value.trim()} / ${formText}`;
  }
  if (activeQuoteCheckbox().checked) {
    summary += "\n\nProject quote requested: Yes";
  }
  return summary;
}

function handleQuoteChange() {
  activeQuoteGuidance().hidden = !activeQuoteCheckbox().checked;
  updateSubmit();
}

elements.laneSmb.addEventListener("click", () => { showError(""); setLane("smb"); });
elements.laneHome.addEventListener("click", () => { showError(""); setLane("home"); });
elements.quoteRequested.addEventListener("change", handleQuoteChange);
elements.quoteRequestedHome.addEventListener("change", handleQuoteChange);
for (const input of [elements.bookName, elements.bookEmail, elements.bookSummary, elements.bookOs, elements.bookCpu, elements.bookRam, elements.bookStorage, elements.bookGraphics]) {
  input.addEventListener("input", updateSubmit);
}
for (const select of [elements.bookSkill, elements.bookFormFactor]) {
  select.addEventListener("change", updateSubmit);
}
elements.consultationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (elements.bookBtn.disabled) return;
  if (lane === "home" && !homeFieldsValid()) {
    showError("Please complete all fields, including the hardware details.");
    return;
  }
  loading = true;
  elements.bookBtn.textContent = "Booking…";
  updateSubmit();
  showError("");
  const summary = buildSummary();
  try {
    const response = await fetch(`${API}/api/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: elements.bookName.value.trim(), email: elements.bookEmail.value.trim(), summary, slotTime: selectedSlot, lane })
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
    elements.successScreen.focus();
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
