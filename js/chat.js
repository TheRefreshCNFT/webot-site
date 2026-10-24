(() => {
  const mount = document.getElementById("chat-mount");
  if (!mount) return;
  const endpoint = mount.dataset.chatEndpoint;
  const HANDOFF_KEY = "webot.consultationHandoff.v1";
  const messages = [];
  const sessionId = `webot_${crypto.randomUUID()}`;
  let pendingHandoff = null;
  let busy = false;

  const root = document.createElement("div");
  root.className = "chat";
  const launch = document.createElement("button");
  launch.type = "button";
  launch.className = "button button-secondary chat-launch";
  launch.textContent = "Ask WeBot about your workflow";
  const panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.hidden = true;
  panel.innerHTML = '<div class="chat-header"><div><h3>Ask WeBot</h3><p>Automated capability and fit assistant. No pricing. Avoid confidential or payment details.</p></div><button type="button" class="chat-close" aria-label="Close Ask WeBot">Close</button></div><div class="chat-log" role="log" aria-live="polite" aria-relevant="additions"></div><form class="chat-form"><label for="chat-question">Your question</label><textarea id="chat-question" maxlength="2000" required></textarea><div class="chat-actions"><button class="button button-primary chat-send" type="submit">Send question</button><button class="button button-secondary chat-book" type="button">Book directly</button></div><p class="chat-status" role="status"></p></form><form class="handoff-form" hidden><label for="handoff-summary">Review your use-case summary</label><textarea id="handoff-summary" maxlength="1000" required></textarea><label class="handoff-check"><input type="checkbox" class="handoff-quote"> I’d also like a project quote</label><button class="button button-primary" type="submit">Approve and continue to booking</button></form>';
  root.append(launch, panel);
  mount.replaceChildren(root);

  const log = panel.querySelector(".chat-log");
  const form = panel.querySelector(".chat-form");
  const question = panel.querySelector("#chat-question");
  const send = panel.querySelector(".chat-send");
  const status = panel.querySelector(".chat-status");
  const handoffForm = panel.querySelector(".handoff-form");
  const handoffSummary = panel.querySelector("#handoff-summary");
  const handoffQuote = panel.querySelector(".handoff-quote");

  function setOpen(open) {
    panel.hidden = !open;
    launch.hidden = open;
    if (open) question.focus(); else launch.focus();
  }
  function addMessage(role, content) {
    const node = document.createElement("p");
    node.className = "chat-message";
    node.dataset.role = role;
    node.textContent = content;
    log.append(node);
    log.scrollTop = log.scrollHeight;
  }
  function setBusy(value) {
    busy = value;
    send.disabled = value;
    send.dataset.state = value ? "loading" : "default";
    send.textContent = value ? "Waiting for Ask WeBot…" : "Send question";
  }
  function setStatus(text, state = "default") {
    status.textContent = text;
    status.dataset.state = state;
  }
  function showHandoff(proposal) {
    pendingHandoff = proposal || { summary: question.value.trim(), requestQuote: false };
    if (!pendingHandoff.summary) {
      setStatus("Describe your workflow in the question field first.", "error");
      return;
    }
    handoffSummary.value = pendingHandoff.summary;
    handoffQuote.checked = pendingHandoff.requestQuote;
    handoffForm.hidden = false;
    handoffSummary.focus();
  }

  launch.addEventListener("click", () => {
    setOpen(true);
    if (!log.children.length) addMessage("assistant", "Hi—I’m WeBot’s automated assistant. Describe a digital workflow or ask whether we can handle a tool, file type, audio task, or handoff.");
  });
  panel.querySelector(".chat-close").addEventListener("click", () => setOpen(false));
  panel.querySelector(".chat-book").addEventListener("click", () => showHandoff(null));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const content = question.value.trim();
    if (!content || busy) return;
    messages.push({ role: "user", content });
    addMessage("user", content);
    question.value = "";
    setBusy(true);
    setStatus("Sending your question…");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: messages.slice(-12), sessionId }),
        signal: controller.signal
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== "string" || !["common_fit", "technical_review", "not_a_fit", "unknown"].includes(data.fit)) throw new Error("Chat unavailable");
      messages.push({ role: "assistant", content: data.reply });
      addMessage("assistant", data.reply);
      setStatus(data.fit === "unknown" ? "We could not confirm this one. Human review is available." : "Answer received.", data.fit === "unknown" ? "error" : "success");
      if (data.handoff && typeof data.handoff.summary === "string") showHandoff(data.handoff);
    } catch {
      setStatus("Ask WeBot is unavailable. You can still book directly, email hello@webot.agency, or call +1 754 210 1827.", "error");
      const alternatives = document.createElement("p");
      alternatives.className = "chat-message";
      alternatives.textContent = "Chat is unavailable right now. Booking, phone, and email are still available.";
      log.append(alternatives);
    } finally {
      clearTimeout(timer);
      setBusy(false);
      question.focus();
    }
  });

  handoffForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const summary = handoffSummary.value.trim();
    if (!summary) { setStatus("Add a use-case summary before continuing.", "error"); return; }
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify({ version: 1, summary, requestQuote: handoffQuote.checked }));
    window.location.assign("/consultation.html");
  });
})();
