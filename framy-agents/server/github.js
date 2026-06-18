import { parseRawAgent, httpError } from "./agents.js";

// Разбор пользовательского ввода в owner/repo/branch/path.
// Поддерживает:
//   https://github.com/owner/repo
//   https://github.com/owner/repo/tree/branch/some/path
//   owner/repo
//   owner/repo/path
export function parseGithubRef(input) {
  if (!input || !String(input).trim()) throw httpError(400, "Укажите ссылку на репозиторий");
  let s = input.trim();
  let branch = null;
  let subPath = "";

  const urlMatch = s.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+)(?:\/(.*))?)?/i);
  if (urlMatch) {
    const [, owner, repoRaw, br, p] = urlMatch;
    return {
      owner,
      repo: repoRaw.replace(/\.git$/, ""),
      branch: br || null,
      path: (p || "").replace(/\/+$/g, ""),
    };
  }

  // короткая форма owner/repo[/path]
  const parts = s.split("/").filter(Boolean);
  if (parts.length < 2) throw httpError(400, "Неверный формат. Пример: owner/repo или ссылка на GitHub");
  const [owner, repo, ...rest] = parts;
  subPath = rest.join("/");
  return { owner, repo: repo.replace(/\.git$/, ""), branch, path: subPath };
}

function ghHeaders() {
  const h = { Accept: "application/vnd.github+json", "User-Agent": "framy" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

async function defaultBranch(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: ghHeaders() });
  if (!res.ok) throw httpError(res.status, `GitHub: репозиторий ${owner}/${repo} недоступен (${res.status})`);
  const json = await res.json();
  return json.default_branch || "main";
}

// Рекурсивно собрать .md файлы (ограничение по глубине, чтобы не уйти в дебри).
async function collectMarkdown(owner, repo, branch, dirPath, depth, acc) {
  if (depth < 0 || acc.length > 200) return;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(dirPath).replace(/%2F/g, "/")}?ref=${branch}`;
  const res = await fetch(url, { headers: ghHeaders() });
  if (!res.ok) {
    if (dirPath === "") throw httpError(res.status, `GitHub: не удалось прочитать содержимое (${res.status})`);
    return;
  }
  const items = await res.json();
  const list = Array.isArray(items) ? items : [items];
  for (const it of list) {
    if (it.type === "file" && it.name.endsWith(".md") && it.name.toLowerCase() !== "readme.md") {
      acc.push(it);
    } else if (it.type === "dir") {
      await collectMarkdown(owner, repo, branch, it.path, depth - 1, acc);
    }
  }
}

// Предпросмотр: найти всех агентов в репозитории/пути.
export async function previewGithub(input) {
  const ref = parseGithubRef(input);
  const branch = ref.branch || (await defaultBranch(ref.owner, ref.repo));

  // Сначала ищем в типичных местах, если путь не задан.
  const searchPaths = ref.path ? [ref.path] : [".claude/agents", "agents", ""];
  let files = [];
  for (const sp of searchPaths) {
    const acc = [];
    try {
      await collectMarkdown(ref.owner, ref.repo, branch, sp, 3, acc);
    } catch (e) {
      if (sp === searchPaths[searchPaths.length - 1] && files.length === 0) throw e;
    }
    if (acc.length) {
      files = acc;
      break;
    }
  }

  const agents = [];
  for (const f of files) {
    try {
      const res = await fetch(f.download_url, { headers: ghHeaders() });
      if (!res.ok) continue;
      const raw = await res.text();
      const parsed = parseRawAgent(raw, f.name.replace(/\.md$/, ""));
      if (parsed.valid) {
        agents.push({ ...parsed, source: `${ref.owner}/${ref.repo}/${f.path}`, raw });
      }
    } catch {
      /* пропускаем */
    }
  }

  return { repo: `${ref.owner}/${ref.repo}`, branch, count: agents.length, agents };
}
