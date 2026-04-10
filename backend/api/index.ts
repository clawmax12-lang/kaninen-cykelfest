/* eslint-disable @typescript-eslint/no-explicit-any */
export const config = { runtime: "nodejs", maxDuration: 30 };

// Wrapped to catch init errors
let app: any = null;
let initError: Error | null = null;

async function initApp() {
  try {
    console.log("[init] importing app...");
    const m = await import("../src/index.js");
    app = m.app;
    console.log("[init] app ready");
  } catch (err: any) {
    initError = err;
    console.error("[init] FAILED:", err.message, err.stack);
  }
}

// Fire init in background (captures first-request latency too)
const initPromise = initApp();

function collectBody(req: any): Promise<string> {
  return new Promise((resolve) => {
    const parts: string[] = [];
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => parts.push(chunk));
    req.on("end", () => resolve(parts.join("")));
  });
}

export default async function handler(req: any, res: any) {
  await initPromise;

  if (initError || !app) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: String(initError), stack: (initError as any)?.stack }));
    return;
  }

  try {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host || "kaninen-cykelfest-api.vercel.app";
    const url = `${proto}://${host}${req.url}`;

    const headers = new Headers();
    for (const [key, val] of Object.entries(req.headers as Record<string, string | string[]>)) {
      if (val !== undefined && key !== "host") {
        headers.set(key, Array.isArray(val) ? val.join(", ") : val);
      }
    }

    const hasBody = req.method !== "GET" && req.method !== "HEAD";
    const bodyText = hasBody ? await collectBody(req) : undefined;

    const request = new Request(url, {
      method: req.method,
      headers,
      body: bodyText && bodyText.length > 0 ? bodyText : undefined,
    });

    const response = await app.fetch(request);
    res.statusCode = response.status;
    response.headers.forEach((value: string, key: string) => res.setHeader(key, value));
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('spreadsheetml') || contentType.includes('octet-stream')) {
      const arrayBuffer = await response.arrayBuffer();
      res.end(Buffer.from(arrayBuffer));
    } else {
      const responseText = await response.text();
      res.end(responseText);
    }
  } catch (err: any) {
    console.error("Handler error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: String(err), stack: err?.stack }));
  }
}
