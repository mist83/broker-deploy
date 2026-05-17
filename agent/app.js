const BUILDER_SELECTOR = "[data-doctrine-builder]";
const composeState = {
  mounted: false,
  observer: null,
};

function isBuilderMounted(root) {
  return root instanceof HTMLElement && root.dataset.builderMounted === "true";
}

function parseJsonObject(raw, label) {
  if (!raw.trim()) {
    return {};
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${label} must be valid JSON.`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object.`);
  }

  return parsed;
}

function doctrineHost(builderData) {
  return String(builderData?.host || "https://agent.mullmania.com").replace(/\/$/, "");
}

function composeEndpoint(builderData, contract) {
  const endpoint = Array.isArray(contract?.endpoints)
    ? contract.endpoints.find((entry) => entry.path === "/api/doctrine/compose")
    : null;
  const path = endpoint?.path || "/api/doctrine/compose";
  return `${doctrineHost(builderData)}${path}`;
}

function formatParams(value) {
  return JSON.stringify(value || {}, null, 2);
}

function selectedCheckboxValues(root, name) {
  return [...root.querySelectorAll(`input[name="${name}"]:checked`)]
    .map((input) => input.value)
    .filter(Boolean);
}

function setStatus(root, state, summary, detail = "") {
  const node = root.querySelector("[data-builder-status]");
  if (!node) {
    return;
  }

  node.dataset.state = state;
  node.innerHTML = `
    <p class="type-label">${escapeHtml(summary || "")}</p>
    ${detail ? `<p class="text-secondary">${escapeHtml(detail)}</p>` : ""}
  `;
}

function setPreview(root, instruction, citations = [], warnings = []) {
  const preview = root.querySelector("[data-builder-preview]");
  const citationsNode = root.querySelector("[data-builder-citations]");
  const warningsNode = root.querySelector("[data-builder-warnings]");

  if (preview) {
    preview.textContent = instruction || "";
  }

  if (citationsNode) {
    citationsNode.innerHTML = citations.length === 0
      ? `<li class="text-secondary">No citations returned.</li>`
      : citations
          .map((item) => `
            <li>
              <a href="${escapeHtml(item.url || "#")}" target="_blank" rel="noreferrer">${escapeHtml(item.id || item.url || "rule")}</a>
            </li>
          `)
          .join("");
  }

  if (warningsNode) {
    warningsNode.innerHTML = warnings.length === 0
      ? `<p class="text-secondary">No warnings.</p>`
      : warnings.map((warning) => `<p class="text-secondary">${escapeHtml(warning)}</p>`).join("");
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildProfileChecklist(builderData, runtimeId, selectedProfileIds) {
  const defaults = new Set(selectedProfileIds);
  const profiles = builderData.profileToc?.profiles || [];
  return profiles
    .filter((profile) => profile.itemIds?.length)
    .map((profile) => `
      <label class="builder-check">
        <input type="checkbox" name="profileIds" value="${escapeHtml(profile.id)}" ${defaults.has(profile.id) ? "checked" : ""}>
        <span>
          <strong>${escapeHtml(profile.label)}</strong><br>
          <span class="text-secondary">${escapeHtml(profile.description || "")}</span>
        </span>
      </label>
    `)
    .join("");
}

function runtimeDefaults(builderData, runtimeId) {
  const defaults = builderData.defaults?.defaultProfileIdsByRuntime || {};
  return Array.isArray(defaults[runtimeId]) ? defaults[runtimeId] : [];
}

function defaultEvent(builderData, runtimeId) {
  return builderData.defaults?.defaultEventByRuntime?.[runtimeId] || "task_execution";
}

function defaultRecipe(builderData) {
  return builderData.defaults?.defaultRecipeId || "";
}

function recipeById(builderData, recipeId) {
  return (builderData.recipeCatalog?.recipes || []).find((recipe) => recipe.id === recipeId) || null;
}

function setRecipeDefaults(root, builderData, runtimeId, recipeId) {
  const recipe = recipeById(builderData, recipeId);
  const runtimeProfileIds = runtimeDefaults(builderData, runtimeId);
  const selectedProfileIds = recipe?.recommendedProfileIds?.length
    ? recipe.recommendedProfileIds
    : runtimeProfileIds;
  const paramsArea = root.querySelector('[name="params"]');
  const profileWrap = root.querySelector("[data-builder-profile-list]");

  if (paramsArea && recipe?.paramsTemplate) {
    paramsArea.value = formatParams(recipe.paramsTemplate);
  }

  if (profileWrap) {
    profileWrap.innerHTML = buildProfileChecklist(builderData, runtimeId, selectedProfileIds);
  }
}

async function loadBuilderInputs() {
  const [builderDataResponse, contractResponse] = await Promise.all([
    fetch("./doctrine/builder-data-v1.json", { cache: "no-store" }),
    fetch("./doctrine/compose-api-v1.json", { cache: "no-store" }),
  ]);

  if (!builderDataResponse.ok) {
    throw new Error(`Builder data returned ${builderDataResponse.status}.`);
  }

  if (!contractResponse.ok) {
    throw new Error(`Compose contract returned ${contractResponse.status}.`);
  }

  const [builderData, contract] = await Promise.all([
    builderDataResponse.json(),
    contractResponse.json(),
  ]);

  return { builderData, contract };
}

function readComposeRequest(root, builderData) {
  const runtime = root.querySelector('[name="runtime"]')?.value || "codex";
  const event = root.querySelector('[name="event"]')?.value || defaultEvent(builderData, runtime);
  const taskIntent = root.querySelector('[name="taskIntent"]')?.value.trim() || "";
  const recipeId = root.querySelector('[name="recipeId"]')?.value || "";
  const operatorNotes = root.querySelector('[name="operatorNotes"]')?.value.trim() || "";
  const params = parseJsonObject(root.querySelector('[name="params"]')?.value || "", "Params");
  const profileIds = selectedCheckboxValues(root, "profileIds");

  if (!taskIntent) {
    throw new Error("Task intent is required.");
  }

  return {
    runtime,
    event,
    taskIntent,
    recipeId,
    profileIds,
    params,
    operatorNotes,
    sessionState: "healthy",
    operatorOverride: false,
    maxChars: 4200,
  };
}

async function composePreview(root, builderData, contract) {
  const request = readComposeRequest(root, builderData);
  const endpoint = composeEndpoint(builderData, contract);

  setStatus(root, "loading", "Composing doctrine preview", endpoint);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(request),
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Compose returned ${response.status}.`);
  }

  setPreview(
    root,
    payload?.craftedInstruction || payload?.craftedPreamble || "",
    payload?.citations || [],
    payload?.warnings || [],
  );
  setStatus(
    root,
    "ready",
    "Compose succeeded",
    `${(payload?.orderedRuleIds || []).length} rules selected for ${payload?.runtime || request.runtime}.`,
  );
}

function renderBuilder(root, builderData, contract) {
  const runtimes = builderData.runtimeCatalog?.runtimes || [];
  const events = builderData.eventCatalog?.events || [];
  const recipes = builderData.recipeCatalog?.recipes || [];
  const runtimeId = runtimes[0]?.id || "codex";
  const eventId = defaultEvent(builderData, runtimeId);
  const recipeId = defaultRecipe(builderData);

  root.innerHTML = `
    <section class="builder-grid">
      <form class="builder-form builder-panel" data-builder-form>
        <div class="builder-meta">
          <div class="builder-field">
            <label for="builder-runtime">Runtime</label>
            <select id="builder-runtime" name="runtime">
              ${runtimes.map((runtime) => `<option value="${escapeHtml(runtime.id)}">${escapeHtml(runtime.label)}</option>`).join("")}
            </select>
          </div>
          <div class="builder-field">
            <label for="builder-event">Lifecycle event</label>
            <select id="builder-event" name="event">
              ${events.map((event) => `<option value="${escapeHtml(event.id)}" ${event.id === eventId ? "selected" : ""}>${escapeHtml(event.label)}</option>`).join("")}
            </select>
          </div>
          <div class="builder-field">
            <label for="builder-recipe">Recipe</label>
            <select id="builder-recipe" name="recipeId">
              ${recipes.map((recipe) => `<option value="${escapeHtml(recipe.id)}" ${recipe.id === recipeId ? "selected" : ""}>${escapeHtml(recipe.label)}</option>`).join("")}
            </select>
          </div>
        </div>

        <div class="builder-field">
          <label for="builder-intent">Task intent</label>
          <textarea id="builder-intent" name="taskIntent" rows="5" placeholder="Implement the doctrine-driven worker launch and verify the queue path."></textarea>
        </div>

        <div class="builder-field">
          <label for="builder-notes">Operator notes</label>
          <textarea id="builder-notes" name="operatorNotes" rows="3" placeholder="Optional notes that bias the compose result."></textarea>
        </div>

        <div class="builder-field">
          <label for="builder-params">Structured params (JSON)</label>
          <textarea id="builder-params" name="params" rows="10"></textarea>
        </div>

        <div class="builder-field">
          <span>Profiles</span>
          <div class="builder-checklist" data-builder-profile-list></div>
        </div>

        <div class="builder-actions">
          <button type="submit" class="btn-primary">Compose Preview</button>
          <a class="btn-secondary" href="${escapeHtml(doctrineHost(builderData))}/doctrine/builder-data-v1.json" target="_blank" rel="noreferrer">Open Builder Data</a>
        </div>
      </form>

      <section class="builder-sidebar builder-panel">
        <div class="builder-status" data-builder-status data-state="idle">
          <p class="type-label">Ready</p>
          <p class="text-secondary">Fill the task intent, then request one crafted doctrine block.</p>
        </div>

        <div class="builder-preview">
          <h3 class="type-ui-title">Crafted Instruction</h3>
          <pre data-builder-preview></pre>
        </div>

        <div class="builder-preview">
          <h3 class="type-ui-title">Citations</h3>
          <ol class="builder-citations" data-builder-citations>
            <li class="text-secondary">No citations returned.</li>
          </ol>
        </div>

        <div class="builder-preview">
          <h3 class="type-ui-title">Warnings</h3>
          <div data-builder-warnings>
            <p class="text-secondary">No warnings.</p>
          </div>
        </div>

        <div class="builder-links">
          <div class="builder-link-row">
            <span class="type-label">Compose API</span>
            <a href="${escapeHtml(composeEndpoint(builderData, contract))}" target="_blank" rel="noreferrer">${escapeHtml(composeEndpoint(builderData, contract))}</a>
          </div>
          <div class="builder-link-row">
            <span class="type-label">Catalog</span>
            <a href="${escapeHtml(builderData.catalogs.semanticRuleCatalogUrl)}" target="_blank" rel="noreferrer">${escapeHtml(builderData.catalogs.semanticRuleCatalogUrl)}</a>
          </div>
        </div>
      </section>
    </section>
  `;

  setRecipeDefaults(root, builderData, runtimeId, recipeId);
  root.querySelector('[name="runtime"]')?.addEventListener("change", () => {
    const nextRuntime = root.querySelector('[name="runtime"]')?.value || runtimeId;
    const nextEvent = root.querySelector('[name="event"]');
    if (nextEvent) {
      nextEvent.value = defaultEvent(builderData, nextRuntime);
    }
    setRecipeDefaults(root, builderData, nextRuntime, root.querySelector('[name="recipeId"]')?.value || recipeId);
  });
  root.querySelector('[name="recipeId"]')?.addEventListener("change", () => {
    const nextRuntime = root.querySelector('[name="runtime"]')?.value || runtimeId;
    const nextRecipe = root.querySelector('[name="recipeId"]')?.value || recipeId;
    setRecipeDefaults(root, builderData, nextRuntime, nextRecipe);
  });
  root.querySelector("[data-builder-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await composePreview(root, builderData, contract);
    } catch (error) {
      setStatus(root, "error", "Compose failed", error instanceof Error ? error.message : String(error));
    }
  });
}

async function mountBuilder(root) {
  if (isBuilderMounted(root)) {
    return;
  }

  root.dataset.builderMounted = "true";
  setStatus(root, "loading", "Loading doctrine catalogs");

  try {
    const { builderData, contract } = await loadBuilderInputs();
    renderBuilder(root, builderData, contract);
  } catch (error) {
    root.innerHTML = `
      <section class="builder-panel">
        <p class="type-label">Doctrine builder unavailable</p>
        <p class="text-secondary">${escapeHtml(error instanceof Error ? error.message : String(error))}</p>
      </section>
    `;
  }
}

function scanForBuilder() {
  const root = document.querySelector(BUILDER_SELECTOR);
  if (!root) {
    return;
  }

  mountBuilder(root).catch((error) => {
    root.innerHTML = `
      <section class="builder-panel">
        <p class="type-label">Doctrine builder unavailable</p>
        <p class="text-secondary">${escapeHtml(error instanceof Error ? error.message : String(error))}</p>
      </section>
    `;
  });
}

function start() {
  if (composeState.mounted) {
    return;
  }

  composeState.mounted = true;
  scanForBuilder();
  composeState.observer = new MutationObserver(() => {
    scanForBuilder();
  });
  composeState.observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
