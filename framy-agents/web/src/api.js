const base = "";

async function req(method, url, body) {
  const res = await fetch(base + url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Ошибка ${res.status}`);
  return json;
}

export const api = {
  health: () => req("GET", "/api/health"),
  listAgents: () => req("GET", "/api/agents"),
  setModel: (id, model) => req("PATCH", `/api/agents/${encodeURIComponent(id)}/model`, { model }),
  updateAgent: (id, patch) => req("PATCH", `/api/agents/${encodeURIComponent(id)}`, patch),
  createAgent: (agent) => req("POST", "/api/agents", agent),
  deleteAgent: (id) => req("DELETE", `/api/agents/${encodeURIComponent(id)}`),
  githubPreview: (url) => req("POST", "/api/import/github/preview", { url }),
  githubImport: (agents) => req("POST", "/api/import/github", { agents }),
  listConnectors: () => req("GET", "/api/connectors"),
  addConnector: (target, name, definition) => req("POST", "/api/connectors", { target, name, definition }),
  deleteConnector: (id) => req("DELETE", `/api/connectors/${encodeURIComponent(id)}`),
  connectorTools: (id) => req("GET", `/api/connectors/${encodeURIComponent(id)}/tools`),
  connectorCall: (id, tool, args) => req("POST", `/api/connectors/${encodeURIComponent(id)}/call`, { tool, args }),
  openClaude: () => req("POST", "/api/open-claude"),
};

// Запуск задачи через SSE. Возвращает функцию отмены.
export function runTask(id, task, model, onEvent) {
  const params = new URLSearchParams({ task });
  if (model) params.set("model", model);
  const es = new EventSource(`/api/agents/${encodeURIComponent(id)}/run?${params.toString()}`);
  es.onmessage = (e) => {
    try {
      const evt = JSON.parse(e.data);
      onEvent(evt);
      if (evt.type === "done") es.close();
    } catch {
      /* ignore */
    }
  };
  es.onerror = () => {
    onEvent({ type: "error", data: "Соединение прервано" });
    es.close();
  };
  return () => es.close();
}
