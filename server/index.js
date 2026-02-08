import express from "express";

let fetchImpl = global.fetch;
try {
  if (!fetchImpl) fetchImpl = (await import("node-fetch")).default;
} catch (e) {}

const app = express();

app.use(express.json({ limit: "1mb" }));
app.use(express.text({ type: ["text/*", "application/*+json"], limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON body",
      hint: 'Send {"query":"..."} with Content-Type: application/json',
    });
  }
  next(err);
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isEmail(tok) {
  return /@/.test(tok);
}

function cleanTokens(q) {
  return String(q || "")
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeUsername(u) {
  return String(u || "")
    .trim()
    .replace(/^@/, "")
    .replace(/[^\w.\-]/g, "");
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function clampList(arr, max) {
  return Array.isArray(arr) ? arr.slice(0, max) : [];
}

function includesCI(haystack, needle) {
  return String(haystack || "").toLowerCase().includes(String(needle || "").toLowerCase());
}

function stripTrailingSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}

/**
 * Variant strategy (fixed):
 * - DO generate separator variants (., _, - and collapse).
 * - DO NOT generate numeric suffixes by default (too many false positives).
 * - Only generate numeric suffix variants if the user typed digits in the original input.
 */
function usernameVariants(base, opts = {}) {
  const u = normalizeUsername(base);
  if (!u || u.length < 2) return [];

  const allowNumeric = !!opts.allowNumeric;

  const v = new Set();
  v.add(u);

  const stripped = u.replace(/[._-]/g, "");
  if (stripped && stripped !== u) v.add(stripped);

  if (u.includes(".") || u.includes("-")) v.add(u.replace(/[.-]/g, "_"));
  if (u.includes("_") || u.includes("-")) v.add(u.replace(/[_-]/g, "."));
  if (u.includes("_") || u.includes(".")) v.add(u.replace(/[_.]/g, "-"));

  const firstChunk = u.split(/[._-]/)[0];
  if (firstChunk && firstChunk.length >= 3) v.add(firstChunk);

  const noDigits = u.replace(/\d+$/, "");
  if (noDigits && noDigits !== u) v.add(noDigits);

  if (allowNumeric) {
    v.add(`${u}1`);
    v.add(`${u}01`);
  }

  return Array.from(v).slice(0, 12);
}

function emailToUsernameCandidates(email) {
  const local = String(email || "").split("@")[0] || "";
  const base = normalizeUsername(local);
  if (!base) return [];

  const candidates = new Set(usernameVariants(base, { allowNumeric: false }));

  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    const joined = normalizeUsername(parts.join(""));
    const underscore = normalizeUsername(parts.join("_"));
    const dot = normalizeUsername(parts.join("."));
    const dash = normalizeUsername(parts.join("-"));

    [joined, underscore, dot, dash].forEach((x) => {
      usernameVariants(x, { allowNumeric: false }).forEach((vv) => candidates.add(vv));
    });

    const first = parts[0] || "";
    const last = parts[parts.length - 1] || "";
    if (first && last) {
      const filast = normalizeUsername(first[0] + last);
      usernameVariants(filast, { allowNumeric: false }).forEach((vv) => candidates.add(vv));
    }
  }

  return Array.from(candidates).slice(0, 16);
}

/**
 * Fetch utilities
 */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function headersFor(siteName) {
  const common = {
    "User-Agent": UA,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  };

  if (siteName === "instagram") return { ...common, Referer: "https://www.instagram.com/" };
  if (siteName === "tiktok") return { ...common, Referer: "https://www.tiktok.com/" };
  if (siteName === "threads") return { ...common, Referer: "https://www.threads.net/" };
  if (siteName === "youtube") return { ...common, Referer: "https://www.youtube.com/" };

  return common;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 16000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

function extractMetaUrl(html) {
  const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (canon && canon[1]) return canon[1];

  const og = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i);
  if (og && og[1]) return og[1];

  return "";
}

/**
 * Strict platform checks
 */
const profileSites = [
  {
    name: "instagram",
    expected: (u) => `https://www.instagram.com/${u}/`,
    url: (u) => `https://www.instagram.com/${u}/`,
    notFound: [
      "Sorry, this page isn't available",
      "Sorry, this page isn’t available",
      "The link you followed may be broken",
      "Page Not Found",
      "This page isn't available",
      "This page isn’t available",
    ],
    weight: 1.0,
    requireCanonicalMatch: true,
  },
  {
    name: "threads",
    expected: (u) => `https://www.threads.net/@${u}`,
    url: (u) => `https://www.threads.net/@${u}`,
    notFound: ["Sorry, this page isn't available", "Page isn't available", "This page isn't available"],
    weight: 0.9,
    requireCanonicalMatch: true,
  },
  {
    name: "tiktok",
    expected: (u) => `https://www.tiktok.com/@${u}`,
    url: (u) => `https://www.tiktok.com/@${u}`,
    notFound: [
      "Couldn't find this account",
      "Couldn’t find this account",
      "User not found",
      "\"statusCode\":10202",
      "\"statusCode\":10204",
      "\"user_not_found\"",
    ],
    weight: 0.9,
    requireCanonicalMatch: true,
  },
  {
    name: "youtube",
    expected: (u) => `https://www.youtube.com/@${u}`,
    url: (u) => `https://www.youtube.com/@${u}`,
    notFound: ["This page isn't available", "Not Found", "404"],
    weight: 0.8,
    requireCanonicalMatch: true,
  },
  {
    name: "reddit",
    expected: (u) => `https://www.reddit.com/user/${u}`,
    url: (u) => `https://www.reddit.com/user/${u}`,
    notFound: ["Sorry, nobody on Reddit goes by that name", "page not found"],
    weight: 0.7,
    requireCanonicalMatch: false,
  },
  {
    name: "github",
    expected: (u) => `https://github.com/${u}`,
    url: (u) => `https://github.com/${u}`,
    notFound: ["Not Found", "404"],
    weight: 0.75,
    requireCanonicalMatch: false,
  },
  {
    name: "x",
    expected: (u) => `https://x.com/${u}`,
    url: (u) => `https://x.com/${u}`,
    notFound: [
      "This account doesn’t exist",
      "This account doesn't exist",
      "Try searching for another",
      "Something went wrong",
    ],
    weight: 0.75,
    requireCanonicalMatch: false,
  },
  {
    name: "medium",
    expected: (u) => `https://medium.com/@${u}`,
    url: (u) => `https://medium.com/@${u}`,
    notFound: ["Page not found", "404"],
    weight: 0.55,
    requireCanonicalMatch: false,
  },
  {
    name: "pinterest",
    expected: (u) => `https://www.pinterest.com/${u}/`,
    url: (u) => `https://www.pinterest.com/${u}/`,
    notFound: ["Sorry! We couldn't find that page", "Page not found", "404"],
    weight: 0.55,
    requireCanonicalMatch: false,
  },
];

async function checkProfile(site, username) {
  const u = normalizeUsername(username);
  if (!u || u.length < 2) return { ok: false, url: "", status: 0 };

  const url = site.url(u);
  const expected = site.expected ? site.expected(u) : url;

  let resp;
  try {
    resp = await fetchWithTimeout(
      url,
      { method: "GET", redirect: "follow", headers: headersFor(site.name) },
      17000
    );
  } catch (e) {
    return { ok: false, url, status: 0 };
  }

  const status = resp.status || 0;

  if (status === 403 || status === 429 || status === 999) {
    return { ok: false, url, status, unknown: true };
  }

  let html = "";
  try {
    html = await resp.text();
  } catch (e) {
    html = "";
  }

  const lower = html.toLowerCase();
  const looksNotFound = (site.notFound || []).some((m) => lower.includes(String(m).toLowerCase()));
  if (looksNotFound) {
    return { ok: false, url: resp.url || url, status };
  }

  const metaUrl = extractMetaUrl(html);
  const finalUrl = metaUrl || resp.url || url;

  if (site.requireCanonicalMatch) {
    const a = stripTrailingSlash(finalUrl);
    const b = stripTrailingSlash(expected);
    if (a !== b) {
      return { ok: false, url: finalUrl, status, falsePositive: true };
    }
  }

  return { ok: status >= 200 && status < 400, url: finalUrl, status };
}

/**
 * Improved DDG result parsing:
 * - Only consider real result links (class="result__a")
 * - Decode DDG redirect wrapper (/l/?uddg=...)
 * - Ignore internal duckduckgo.com links
 */
function decodeDdgRedirect(href) {
  try {
    const u = new URL(href, "https://duckduckgo.com");
    // DDG redirect format: /l/?uddg=<encoded>
    const uddg = u.searchParams.get("uddg");
    if (uddg) return decodeURIComponent(uddg);
    return u.href;
  } catch {
    return href;
  }
}

function isBadDdgUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes("duckduckgo.com")) return true;
    return false;
  } catch {
    return true;
  }
}

async function ddgSearch(q) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const r = await fetchWithTimeout(
      url,
      { method: "GET", headers: headersFor("duckduckgo") },
      17000
    );
    const html = await r.text();
    await sleep(220);

    // Match anchors that look like actual search results
    const re = /<a[^>]+class="[^"]*result__a[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;

    let m;
    while ((m = re.exec(html)) !== null) {
      const rawHref = m[1] || "";
      const rawTitle = (m[2] || "").replace(/<[^>]+>/g, "").trim();

      if (!rawHref) continue;

      const decoded = decodeDdgRedirect(rawHref);
      if (!decoded) continue;
      if (isBadDdgUrl(decoded)) continue;

      const title = rawTitle && rawTitle.length >= 3 ? rawTitle : "Search result";
      return { url: decoded, title };
    }
  } catch (e) {}

  return null;
}

/**
 * Core scan handler
 */
async function scanHandler(req, res) {
  let query = "";

  if (req.body && typeof req.body === "object" && typeof req.body.query === "string") {
    query = req.body.query;
  } else if (typeof req.body === "string") {
    const t = req.body.trim();
    if (t.startsWith("{") && t.endsWith("}")) {
      try {
        const parsed = JSON.parse(t);
        if (parsed && typeof parsed.query === "string") query = parsed.query;
      } catch {}
    } else {
      query = req.body;
    }
  } else if (req.body && typeof req.body === "object" && req.body.query != null) {
    query = String(req.body.query || "");
  }

  const toks = uniq(cleanTokens(query));
  const emails = toks.filter(isEmail);

  const rawNonEmails = toks.filter((t) => !isEmail(t));
  const rawUsernames = rawNonEmails.map(normalizeUsername).filter(Boolean);

  const userTypedDigits = rawUsernames.some((u) => /\d/.test(u));

  const pivotUsernames = [];
  for (const e of emails) pivotUsernames.push(...emailToUsernameCandidates(e));

  const expandedUsernames = [];
  for (const u of [...rawUsernames, ...pivotUsernames]) {
    expandedUsernames.push(...usernameVariants(u, { allowNumeric: userTypedDigits }));
  }

  const usernames = clampList(uniq(expandedUsernames), 30);

  const findings = [];
  const platformSet = new Set();
  let riskIndicators = 0;

  const maxUsernamesToScan = 10;
  const perRequestDelayMs = 140;

  for (const u of usernames.slice(0, maxUsernamesToScan)) {
    for (const site of profileSites) {
      const r = await checkProfile(site, u);
      await sleep(perRequestDelayMs);

      if (r.ok) {
        platformSet.add(site.name);
        findings.push({
          entity: u,
          type: "profile",
          source: site.name,
          title: `${u} on ${site.name}`,
          url: r.url,
          confidence: Math.max(0.55, Math.min(0.95, 0.65 + (site.weight || 0.6) * 0.3)),
        });
      }
    }
  }

  // Email public search signals
  for (const e of emails.slice(0, 5)) {
    const r = await ddgSearch(`${e}`);
    if (r) {
      riskIndicators += 1;
      findings.push({
        entity: e,
        type: "search",
        source: "duckduckgo",
        title: r.title,
        url: r.url,
        confidence: 0.55,
      });
    }
  }

  // Username public search signals (very light)
  for (const u of usernames.slice(0, 5)) {
    const q = `${u} site:instagram.com OR site:threads.net OR site:tiktok.com OR site:youtube.com OR site:github.com OR site:reddit.com OR site:x.com`;
    const r = await ddgSearch(q);
    if (r) {
      findings.push({
        entity: u,
        type: "search",
        source: "duckduckgo",
        title: r.title,
        url: r.url,
        confidence: 0.45,
      });
    }
  }

  // Dedup identical URLs
  const seen = new Set();
  const deduped = [];
  for (const f of findings) {
    const key = `${f.source}|${f.url}`;
    if (!f.url || seen.has(key)) continue;
    seen.add(key);
    deduped.push(f);
  }

  const platforms = platformSet.size;
  const totalFindings = deduped.length;

  const confidence =
    platforms >= 4 || riskIndicators >= 3
      ? "HIGH"
      : platforms > 0 || riskIndicators > 0
      ? "MODERATE"
      : "LOW";

  res.json({
    entities: { emails, usernames },
    summary: { totalFindings, platforms, confidence, riskIndicators },
    findings: deduped,
  });
}

app.post("/api/scan", scanHandler);
app.post("/scan", scanHandler);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log("scan api listening", port));
