// Минимальный клиент MCP поверх Streamable HTTP-транспорта.
// Поддерживает ответ как application/json, так и text/event-stream (SSE).
import { httpError } from "./agents.js";

const PROTOCOL_VERSION = "2025-06-18";

function baseHeaders(extra) {
  return {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    ...extra,
  };
}

// Один JSON-RPC запрос. Возвращает { sessionId, message }.
async function rpc(url, headers, message, { expectResponse = true } = {}) {
  let res;
  try {
    res = await fetch(url, { method: "POST", headers: baseHeaders(headers), body: JSON.stringify(message) });
  } catch (e) {
    const cause = e.cause?.message || e.message;
    const certIssue = /certificate|self.?signed|signature|unable to (get|verify)|CERT_/i.test(cause);
    const hint = certIssue
      ? " — похоже на перехват TLS корпоративным прокси. Запусти Framy с FRAMY_INSECURE_TLS=1, чтобы доверять перехваченному соединению."
      : "";
    throw httpError(502, `Не удалось подключиться к MCP-серверу: ${cause}${hint}`);
  }
  const sessionId = res.headers.get("mcp-session-id");

  if (res.status === 401 || res.status === 403) {
    throw httpError(401, "MCP-сервер отклонил авторизацию (401/403). Токен истёк или недействителен.");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw httpError(502, `MCP-сервер вернул ${res.status}: ${body.slice(0, 300)}`);
  }

  if (!expectResponse || res.status === 202) {
    await res.text().catch(() => {});
    return { sessionId, message: null };
  }

  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (ct.includes("text/event-stream")) {
    const msg = await readSseForId(res, message.id);
    return { sessionId, message: msg };
  }
  if (ct.includes("application/json")) {
    return { sessionId, message: await res.json() };
  }
  const txt = await res.text();
  try { return { sessionId, message: JSON.parse(txt) }; } catch { return { sessionId, message: null }; }
}

// Чтение SSE-потока до сообщения с нужным id (или любого ответа с result/error).
async function readSseForId(res, id) {
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        const data = rawEvent
          .split("\n")
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).replace(/^ /, ""))
          .join("\n");
        if (!data) continue;
        try {
          const msg = JSON.parse(data);
          // Берём ответ строго на наш id; запасной вариант — сообщение-ответ без id.
          const isOurResponse =
            msg && (msg.id === id || (msg.id == null && (msg.result !== undefined || msg.error !== undefined)));
          if (isOurResponse) {
            try { await reader.cancel(); } catch { /* noop */ }
            return msg;
          }
        } catch { /* частичный/нерелевантный кусок — ждём дальше */ }
      }
    }
  } finally {
    try { reader.releaseLock(); } catch { /* noop */ }
  }
  return null;
}

function throwOnRpcError(msg, ctx) {
  if (!msg) throw httpError(502, `Пустой ответ от MCP-сервера (${ctx})`);
  if (msg.error) throw httpError(502, `MCP error (${ctx}): ${msg.error.message || JSON.stringify(msg.error)}`);
  return msg.result;
}

// initialize + notifications/initialized. Возвращает заголовки для последующих запросов и serverInfo.
async function handshake(url, headers) {
  const init = await rpc(url, headers, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "framy", version: "1.0.0" },
    },
  });
  const result = throwOnRpcError(init.message, "initialize");
  const protocolVersion = result.protocolVersion || PROTOCOL_VERSION;
  const sh = { ...headers, "MCP-Protocol-Version": protocolVersion };
  if (init.sessionId) sh["Mcp-Session-Id"] = init.sessionId;
  await rpc(url, sh, { jsonrpc: "2.0", method: "notifications/initialized" }, { expectResponse: false });
  return { sh, serverInfo: result.serverInfo || null, protocolVersion };
}

export async function listTools({ url, headers }) {
  const { sh, serverInfo, protocolVersion } = await handshake(url, headers);
  const r = await rpc(url, sh, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const result = throwOnRpcError(r.message, "tools/list");
  return { serverInfo, protocolVersion, tools: result.tools || [] };
}

export async function callTool({ url, headers }, tool, args) {
  const { sh } = await handshake(url, headers);
  const r = await rpc(url, sh, {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: tool, arguments: args || {} },
  });
  return throwOnRpcError(r.message, "tools/call");
}

export { readSseForId };
